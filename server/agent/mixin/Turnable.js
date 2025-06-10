"use strict";

export function Turnable(speed = 1) {
  this.MAX_TURN = 2 * Math.PI;
  this.MIN_TURN = -this.MAX_TURN;
  this.TURNABLE_DEFAULT_ROTATE_ANGLE = (2 * Math.PI) / (360 * speed);
  this.orientation = 0;

  this.resetOrientation = function () {
    this.orientation = 0;
    return this;
  };

  //angle increases counter clockwise in our system
  this.rotateClockwise = function (orientationDelta) {
    orientationDelta = orientationDelta || this.TURNABLE_DEFAULT_ROTATE_ANGLE;
    this.orientation -= orientationDelta;
    if (this.orientation < 0) this.orientation += 2 * Math.PI;
    this.orientation = this.orientation % (2 * Math.PI);
    return this;
  };

  this.rotateCounterclockwise = function (orientationDelta) {
    orientationDelta = orientationDelta || this.TURNABLE_DEFAULT_ROTATE_ANGLE;
    return this.rotateClockwise(-orientationDelta);
  };

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
