"use strict";

import { Rectangle } from "../../common/geometry/Rectangle.js";
import { Vector } from "../../common/geometry/Vector.js";
import { SpaceSegments } from "../SpaceSegments.js";
import { AgentDefinitions } from "./AgentDefinitions.js";

/**
 * @file Environment singleton that manages all agents in the game world.
 * @module Environment
 */

/**
 * Environment class that manages all agents, cameras, and world state.
 * Handles agent lifecycle, collision detection, behavior execution, and user events.
 *
 * @class Environment
 * @constructor
 */
function Environment() {
  /** @type {number} Agent ID counter */
  let agentId = 1;

  /** @type {Object.<number, Object>} Collection of all agents in the environment */
  let agents = {};

  /** @type {Rectangle} The world boundary rectangle */
  let worldRectangle;

  /** @type {SpaceSegments} Spatial indexing system for efficient agent queries */
  let spaceSegments = new SpaceSegments();

  /** @type {boolean} Flag to indicate if environment is stopped */
  this.stopped = false;

  /** @type {number|null} Timer ID for behavior execution */
  this.behaviorTimerId = null;

  /** @type {SpaceSegments} Public reference to spatial indexing system */
  this.spaceSegments = spaceSegments;

  /**
   * Gets all agents in the environment.
   * @memberof Environment
   * @returns {Object.<number, Object>} Object containing all agents indexed by ID
   */
  this.getAgents = function () {
    return agents;
  };

  /**
   * Gets all camera agents in the environment.
   * @memberof Environment
   * @returns {Array<Object>} Array of camera agents
   */
  this.getCameras = function () {
    return agents.filter((agent) => agent.isCamera);
  };

  /**
   * Gets the camera associated with a specific agent.
   * @memberof Environment
   * @param {Object} agent - The agent to find the camera for
   * @returns {Object|undefined} The camera agent or undefined if not found
   */
  this.getAgentCamera = function (agent) {
    return this.getCameras().find((camera) => camera.owner === agent);
  };

  /**
   * Adds an agent to the environment.
   * @memberof Environment
   * @param {Object} agent - The agent to add
   */
  this.addAgent = function (agent) {
    agent.id = agentId;
    this.spaceSegments.addAgent(agent);
    agents[agentId] = agent;
    agentId++;
  };

  /**
   * Gets agents near a specific agent.
   * @memberof Environment
   * @param {Object} agent - The reference agent
   * @returns {Array<Object>} Array of nearby agents
   */
  this.getNearbyAgents = function (agent) {
    return this.spaceSegments.getNearbyAgents(agent);
  };

  /**
   * Gets nearby user agents relative to a specific agent.
   * @memberof Environment
   * @param {Object} agent - The reference agent
   * @returns {Array<Object>} Array of nearby user agents
   */
  this.getNearbyUserAgents = function (agent) {
    let agents = this.spaceSegments.getNearbyAgents(agent);
    return agents.filter((agent) => agent.isUserAgent());
  };

  /**
   * Removes an agent from the environment.
   * @memberof Environment
   * @param {Object} agent - The agent to remove
   */
  this.removeAgent = function (agent) {
    delete agents[agent.id];
    this.spaceSegments.removeAgent(agent);
  };

  /**
   * Checks if an agent exists in the environment.
   * @memberof Environment
   * @param {Object} agent - The agent to check
   * @returns {boolean} True if agent exists
   */
  this.checkAgentExists = function (agent) {
    return agents.hasOwnProperty(agent.id);
  };

  /**
   * Checks if an agent is a singleton agent.
   * @private
   * @param {Object} agent - The agent to check
   * @returns {boolean} True if agent is singleton
   * @todo Remove this? (marked for review)
   */
  function agentIsSingleton(agent) {
    return agent.isSingleton; // *** TODO: REMOVE THIS? ***
  }

  /**
   * Kills all non-singleton agents in the environment.
   * @memberof Environment
   * @todo Check if this is necessary (marked for review)
   */
  this.killAllAgents = function () {
    // *** TODO *** CHECK: IS THIS NECESSARY? ***
    for (let id in agents) {
      if (!agentIsSingleton(agents[id])) agents[id].die();
    }
    this.spaceSegments.clear();
  };

  /**
   * Updates an agent's position in the spatial index.
   * @memberof Environment
   * @param {Object} agent - The agent to update
   */
  this.updateAgent = function (agent) {
    this.spaceSegments.updateAgent(agent);
  };

  /**
   * Gets agents within a specified rectangle area.
   * @memberof Environment
   * @param {Rectangle} encompassingRectangle - The rectangle to search within
   * @returns {Array<Object>} Array of agents within the rectangle
   */
  this.getNearbyAgentsByRectangle = function (encompassingRectangle) {
    return this.spaceSegments.getNearbyAgentsByRectangle(encompassingRectangle);
  };

  /**
   * Tests if a proposed agent position would overlap with another agent.
   * Uses circle-based collision detection for performance.
   * @memberof Environment
   * @param {Object} agent - The agent to test
   * @param {Rectangle} [proposedRectangleInput] - The proposed rectangle position.
   *                                              Uses agent's rectangle if not provided.
   * @returns {Object|null} The overlapping agent or null if no collision
   */
  this.otherAgentOverlappingWithProposedRectangle = function (
    agent,
    proposedRectangleInput,
  ) {
    let proposedRectangle = proposedRectangleInput || proposedRectangle; //if not provided uses the agent's own rectangle

    //pre calculated for circle collision
    let agentRadius = proposedRectangle.meanSize() / 2;

    let nearbyAgents = this.spaceSegments.getNearbyAgents(agent);
    for (let index = 0; index < nearbyAgents.length; index++) {
      let nearbyAgent = nearbyAgents[index];

      if (agent.id === nearbyAgent.id) continue;

      if (nearbyAgent.isSingleton || nearbyAgent.isCamera) continue;

      // *** CIRCLE BASED COLLISION DETECTION ***
      let dist = proposedRectangle.center.distance(
        nearbyAgent.rectangle.center,
      );
      //let agentRadius = proposedRectangle.meanSize()/2;
      let otherAgentRadius = nearbyAgent.rectangle.meanSize() / 2;
      if (dist < agentRadius + otherAgentRadius) {
        return nearbyAgent;
      }
    }
    return null;
  };

  /**
   * Executes behavior for all eligible agents at regular intervals.
   * Only executes behavior for agents near user agents or cameras.
   * @private
   */
  let executeBehavior = () => {
    if (this.stopped) return; // Don't continue if environment is stopped
    this.behaviorTimerId = setTimeout(() => {
      for (let id in agents) {
        if (!agents[id].behavior) continue;
        if (
          !agents[id].isCamera &&
          !agents[id].isUserAgent() &&
          this.getNearbyUserAgents(agents[id]).length === 0
        ) {
          continue;
        }
        agents[id].behavior();
      }
      executeBehavior();
    }, AgentDefinitions.AGENTS_EXECUTION_INTERVAL);
  };

  /**
   * Stops the environment and cleans up resources.
   * @memberof Environment
   */
  this.stop = function () {
    this.stopped = true;
    if (this.behaviorTimerId) {
      clearTimeout(this.behaviorTimerId);
      this.behaviorTimerId = null;
    }
  };

  /**
   * Gets all user agents in the environment.
   * @memberof Environment
   * @returns {Array<Object>} Array of user agents
   */
  this.getUserAgents = function () {
    agents.filter((agent) => agent.isUserAgent());
  };

  /**
   * Sets the world boundary rectangle.
   * @memberof Environment
   * @param {Vector} size - The size of the world rectangle
   */
  this.setWorldRectangle = function (size) {
    worldRectangle = new Rectangle(new Vector(), size);
  };

  /**
   * Gets the world boundary rectangle.
   * @memberof Environment
   * @returns {Rectangle} The world boundary rectangle
   */
  this.getWorldRectangle = function () {
    return worldRectangle;
  };

  /** @type {*} Stores the last argument for event propagation */
  /** @type {*} Stores the last argument for event propagation */
  let lastArg;

  /*
   * Legacy event propagation method (commented out)
   * @deprecated Use propagateUserEvent instead
   */
  /*
  this.propagateUserEvent = function (agent, event, arg) {
    lastArg = arg || lastArg //keep last arg if no new arg is received (mouseDown uses position of mouseMove)
    //key
    if (event === 'onKeyDown') {
      agent.onKeyDown && agent.onKeyDown(arg)
      return
    }
    //mouse
    //EObject.extend(arg, Vector.prototype);
    if (['onMouseDown', 'onMouseUp', 'onMouseMove'].includes(event) &&
    (agent.isVisible) &&
    lastArg &&
    agent.checkHit(lastArg)) { //if there is no arg there is no hit
      let eventToCall = event + 'Hit' //onMouseDownHit, onMouseUpHit, onMouseMoveHit
      agent[eventToCall] && agent[eventToCall](arg)
      return
    }
    agent[event] && agent[event](arg)
  }
*/

  /**
   * Propagates user events to relevant agents.
   * Handles both keyboard and mouse events, including hit detection for mouse events.
   * @memberof Environment
   * @param {string} event - The event name (e.g., 'onKeyDown', 'onMouseDown', etc.)
   * @param {*} arg - Event argument (position for mouse events, key for keyboard events)
   * @param {Object} [agent] - Specific agent to target. If not provided, targets nearby agents.
   */
  this.propagateUserEvent = function (event, arg, agent) {
    let ags = agent
      ? [agent]
      : this.spaceSegments.getNearbyAgentsByPosition(arg);
    ags.forEach((agent) => {
      if (!agent[event] && +!agent[event + "Hit"]) return;
      lastArg = arg || lastArg; //keep last arg if no new arg is received (mouseDown uses position of mouseMove)
      //key
      if (event === "onKeyDown") {
        agent.onKeyDown && agent.onKeyDown(arg);
        return;
      }
      //mouse
      //EObject.extend(arg, Vector.prototype);
      if (
        ["onMouseDown", "onMouseUp", "onMouseMove"].includes(event) &&
        agent.isVisible &&
        lastArg &&
        agent.checkHit(lastArg)
      ) {
        //if there is no arg there is no hit
        let eventToCall = event + "Hit"; //onMouseDownHit, onMouseUpHit, onMouseMoveHit
        agent[eventToCall] && agent[eventToCall](arg);
        return;
      }
      agent[event] && agent[event](arg);
    });
  };

  /**
   * Starts the environment and executes agent behaviors at regular intervals.
   * @memberof Environment
   * @param {number} WORLD_WIDTH - Width of the world in pixels
   * @param {number} WORLD_HEIGHT - Height of the world in pixels
   */
  this.start = function (WORLD_WIDTH, WORLD_HEIGHT) {
    this.stopped = false; // Reset stopped flag
    this.behaviorTimerId = null; // Reset timer ID
    worldRectangle = new Rectangle(
      new Vector(),
      new Vector(WORLD_WIDTH, WORLD_HEIGHT),
    );
    this.spaceSegments.start(WORLD_WIDTH, WORLD_HEIGHT);
    executeBehavior();
  };

  /**
   * Starts the environment for testing without behavior execution.
   * @memberof Environment
   * @param {number} WORLD_WIDTH - Width of the world in pixels
   * @param {number} WORLD_HEIGHT - Height of the world in pixels
   */
  this.startForTests = function (WORLD_WIDTH, WORLD_HEIGHT) {
    this.stopped = false;
    this.behaviorTimerId = null;
    worldRectangle = new Rectangle(
      new Vector(),
      new Vector(WORLD_WIDTH, WORLD_HEIGHT),
    );
    this.spaceSegments.start(WORLD_WIDTH, WORLD_HEIGHT);
    // Don't call executeBehavior() for tests
  };
}

export { Environment };
