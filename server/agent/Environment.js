'use strict';

import { Rectangle } from '../../common/geometry/Rectangle.js';
import { Vector } from '../../common/geometry/Vector.js';
import { SpaceSegments } from '../SpaceSegments.js';
import { AgentDefinitions } from './AgentDefinitions.js';

/**
 * @file Environment that manages all agents in the world.
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

  /** @type {Map<string, Set<Object>>} Event subscription system - maps event names to sets of subscribed agents */
  let eventSubscriptions = new Map();

  /** @type {Set<Object>} Agents that are currently in interactive states (dragging, pressed, etc.) */
  let interactiveAgents = new Set();

  /** @type {Map<Object, Object>} Maps agents to their client cameras for viewport filtering */
  let agentToClientMap = new Map();

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
    return Object.values(agents).filter((agent) => agent.isCamera);
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

    // Clean up event subscriptions
    eventSubscriptions.forEach((subscribers) => {
      subscribers.delete(agent);
    });

    // Remove from interactive state
    interactiveAgents.delete(agent);

    // Remove client mapping
    agentToClientMap.delete(agent);
  };

  /**
   * Checks if an agent exists in the environment.
   * @memberof Environment
   * @param {Object} agent - The agent to check
   * @returns {boolean} True if agent exists
   */
  this.checkAgentExists = function (agent) {
    return Object.prototype.hasOwnProperty.call(agents, agent.id);
  };

  /**
   * Kills all agents in the environment.
   * @memberof Environment
   */
  this.killAllAgents = function () {
    for (let id in agents) {
      agents[id].die();
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

      if (nearbyAgent.isCamera) continue;

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
    return Object.values(agents).filter((agent) => agent.isUserAgent());
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
   * Propagates user events using the improved event system.
   * Uses viewport filtering, event subscriptions, and state-based routing.
   * @memberof Environment
   * @param {string} event - The event name (e.g., 'onKeyDown', 'onMouseDown', etc.)
   * @param {*} arg - Event argument (position for mouse events, key for keyboard events)
   * @param {Object} [clientCamera] - The client camera that generated this event (for viewport filtering)
   * @param {Object} [targetAgent] - Specific agent to target. If provided, bypasses all filtering.
   */
  this.propagateUserEvent = function (event, arg, clientCamera, targetAgent) {
    // If targeting a specific agent, send directly
    if (targetAgent) {
      this.sendEventToAgent(targetAgent, event, arg);
      return;
    }

    // Get agents to receive this event using the new filtering system
    let targetAgents = this.getEventTargetAgents(event, arg, clientCamera);

    // Send events to all target agents
    targetAgents.forEach((agent) => {
      this.sendEventToAgent(agent, event, arg);
    });
  };

  /**
   * Determines which agents should receive a specific event.
   * @memberof Environment
   * @param {string} event - The event name
   * @param {*} arg - Event argument
   * @param {Object} clientCamera - The client camera (for viewport filtering)
   * @returns {Array<Object>} Array of agents that should receive this event
   */
  this.getEventTargetAgents = function (event, arg, clientCamera) {
    let targetAgents = [];

    // 1. Always include agents with event subscriptions
    if (eventSubscriptions.has(event)) {
      eventSubscriptions.get(event).forEach((agent) => {
        if (!targetAgents.includes(agent)) {
          targetAgents.push(agent);
        }
      });
    }

    // 2. For mouse events, include agents in interactive states (dragging, pressed, etc.)
    if (['onMouseMove', 'onMouseUp'].includes(event)) {
      interactiveAgents.forEach((agent) => {
        if (!targetAgents.includes(agent)) {
          targetAgents.push(agent);
        }
      });
    }

    // 3. For all events, include agents visible to the client that generated the event
    if (clientCamera) {
      const visibleAgents = this.getAgentsVisibleToClient(clientCamera);
      visibleAgents.forEach((agent) => {
        if (!targetAgents.includes(agent)) {
          targetAgents.push(agent);
        }
      });
    } else {
      // Fallback: if no camera provided, include all agents (for backward compatibility)
      Object.values(agents).forEach((agent) => {
        if (!targetAgents.includes(agent)) {
          targetAgents.push(agent);
        }
      });
    }

    return targetAgents;
  };

  /**
   * Sends an event to a specific agent, handling hit detection for mouse events.
   * @memberof Environment
   * @param {Object} agent - The agent to send the event to
   * @param {string} event - The event name
   * @param {*} arg - Event argument
   */
  this.sendEventToAgent = function (agent, event, arg) {
    // Check if agent has any handler for this event
    if (!agent[event] && !agent[event + 'Hit']) {
      return;
    }

    // Handle keyboard events directly
    if (event === 'onKeyDown') {
      agent[event] && agent[event](arg);
      return;
    }

    // Handle resize events directly
    if (event === 'onResizeCanvas') {
      agent[event] && agent[event](arg);
      return;
    }

    // Handle mouse events with hit detection
    if (
      ['onMouseDown', 'onMouseUp', 'onMouseMove'].includes(event) &&
      agent.isVisible &&
      arg
    ) {
      const hitResult = agent.checkHit(arg);

      if (hitResult) {
        // Mouse is over this agent - call Hit version
        let hitEventName = event + 'Hit';
        if (agent[hitEventName]) {
          agent[hitEventName](arg);

          // Update interactive state for mouse down
          if (event === 'onMouseDown') {
            this.setAgentInteractive(agent);
          }
        }

        // Remove from interactive state on mouse up (regardless of hit)
        if (event === 'onMouseUp') {
          this.setAgentNonInteractive(agent);
        }
        return;
      }
    }

    // Call general event handler
    if (agent[event]) {
      agent[event](arg);

      // Update interactive state for mouse events
      if (event === 'onMouseDown') {
        this.setAgentInteractive(agent);
      }

      // Remove from interactive state on mouse up
      if (event === 'onMouseUp') {
        this.setAgentNonInteractive(agent);
      }
    }
  };

  /**
   * Subscribes an agent to receive specific events.
   * @memberof Environment
   * @param {Object} agent - The agent to subscribe
   * @param {string|Array<string>} events - Event name(s) to subscribe to
   */
  this.subscribeAgentToEvents = function (agent, events) {
    const eventList = Array.isArray(events) ? events : [events];

    eventList.forEach((event) => {
      if (!eventSubscriptions.has(event)) {
        eventSubscriptions.set(event, new Set());
      }
      eventSubscriptions.get(event).add(agent);
    });
  };

  /**
   * Unsubscribes an agent from specific events.
   * @memberof Environment
   * @param {Object} agent - The agent to unsubscribe
   * @param {string|Array<string>} events - Event name(s) to unsubscribe from
   */
  this.unsubscribeAgentFromEvents = function (agent, events) {
    const eventList = Array.isArray(events) ? events : [events];

    eventList.forEach((event) => {
      if (eventSubscriptions.has(event)) {
        eventSubscriptions.get(event).delete(agent);
      }
    });
  };

  /**
   * Marks an agent as being in an interactive state.
   * @memberof Environment
   * @param {Object} agent - The agent to mark as interactive
   */
  this.setAgentInteractive = function (agent) {
    interactiveAgents.add(agent);
  };

  /**
   * Removes an agent from interactive state.
   * @memberof Environment
   * @param {Object} agent - The agent to remove from interactive state
   */
  this.setAgentNonInteractive = function (agent) {
    interactiveAgents.delete(agent);
  };

  /**
   * Associates an agent with a client camera for viewport filtering.
   * @memberof Environment
   * @param {Object} agent - The agent
   * @param {Object} clientCamera - The client camera that can see this agent
   */
  this.setAgentClient = function (agent, clientCamera) {
    agentToClientMap.set(agent, clientCamera);
  };

  /**
   * Gets agents visible to a specific client camera.
   * @memberof Environment
   * @param {Object} clientCamera - The client camera
   * @returns {Array<Object>} Array of agents visible to this client
   */
  this.getAgentsVisibleToClient = function (clientCamera) {
    if (!clientCamera || !clientCamera.rectangle) {
      return Object.values(agents); // Fallback to all agents if no camera
    }

    // Ensure clientCamera.rectangle is a proper Rectangle instance
    let cameraRect = clientCamera.rectangle;
    if (!cameraRect.checkIntersection) {
      // Convert plain object to Rectangle instance
      // Rectangle expects (centerPoint, size) where both are Vector instances
      cameraRect = new Rectangle(
        new Vector(cameraRect.center?.x || 0, cameraRect.center?.y || 0),
        new Vector(cameraRect.size?.x || 0, cameraRect.size?.y || 0),
      );
    }

    const allAgents = Object.values(agents);

    const visibleAgents = allAgents.filter((agent) => {
      if (!agent.isVisible || !agent.rectangle) {
        return false;
      }

      // Check if agent intersects with camera viewport
      const intersects = agent.rectangle.checkIntersection(cameraRect);
      return intersects;
    });

    return visibleAgents;
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
