"use strict";

import { EFunction } from "arslib";
import { Turnable } from "../Turnable.js";

/**
 * @fileoverview Spinning effect that rotates an agent continuously.
 * Creates a visual spinning animation with configurable duration.
 */

/**
 * Adds spinning behavior to an agent, making it rotate continuously.
 * @param {number} [maxTimeinMilliseconds] - Maximum duration of the spinning effect. If not set, spins until agent dies.
 */
export function Spin(maxTimeinMilliseconds) {
  let DEFAULT_MAX_TIME = 1000;
  let NUM_SPINS = 360;
  let spinTimeInMilliseconds =
    (maxTimeinMilliseconds || DEFAULT_MAX_TIME) / NUM_SPINS;
  let self = this;
  let spinIntervalId;

  Turnable.call(this);

  /**
   * Performs one rotation step clockwise.
   */
  function spin() {
    self.rotateClockwise();
  }

  /**
   * Clears the spinning interval and resets orientation.
   */
  function clearSpin() {
    spinIntervalId && clearInterval(spinIntervalId);
    self.resetOrientation();
  }

  /**
   * Starts the spinning animation.
   * @memberof Spin
   */
  this.startSpinning = function () {
    !spinIntervalId &&
      (spinIntervalId = setInterval(spin, spinTimeInMilliseconds));
    maxTimeinMilliseconds && setTimeout(clearSpin, maxTimeinMilliseconds);
  };

  this.die = EFunction.sequence(clearSpin, this.die, this);
}
