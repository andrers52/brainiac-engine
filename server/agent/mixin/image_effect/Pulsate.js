"use strict";

/**
 * @fileoverview Standard pulsating effect that grows and shrinks the agent uniformly.
 * Creates a breathing-like visual effect with configurable duration.
 */

/**
 * Adds pulsating behavior to an agent, making it grow and shrink rhythmically.
 * @param {number} [maxTimeinMilliseconds] - Maximum duration of the effect. If not set, runs until agent dies.
 */
export function Pulsate(maxTimeinMilliseconds) {
  let DEFAULT_MAX_TIME = 2000;
  maxTimeinMilliseconds = maxTimeinMilliseconds || DEFAULT_MAX_TIME;
  let cycleTime = maxTimeinMilliseconds / 2; //time to grow and shrink
  let NUM_VARIATIONS_PER_CYCLE = 10; //num times it will grow or shrink in a cycle
  let pulsateTime = cycleTime / NUM_VARIATIONS_PER_CYCLE;

  let grow = true;
  let factor = 1.1;
  let self = this;

  let pulsateIntervalId;
  let cycleIntervalId;

  let originalRectangleSize = null;

  let started = false;

  /**
   * Performs one step of the pulsate animation.
   * Grows or shrinks the agent's rectangle based on current direction.
   */
  function pulsate() {
    if (grow) self.rectangle.grow(factor);
    else self.rectangle.shrink(factor);
  }

  /**
   * Stops the pulsating effect and restores original size.
   * @memberof Pulsate
   */
  this.stopPulsate = function () {
    if (!started) return;
    clearInterval(cycleIntervalId);
    clearInterval(pulsateIntervalId);
    self.rectangle.size = originalRectangleSize.clone();
    started = false;
  };

  /**
   * Starts the pulsating effect with automatic stop after specified duration.
   * @memberof Pulsate
   */
  this.startPulsate = function () {
    if (started) return;
    originalRectangleSize = this.rectangle.size.clone();
    cycleIntervalId = setInterval(function () {
      grow = !grow;
    }, cycleTime);
    pulsateIntervalId = setInterval(pulsate, pulsateTime);
    setTimeout(this.stopPulsate, maxTimeinMilliseconds);
    started = true;
  };
}
