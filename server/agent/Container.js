"use strict";

import { Assert, EFunction } from "arslib";
import { Rectangle } from "../../common/geometry/Rectangle.js";
import { Vector } from "../../common/geometry/Vector.js";
import { createAgent } from "./Agent.js";

//contains other agents. Passes along movements and events
//contained agents cannot move by their own
//orientation is "horizontal" or "vertical" and the
//contained agents/widgets will be placed and resized by the container on placement removal of containees

export function createContainer(
  agentsToContain,
  orientation,
  padding,
  rectangle,
) {
  let container = createAgent(null, 100, 100, false);
  orientation &&
    Assert.assertIsValidString(
      orientation,
      ["vertical", "horizontal"],
      "Invalid container orientation given:" + orientation,
    );
  container.isVisible = false; //default
  container.orientation = orientation || "horizontal"; //default orientation
  //if no rectangle given just define a basic one to allow the user to start from that
  container.rectangle = rectangle || new Rectangle(null, new Vector(10, 10));
  container.isSolid = false;
  container.padding = padding || 1; //minimum padding to avoid collision

  let containedCollection = [];

  function adjustAgentsSizes() {
    let totalPadding = container.padding * (containedCollection.length - 1);
    let totalHorizontalSize =
      container.rectangle.size.x -
      (container.orientation === "horizontal" ? totalPadding : 0);
    let agentHorizontalSize =
      totalHorizontalSize /
      (container.orientation === "horizontal" ? containedCollection.length : 1);
    let totalVerticalSize =
      container.rectangle.size.y -
      (container.orientation === "vertical" ? totalPadding : 0);
    let agentVerticalSize =
      totalVerticalSize /
      (container.orientation === "vertical" ? containedCollection.length : 1);
    containedCollection.forEach(function (agent) {
      agent.setSize(new Vector(agentHorizontalSize, agentVerticalSize));
    });
  }

  function placeRemainingAgentsWithFirstAsAnchor() {
    let agentOrientationEquivalence = {
      vertical: "below",
      horizontal: "right",
    };
    containedCollection.forEach(function (agent, index) {
      if (index === 0) return;
      agent.moveRelativeToAgent(
        containedCollection[--index],
        agentOrientationEquivalence[orientation],
        container.padding,
        true,
      );
    });
  }
  function placeAllAgents() {
    let agentSize = containedCollection.first().getSize();
    let xPos, yPos;
    //vertical placement
    if (container.orientation === "vertical") {
      xPos = container.getPosition().x;
      yPos = container.rectangle.topLeft().y - agentSize.y / 2;
    } else {
      //horizontal placement
      yPos = container.getPosition().y;
      xPos = container.rectangle.bottomLeft().x + agentSize.x / 2;
    }
    containedCollection.first().setPosition(new Vector(xPos, yPos), true);
    placeRemainingAgentsWithFirstAsAnchor();
  }

  container.addAgent = function (agent) {
    agent.container = container; //add reference to container in agent
    containedCollection.add(agent);
    adjustAgentsSizes();
    placeAllAgents();
    return container;
  };

  container.removeAgent = function (agent) {
    containedCollection.removeElement(agent);
    adjustAgentsSizes();
    placeAllAgents();

    //enableAgentMovement(agent);
    return container;
  };

  container.getElement = function (indx) {
    return containedCollection[indx];
  };

  container.getCollection = function () {
    return containedCollection;
  };

  // *** INITIALIZATION ***
  //add initially given agent to container
  agentsToContain &&
    agentsToContain.forEach((agent) => container.addAgent(agent));

  //re-write some agent's methods

  //TODO: USE sequence UTILITY FUNCTION?
  //container.onMouseDownHit =
  //       EFunction.sequence(container.onMouseDownHit, startDragging, container);

  //rewrite move to drag all contained agents along
  let originalMove = container.move;
  container.move = function (distance, force) {
    if (!force) {
      if (!container.checkMove(distance)) return false;
      for (let i = 0; i < containedCollection.length; i++) {
        if (!containedCollection[i].checkMove(distance)) return false;
      }
    }

    //every one can move, so, let's do container (no testing needed)!
    //Note that we're using originalMove (agent default move to call everybody's move.
    //container is necessary because we overwrited the contained agent's move.
    originalMove.call(container, distance, true);
    containedCollection.forEach((agent) =>
      originalMove.call(agent, distance, true),
    );
    return true;
  };

  function killAll() {
    for (var i = 0; i < containedCollection.length; i++) {
      containedCollection[i].die();
    }
  }

  let originalDie = container.die;
  container.die = EFunction.sequence(killAll, originalDie, container);

  return container;
}
