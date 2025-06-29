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
  let cycleTime = maxTimeinMilliseconds / 4; // Quarter of total time for each grow/shrink phase
  let NUM_VARIATIONS_PER_CYCLE = 10; //num times it will grow or shrink in a cycle
  let pulsateTime = cycleTime / NUM_VARIATIONS_PER_CYCLE;

  let grow = true;
  let factor = 1.1;
  let self = this;

  let pulsateIntervalId;
  let cycleIntervalId;

  let originalRectangleSize = null;

  // Make started property available on the agent instance
  this.started = false;

  // Keep a reference to update the agent's started property
  const updateStartedProperty = (value) => {
    this.started = value;
    self.started = value;
  };

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
    if (!self.started) return;
    clearInterval(cycleIntervalId);
    clearInterval(pulsateIntervalId);
    if (originalRectangleSize) {
      self.rectangle.size.x = originalRectangleSize.x;
      self.rectangle.size.y = originalRectangleSize.y;
    }
    updateStartedProperty(false);
  };

  /**
   * Starts the pulsating effect with automatic stop after specified duration.
   * @memberof Pulsate
   */
  this.startPulsate = function () {
    if (self.started) return;
    originalRectangleSize = {
      x: self.rectangle.size.x,
      y: self.rectangle.size.y,
    };
    cycleIntervalId = setInterval(function () {
      grow = !grow;
    }, cycleTime);
    pulsateIntervalId = setInterval(pulsate, pulsateTime);
    setTimeout(function () {
      self.stopPulsate();
    }, maxTimeinMilliseconds);
    updateStartedProperty(true);
  };
}
