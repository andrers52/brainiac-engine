"use strict";

import { Assert } from "arslib";
import { Rectangle, rect } from "../../common/geometry/Rectangle.js";
import { Vector } from "../../common/geometry/Vector.js";

import { environment } from "./singleton/Environment.js";

//agent generated events (needed by move test)
//onHittingWorldBorder
//onCollision(otherAgent)
//onOverlapping(overlappingAgent)
//onVisible
//onPartiallyVisible
//onNotVisible

// external properties:
//isSolid
// imageName
// isVisible

function agentInitialize(imageName, inputRectangle, isSolid) {
  this.isAlive = true;
  this.imageName = null;
  this.isVisible = true;
  this.isSolid = isSolid;
  this.onMouseMoveHitLatencyInMillis = 10;
  this.worldRectangle = environment.getWorldRectangle();

  this.rectangle = inputRectangle || new Rectangle();
  this.imageName = imageName;

  this.die = function () {
    this.isAlive = false;
    environment.removeAgent(this);
  };
  this.equal = function (other) {
    return this.id === other.id;
  };

  if (this.isSolid) {
    let overlappingAgent =
      environment.otherAgentOverlappingWithProposedRectangle(
        this,
        this.rectangle,
      );
    if (overlappingAgent && overlappingAgent.isSolid) return null;
  }

  let latencyTimePassed = true;

  function startLatencyTime() {
    latencyTimePassed = false;
    setTimeout(() => {
      latencyTimePassed = true;
    }, this.onMouseMoveHitLatencyInMillis);
  }
  environment.addAgent(this);
  return this;
}

//use this to create a new agent (simplified)
let createAgent = function (
  imageName,
  width = 100,
  height = 100,
  isSolid = true,
  xPos = 0,
  yPos = 0,
) {
  return createAgentWithRectangle(
    imageName,
    rect(xPos, yPos, width, height),
    isSolid,
  );
};

//use this to create a new agent with specific rectangle
let createAgentWithRectangle = function (
  imageName,
  inputRectangle,
  isSolid = true,
) {
  let agent = Object.create(proto);
  return agentInitialize.call(agent, imageName, inputRectangle, isSolid);
};

let proto = {
  isUserAgent() {
    return Number.isInteger(this.userId);
  },

  // isAlive() {
  //   return environment.checkAgentExists(this) :)
  // },

  setSize(newSize) {
    this.rectangle.size = newSize;
    return this;
  },

  getSize() {
    return this.rectangle.size;
  },

  getPosition() {
    return this.rectangle.getPosition();
  },

  checkHit(position) {
    return this.rectangle.checkPointInside(position);
  },

  checkCollision(anotherAgent) {
    return this.rectangle.checkIntersection(anotherAgent.rectangle);
  },

  set2DPosition(newPosition, force) {
    let distance = this.getPosition().vectorDistance(newPosition);
    return this.move(distance, force);
  },

  setPosition(newPosition, force) {
    let distance = this.getPosition().vectorDistance(newPosition);
    return this.move(distance, force);
  },

  forceMove(distance) {
    Assert.assert(
      typeof distance.x === "number" && typeof distance.y === "number",
    );
    Assert.assert(!isNaN(distance.x) && !isNaN(distance.y));

    this.rectangle.move(distance);
    environment.updateAgent(this); //record last agent position (collision controll)
    return this;
  },

  // let myCamera = null
  //return null if cannot move at all or modified moviment vector if can move along world border.
  checkMove(distance) {
    // Assert.assert(typeof distance !== 'undefined')
    // Assert.assertIsNumber(distance.x)
    // Assert.assertIsNumber(distance.y)

    let testRectangle = this.rectangle.clone();

    testRectangle.move(distance);

    //hiting world border or out of the world?
    if (!this.worldRectangle.checkInside(testRectangle)) {
      //!this.rectangle.isMovingToInsideOfOtherRectangle(distance, this.worldRectangle)) {
      this.onHittingWorldBorder && this.onHittingWorldBorder(); //call agent event
      return null;

      // *** try moving along a single axis ***
      // ***(remove "return" above before uncommenting) ***
      //X
      // let testRectangleMovingX = this.rectangle.clone()
      // let distanceMovingX = distance.clone()
      // distanceMovingX.y = 0
      // testRectangleMovingX.move(distanceMovingX)
      // if (this.worldRectangle.checkInside(testRectangleMovingX))
      //   return distanceMovingX

      //Y
      // let testRectangleMovingY = this.rectangle.clone()
      // let distanceMovingY = distance.clone()
      // distanceMovingY.x = 0
      // testRectangleMovingY.move(distanceMovingY)
      // if (this.worldRectangle.checkInside(testRectangleMovingY))
      //   return distanceMovingY
    }

    let overlappingAgent =
      environment.otherAgentOverlappingWithProposedRectangle(
        this,
        testRectangle,
      );

    if (
      !overlappingAgent ||
      !overlappingAgent.isAlive ||
      overlappingAgent.isCamera
    )
      return distance;

    //test onCollision and onOverlapping
    if (this.isSolid && overlappingAgent.isSolid) {
      //call collision event for both agents (the ones that implement the handler)
      this.onCollision && this.onCollision(overlappingAgent);
      overlappingAgent.onCollision && overlappingAgent.onCollision(this);
      if (
        this.rectangle.isMovingToInsideOfOtherRectangle(
          distance,
          overlappingAgent.rectangle,
        )
      )
        return null;
    } else if (this.isVisible && overlappingAgent.isVisible) {
      //agents are overlapping
      this.onOverlapping && this.onOverlapping(overlappingAgent);
      overlappingAgent.onOverlapping && overlappingAgent.onOverlapping(this);
    }

    // died because of an event. Cannot move because it would cause error...
    if (!this.isAlive) return null;

    // Assert.assertIsNumber(distance.x)
    // Assert.assertIsNumber(distance.y)

    return distance; // ok!

    // camera = camera || environment.getAgentCamera(this)
    //if(!canMove) return false;
    // *** TODO: TEST RELATIVE TO ALL CAMERAS ***
    // //warn agent about visibility status
    // if (camera.canBeSeen(this.rectangle)) {
    //   this.onVisible && this.onVisible();
    // } else {
    //   if (!camera.canBeSeen(this.rectangle)) {
    //     this.onNotVisible && this.onNotVisible();
    //   } else {
    //     this.onPartiallyVisible && this.onPartiallyVisible();
    //   }
    // }
    //return distance;
  },

  move(distance, force) {
    // Assert.assert(distance instanceof Vector, 'Agent#move: distance is not a Vector')
    // Assert.assertIsNumber(this.rectangle.center.x)
    // Assert.assertIsNumber(this.rectangle.center.y)
    // Assert.assertIsNumber(distance.x)
    // Assert.assertIsNumber(distance.y)

    if (force || this.isCamera) {
      this.forceMove(distance);
      return true;
    }

    if (!distance.x && !distance.y) return true; //not moving...

    let distanceVectorAllowedToMove = this.checkMove(distance);

    if (distanceVectorAllowedToMove) {
      Assert.assertIsNumber(distanceVectorAllowedToMove.x);
      Assert.assertIsNumber(distanceVectorAllowedToMove.y);

      this.forceMove(distanceVectorAllowedToMove);
      return true;
    }

    return false;
  },

  moveUp(distanceY, force) {
    distanceY = distanceY === undefined ? 1 : distanceY;
    return this.move(new Vector(0, distanceY), force);
  },

  moveDown(distanceY, force) {
    distanceY = distanceY === undefined ? 1 : distanceY;
    return this.move(new Vector(0, -distanceY), force);
  },

  moveLeft(distanceX, force) {
    distanceX = distanceX === undefined ? 1 : distanceX;
    return this.move(new Vector(-distanceX, 0), force);
  },

  moveRight(distanceX, force) {
    distanceX = distanceX === undefined ? 1 : distanceX;
    return this.move(new Vector(distanceX, 0), force);
  },

  snapToAgent(agent) {
    this.rectangle = agent.rectangle;
    return this;
  },

  moveTowardsPosition(positionToGetClose, scalarDistanceToMove) {
    let vectorDistanceFromTarget =
      this.getPosition().vectorDistance(positionToGetClose);
    let vectorDistanceFromTargetToMove = vectorDistanceFromTarget
      .clone()
      .adjustToSize(scalarDistanceToMove);

    if (scalarDistanceToMove > vectorDistanceFromTarget.size()) {
      this.move(vectorDistanceFromTarget);
    } else {
      this.move(vectorDistanceFromTargetToMove);
    }
    return this;
  },

  moveTowardsAnotherAgent(agent, scalarDistanceToMove) {
    this.moveTowardsPosition(agent.getPosition(), scalarDistanceToMove);
    return this;
  },

  moveTowardsOrientation(distance, orientation, force) {
    orientation = orientation || this.orientation || 0;
    let displacementVect = Vector.makeFromAngleAndSize(orientation, distance);
    return this.move(displacementVect, force);
  },

  setPositionRelativeToAgent(
    otherAgent,
    relativePosition,
    insideOutside = "inside",
    offset = 0,
    force = false,
  ) {
    let newRectangle = this.rectangle.clone();

    newRectangle.setPositionRelativeToRectangle(
      otherAgent.rectangle,
      relativePosition,
      insideOutside,
      offset,
    );
    return this.setPosition(newRectangle.center, force);
  },

  moveRelativeToAgent(
    otherAgent,
    positionRelativeToOtherAgent,
    padding,
    force,
  ) {
    let agentToRectangleTranslations = {
      above: "topCenter",
      below: "bottomCenter",
      left: "leftCenter",
      right: "rightCenter",
      aboveRight: "topRight",
      aboveLeft: "topleft",
      belowRight: "bottomRight",
      belowLeft: "bottomLeft",
    };
    Assert.assertIsValidString(
      positionRelativeToOtherAgent,
      Object.keys(agentToRectangleTranslations),
      "Invalid agent relative position",
    );
    padding = padding || 1; //minimum padding to avoid collision
    let newRectangle = this.rectangle.clone();

    newRectangle.setPositionRelativeToRectangle(
      otherAgent.rectangle,
      agentToRectangleTranslations[positionRelativeToOtherAgent],
      "outside",
      padding,
    );
    this.setPosition(newRectangle.center, force);
    return this;
  },
};

export { createAgent, createAgentWithRectangle };
