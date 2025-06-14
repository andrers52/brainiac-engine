"use strict";
import { Assert } from "arslib";
import { Vector } from "../../../common/geometry/Vector.js";
import { BEServer } from "../../singleton/BEServer.js";

/**
 * @fileoverview World boundary sensing system for agents.
 * Detects when an agent is approaching the edges of the game world.
 *
 * Generated Event:
 * - onSensingWorldBorder(relativeCollisionVector) - Receives collision vector indicating border direction(s)
 */

/**
 * Adds world border sensing capabilities to an agent.
 * @param {number} [sensingDistanceInput] - Distance ahead to sense for world borders.
 * @throws {Error} If agent doesn't implement onSensingWorldBorder event handler.
 */
export function SensingWorldBorder(sensingDistanceInput) {
  Assert.assert(
    this.onSensingWorldBorder,
    "Error: added SensingWorldBorder to agent without implementing onSensingWorldBorder event handler",
  );

  let DEFAULT_SENSING_DISTANCE = 50;
  let sensingDistance = sensingDistanceInput || DEFAULT_SENSING_DISTANCE;
  let self = this;

  let upVector = new Vector(0, sensingDistance);
  let downVector = new Vector(0, -sensingDistance);
  let leftVector = new Vector(-sensingDistance, 0);
  let rightVector = new Vector(sensingDistance, 0);

  function getSensingBorderDirections() {
    //RETURN null or relative collision vector
    let resultVector = new Vector();

    let upPosition = self.getPosition().clone().add(upVector);
    let downPosition = self.getPosition().clone().add(downVector);
    let leftPosition = self.getPosition().clone().add(leftVector);
    let rightPosition = self.getPosition().clone().add(rightVector);

    if (
      !BEServer.getEnvironment()
        .getWorldRectangle()
        .checkPointInside(upPosition)
    )
      resultVector.add(upVector);
    if (
      !BEServer.getEnvironment()
        .getWorldRectangle()
        .checkPointInside(downPosition)
    )
      resultVector.add(downVector);
    if (
      !BEServer.getEnvironment()
        .getWorldRectangle()
        .checkPointInside(leftPosition)
    )
      resultVector.add(leftVector);
    if (
      !BEServer.getEnvironment()
        .getWorldRectangle()
        .checkPointInside(rightPosition)
    )
      resultVector.add(rightVector);

    return resultVector.equal(new Vector()) ? null : resultVector;
  }
  //replace move
  (() => {
    let originalMove = this.move;
    this.move = function (distance, force) {
      let relativeCollisionVector = getSensingBorderDirections();
      relativeCollisionVector &&
        this.onSensingWorldBorder(relativeCollisionVector);
      return originalMove.call(this, distance, force);
    };
  })();
}
