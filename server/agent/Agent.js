'use strict';

import { Assert } from 'arslib';
import { Rectangle, rect } from '../../common/geometry/Rectangle.js';
import { Vector } from '../../common/geometry/Vector.js';

import { BEServer } from '../BEServer.js'; // Corrected import path

/**
 * @file Core agent system for the Brainiac Engine.
 * Provides the base Agent class with movement, collision detection, and event handling.
 * @module Agent
 */

/**
 * Agent generated events:
 * - onHittingWorldBorder: Called when agent hits world boundary
 * - onCollision(otherAgent): Called when solid agent collides with another solid agent
 * - onOverlapping(overlappingAgent): Called when non-solid agents overlap
 * - onVisible: Called when agent becomes visible to camera
 * - onPartiallyVisible: Called when agent becomes partially visible
 * - onNotVisible: Called when agent becomes not visible
 *
 * External properties that can be set:
 * - isSolid: Whether agent blocks movement of other agents
 * - imageName: Name of the image resource for visual representation
 * - isVisible: Whether agent is rendered on screen
 */

/**
 * Initializes an agent with basic properties and adds it to the environment.
 * @private
 * @param {BEServer} beServer - The BEServer instance.
 * @param {string} imageName - Name of the image resource for the agent
 * @param {Rectangle} [inputRectangle] - Initial rectangle bounds for the agent
 * @param {boolean} isSolid - Whether the agent blocks movement of other agents
 * @returns {Object|null} The initialized agent or null if initialization fails
 */
function agentInitialize(beServer, imageName, inputRectangle, isSolid) {
  this.isAlive = true;
  this.imageName = null;
  this.isVisible = true;
  this.isSolid = isSolid;
  /** @type {BEServer} Reference to the beServer instance */
  this.beServer = beServer;
  /** @type {number} Latency in milliseconds for onMouseMoveHit events */
  this.onMouseMoveHitLatencyInMillis = 10;
  /** @type {Rectangle} Reference to the world boundary rectangle */
  this.worldRectangle = beServer.getEnvironment().getWorldRectangle();

  this.rectangle = inputRectangle || new Rectangle();
  this.imageName = imageName;

  /**
   * Kills the agent and removes it from the environment.
   * @memberof Agent
   */
  this.die = function () {
    this.isAlive = false;
    beServer.getEnvironment().removeAgent(this);
  };

  /**
   * Checks if this agent equals another agent by ID.
   * @memberof Agent
   * @param {Object} other - The other agent to compare with
   * @returns {boolean} True if agents have the same ID
   */
  this.equal = function (other) {
    return this.id === other.id;
  };

  if (this.isSolid) {
    let overlappingAgent = beServer
      .getEnvironment()
      .otherAgentOverlappingWithProposedRectangle(this, this.rectangle);
    if (overlappingAgent && overlappingAgent.isSolid) return null;
  }

  /** @type {boolean} Flag to control mouse move hit event latency */
  let latencyTimePassed = true;

  /**
   * Starts the latency timer for mouse move hit events.
   * @private
   */
  function startLatencyTime() {
    latencyTimePassed = false;
    setTimeout(() => {
      latencyTimePassed = true;
    }, this.onMouseMoveHitLatencyInMillis);
  }

  beServer.getEnvironment().addAgent(this);
  return this;
}

/**
 * Creates a new agent with simplified parameters.
 * @param {BEServer} beServer - The BEServer instance.
 * @param {string} imageName - Name of the image resource for the agent
 * @param {number} [width=100] - Width of the agent in pixels
 * @param {number} [height=100] - Height of the agent in pixels
 * @param {boolean} [isSolid=true] - Whether the agent blocks movement of other agents
 * @param {number} [xPos=0] - Initial X position
 * @param {number} [yPos=0] - Initial Y position
 * @returns {Object|null} The created agent or null if creation fails
 */
let createAgent = function (
  beServer, // Add beServer parameter
  imageName,
  width = 100,
  height = 100,
  isSolid = true,
  xPos = 0,
  yPos = 0,
) {
  return createAgentWithRectangle(
    beServer, // Pass beServer
    imageName,
    rect(xPos, yPos, width, height),
    isSolid,
  );
};

/**
 * Creates a new agent with a specific rectangle.
 * @param {BEServer} beServer - The BEServer instance.
 * @param {string} imageName - Name of the image resource for the agent
 * @param {Rectangle} inputRectangle - Rectangle defining agent's position and size
 * @param {boolean} [isSolid=true] - Whether the agent blocks movement of other agents
 * @returns {Object|null} The created agent or null if creation fails
 */
let createAgentWithRectangle = function (
  beServer, // Add beServer parameter
  imageName,
  inputRectangle,
  isSolid = true,
) {
  let agent = Object.create(proto);
  return agentInitialize.call(
    agent,
    beServer,
    imageName,
    inputRectangle,
    isSolid,
  ); // Pass beServer
};

/**
 * Agent prototype containing all agent methods and properties.
 * @namespace proto
 */
let proto = {
  /**
   * Checks if this agent is controlled by a user.
   * @memberof proto
   * @returns {boolean} True if agent has a valid userId
   */
  isUserAgent() {
    return Number.isInteger(this.userId);
  },

  // isAlive() {
  //   return environment.checkAgentExists(this) :)
  // },

  /**
   * Sets the size of the agent.
   * @memberof proto
   * @param {Vector} newSize - New size vector for the agent
   * @returns {Object} This agent instance for method chaining
   */
  setSize(newSize) {
    this.rectangle.size = newSize;
    return this;
  },

  /**
   * Gets the current size of the agent.
   * @memberof proto
   * @returns {Vector} The agent's current size vector
   */
  getSize() {
    return this.rectangle.size;
  },

  /**
   * Gets the current position of the agent.
   * @memberof proto
   * @returns {Vector} The agent's current position vector
   */
  getPosition() {
    return this.rectangle.getPosition();
  },

  /**
   * Checks if a position hits this agent.
   * @memberof proto
   * @param {Vector} position - Position to test for hit
   * @returns {boolean} True if position is inside agent's rectangle
   */
  checkHit(position) {
    return this.rectangle.checkPointInside(position);
  },

  /**
   * Checks if this agent collides with another agent.
   * @memberof proto
   * @param {Object} anotherAgent - The other agent to check collision with
   * @returns {boolean} True if rectangles intersect
   */
  checkCollision(anotherAgent) {
    return this.rectangle.checkIntersection(anotherAgent.rectangle);
  },

  /**
   * Sets agent to a 2D position (alias for setPosition).
   * @memberof proto
   * @param {Vector} newPosition - Target position vector
   * @param {boolean} [force] - Whether to force the movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
  set2DPosition(newPosition, force) {
    let distance = this.getPosition().vectorDistance(newPosition);
    return this.move(distance, force);
  },

  /**
   * Sets agent to a specific position.
   * @memberof proto
   * @param {Vector} newPosition - Target position vector
   * @param {boolean} [force] - Whether to force the movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
  setPosition(newPosition, force) {
    let distance = this.getPosition().vectorDistance(newPosition);
    return this.move(distance, force);
  },

  /**
   * Forces movement without collision checking.
   * @memberof proto
   * @param {Vector} distance - Distance vector to move
   * @returns {Object} This agent instance for method chaining
   */
  forceMove(distance) {
    Assert.assert(
      typeof distance.x === 'number' && typeof distance.y === 'number',
    );
    Assert.assert(!isNaN(distance.x) && !isNaN(distance.y));

    this.rectangle.move(distance);
    this.beServer.getEnvironment().updateAgent(this); //record last agent position (collision controll)
    return this;
  },

  // let myCamera = null
  /**
   * Checks if the agent can move by the specified distance.
   * Tests for world boundaries and collisions with other agents.
   * @memberof proto
   * @param {Vector} distance - Distance vector to test
   * @returns {Vector|null} The allowed movement vector or null if movement is blocked
   */
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

    let overlappingAgent = this.beServer
      .getEnvironment()
      .otherAgentOverlappingWithProposedRectangle(this, testRectangle);

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

  /**
   * Moves the agent by the specified distance with collision checking.
   * @memberof proto
   * @param {Vector} distance - Distance vector to move
   * @param {boolean} [force] - Whether to force movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
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

  /**
   * Moves the agent up by the specified distance.
   * @memberof proto
   * @param {number} [distanceY=1] - Distance to move up
   * @param {boolean} [force] - Whether to force movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
  moveUp(distanceY, force) {
    distanceY = distanceY === undefined ? 1 : distanceY;
    return this.move(new Vector(0, distanceY), force);
  },

  /**
   * Moves the agent down by the specified distance.
   * @memberof proto
   * @param {number} [distanceY=1] - Distance to move down
   * @param {boolean} [force] - Whether to force movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
  moveDown(distanceY, force) {
    distanceY = distanceY === undefined ? 1 : distanceY;
    return this.move(new Vector(0, -distanceY), force);
  },

  /**
   * Moves the agent left by the specified distance.
   * @memberof proto
   * @param {number} [distanceX=1] - Distance to move left
   * @param {boolean} [force] - Whether to force movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
  moveLeft(distanceX, force) {
    distanceX = distanceX === undefined ? 1 : distanceX;
    return this.move(new Vector(-distanceX, 0), force);
  },

  /**
   * Moves the agent right by the specified distance.
   * @memberof proto
   * @param {number} [distanceX=1] - Distance to move right
   * @param {boolean} [force] - Whether to force movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
  moveRight(distanceX, force) {
    distanceX = distanceX === undefined ? 1 : distanceX;
    return this.move(new Vector(distanceX, 0), force);
  },

  /**
   * Snaps this agent's position to match another agent's position.
   * @memberof proto
   * @param {Object} agent - The agent to snap to
   * @returns {Object} This agent instance for method chaining
   */
  snapToAgent(agent) {
    this.rectangle = agent.rectangle;
    return this;
  },

  /**
   * Moves the agent towards a specific position by a scalar distance.
   * @memberof proto
   * @param {Vector} positionToGetClose - Target position to move towards
   * @param {number} scalarDistanceToMove - Distance to move towards target
   * @returns {Object} This agent instance for method chaining
   */
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

  /**
   * Moves the agent towards another agent by a scalar distance.
   * @memberof proto
   * @param {Object} agent - The target agent to move towards
   * @param {number} scalarDistanceToMove - Distance to move towards target
   * @returns {Object} This agent instance for method chaining
   */
  moveTowardsAnotherAgent(agent, scalarDistanceToMove) {
    this.moveTowardsPosition(agent.getPosition(), scalarDistanceToMove);
    return this;
  },

  /**
   * Moves the agent in a specific orientation by a distance.
   * @memberof proto
   * @param {number} distance - Distance to move
   * @param {number} [orientation] - Orientation angle in radians. Uses agent's orientation if not provided.
   * @param {boolean} [force] - Whether to force movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
  moveTowardsOrientation(distance, orientation, force) {
    orientation = orientation || this.orientation || 0;
    let displacementVect = Vector.makeFromAngleAndSize(orientation, distance);
    return this.move(displacementVect, force);
  },

  /**
   * Sets position relative to another agent.
   * @memberof proto
   * @param {Object} otherAgent - The reference agent
   * @param {string} relativePosition - Position relative to other agent
   * @param {string} [insideOutside="inside"] - Whether to position inside or outside
   * @param {number} [offset=0] - Additional offset distance
   * @param {boolean} [force=false] - Whether to force movement ignoring collisions
   * @returns {boolean} True if positioning was successful
   */
  setPositionRelativeToAgent(
    otherAgent,
    relativePosition,
    insideOutside = 'inside',
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

  /**
   * Moves the agent to a position relative to another agent.
   * @memberof proto
   * @param {Object} otherAgent - The reference agent
   * @param {string} positionRelativeToOtherAgent - Relative position string
   *                 ("above", "below", "left", "right", "aboveRight", "aboveLeft", "belowRight", "belowLeft")
   * @param {number} [padding=1] - Padding distance to avoid collision
   * @param {boolean} [force] - Whether to force movement ignoring collisions
   * @returns {Object} This agent instance for method chaining
   */
  moveRelativeToAgent(
    otherAgent,
    positionRelativeToOtherAgent,
    padding,
    force,
  ) {
    let agentToRectangleTranslations = {
      above: 'topCenter',
      below: 'bottomCenter',
      left: 'leftCenter',
      right: 'rightCenter',
      aboveRight: 'topRight',
      aboveLeft: 'topleft',
      belowRight: 'bottomRight',
      belowLeft: 'bottomLeft',
    };
    Assert.assertIsValidString(
      positionRelativeToOtherAgent,
      Object.keys(agentToRectangleTranslations),
      'Invalid agent relative position',
    );
    padding = padding || 1; //minimum padding to avoid collision
    let newRectangle = this.rectangle.clone();

    newRectangle.setPositionRelativeToRectangle(
      otherAgent.rectangle,
      agentToRectangleTranslations[positionRelativeToOtherAgent],
      'outside',
      padding,
    );
    this.setPosition(newRectangle.center, force);
    return this;
  },
};

export { createAgent, createAgentWithRectangle };
