"use strict";

import { Rectangle } from "../../../common/geometry/Rectangle.js";
import { Vector } from "../../../common/geometry/Vector.js";
import { spaceSegments } from "../../singleton/SpaceSegments.js";
import { AgentDefinitions } from "../AgentDefinitions.js";

let agentId = 1;
let agents = {};
function Environment() {
  let worldRectangle;

  this.getAgents = function () {
    return agents;
  };

  this.getCameras = function () {
    return agents.filter((agent) => agent.isCamera);
  };

  this.getAgentCamera = function (agent) {
    return this.getCameras().find((camera) => camera.owner === agent);
  };

  this.addAgent = function (agent) {
    agent.id = agentId;
    spaceSegments.addAgent(agent);
    agents[agentId] = agent;
    agentId++;
  };

  this.getNearbyAgents = function (agent) {
    return spaceSegments.getNearbyAgents(agent);
  };

  this.getNearbyUserAgents = function (agent) {
    let agents = spaceSegments.getNearbyAgents(agent);
    return agents.filter((agent) => agent.isUserAgent());
  };

  this.removeAgent = function (agent) {
    delete agents[agent.id];
    spaceSegments.removeAgent(agent);
  };

  this.checkAgentExists = function (agent) {
    return agents.hasOwnProperty(agent.id);
  };

  function agentIsSingleton(agent) {
    return agent.isSingleton; // *** TODO: REMOVE THIS? ***
  }

  this.killAllAgents = function () {
    // *** TODO *** CHECK: IS THIS NECESSARY? ***
    for (let id in agents) {
      if (!agentIsSingleton(agents[id])) agents[0].die();
    }
    spaceSegments.clear();
  };

  this.updateAgent = function (agent) {
    spaceSegments.updateAgent(agent);
  };

  this.getNearbyAgentsByRectangle = function (encompassingRectangle) {
    return spaceSegments.getNearbyAgentsByRectangle(encompassingRectangle);
  };
  //TEST IF PROPOSED AGENT POSITION HITS ANOTHER AGENT
  //NOTE: return hitting agent or null
  this.otherAgentOverlappingWithProposedRectangle = function (
    agent,
    proposedRectangleInput,
  ) {
    let proposedRectangle = proposedRectangleInput || proposedRectangle; //if not provided uses the agent's own rectangle

    //pre calculated for circle collision
    let agentRadius = proposedRectangle.meanSize() / 2;

    let nearbyAgents = spaceSegments.getNearbyAgents(agent);
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

  let executeBehavior = () => {
    setTimeout(() => {
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

  this.getUserAgents = function () {
    agents.filter((agent) => agent.isUserAgent());
  };

  this.setWorldRectangle = function (size) {
    worldRectangle = new Rectangle(new Vector(), size);
  };

  this.getWorldRectangle = function () {
    return worldRectangle;
  };

  //send fired event to selected agent
  let lastArg;
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

  this.propagateUserEvent = function (event, arg, agent) {
    let ags = agent ? [agent] : spaceSegments.getNearbyAgentsByPosition(arg);
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

  this.start = function (WORLD_WIDTH, WORLD_HEIGHT) {
    worldRectangle = new Rectangle(
      new Vector(),
      new Vector(WORLD_WIDTH, WORLD_HEIGHT),
    );
    spaceSegments.start(WORLD_WIDTH, WORLD_HEIGHT);
    executeBehavior();
  };
}

let environment = new Environment();
export { environment };
