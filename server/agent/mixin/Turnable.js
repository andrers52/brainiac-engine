"use strict";

/**
 * @file Mixin that provides rotation and orientation capabilities to agents.
 * @module Turnable
 */

/**
 * Mixin that adds rotation and orientation functionality to agents.
 * Allows agents to rotate clockwise/counterclockwise and calculate angles to face positions.
 *
 * @param {number} [speed=1] - Speed multiplier for rotation. Higher values = slower rotation.
 *
 * @example
 * // Add turnable capability with default speed
 * const agent = new Agent();
 * Turnable.call(agent);
 *
 * @example
 * // Add turnable capability with custom speed
 * const agent = new Agent();
 * Turnable.call(agent, 2); // Half speed rotation
 *
 * @requires The agent must have a rectangle property with center property
 * @mixin
 */
export function Turnable(speed = 1) {
  /** @memberof Turnable
   * @type {number}
   * @description Maximum rotation angle in radians (2π) */
  this.MAX_TURN = 2 * Math.PI;

  /** @memberof Turnable
   * @type {number}
   * @description Minimum rotation angle in radians (-2π) */
  this.MIN_TURN = -this.MAX_TURN;

  /** @memberof Turnable
   * @type {number}
   * @description Default rotation angle per step, adjusted by speed */
  this.TURNABLE_DEFAULT_ROTATE_ANGLE = (2 * Math.PI) / (360 * speed);

  /** @memberof Turnable
   * @type {number}
   * @description Current orientation angle in radians (0 to 2π) */
  this.orientation = 0;

  /**
   * Resets the agent's orientation to 0 radians.
   * @memberof Turnable
   * @returns {Object} This agent instance for method chaining
   */
  this.resetOrientation = function () {
    this.orientation = 0;
    return this;
  };

  /**
   * Rotates the agent clockwise by the specified angle.
   * Note: Angle increases counter-clockwise in the coordinate system.
   * @memberof Turnable
   * @param {number} [orientationDelta] - Angle to rotate in radians.
   *                                     Uses default angle if not specified.
   * @returns {Object} This agent instance for method chaining
   */
  this.rotateClockwise = function (orientationDelta) {
    orientationDelta = orientationDelta || this.TURNABLE_DEFAULT_ROTATE_ANGLE;
    this.orientation -= orientationDelta;
    if (this.orientation < 0) this.orientation += 2 * Math.PI;
    this.orientation = this.orientation % (2 * Math.PI);
    return this;
  };

  /**
   * Rotates the agent counter-clockwise by the specified angle.
   * @memberof Turnable
   * @param {number} [orientationDelta] - Angle to rotate in radians.
   *                                     Uses default angle if not specified.
   * @returns {Object} This agent instance for method chaining
   */
  this.rotateCounterclockwise = function (orientationDelta) {
    orientationDelta = orientationDelta || this.TURNABLE_DEFAULT_ROTATE_ANGLE;
    return this.rotateClockwise(-orientationDelta);
  };

  /**
   * Calculates the angle needed to turn to face a specific position.
   * @memberof Turnable
   * @param {Object} position - Target position to face
   * @param {number} position.x - X coordinate of target position
   * @param {number} position.y - Y coordinate of target position
   * @returns {number} Angle in radians (0 to 2π) to turn to face the position
   */
  this.calculateAngleToTurnToFacePosition = function (position) {
    let agentCenterX = this.rectangle.center.x;
    let agentCenterY = this.rectangle.center.y;
    //find angleToTurn of "agentCenter -> position" brought to origin
    //Note: atan2(Y,X). Order is Y, then X!!!!
    let angleToTurn = Math.atan2(
      position.y - agentCenterY,
      position.x - agentCenterX,
    );
    //convert angleToTurn from [-PI,PI] to [0,2PI]
    if (angleToTurn < 0) angleToTurn = 2 * Math.PI + angleToTurn;
    return angleToTurn;
  };
}
