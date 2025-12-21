'use strict';

import { Rectangle } from '../../../../common/geometry/Rectangle.js';

/**
 * @fileoverview Asynchronous pulsating effect that alternates between growing width and height.
 * Creates a dynamic visual effect where the agent's width and height pulsate in opposite directions.
 */

/**
 * Adds asynchronous pulsating behavior to an agent.
 * The effect alternates between growing width/shrinking height and vice versa.
 * @param {number} [maxTimeinMilliseconds] - Maximum duration of the effect. If not set, runs until agent dies.
 */
export function AsyncPulsate(maxTimeinMilliseconds) {
  let DEFAULT_MAX_TIME = 2000;
  maxTimeinMilliseconds = maxTimeinMilliseconds || DEFAULT_MAX_TIME;
  let cycleTime = maxTimeinMilliseconds / 2; //time to grow and shrink
  let NUM_VARIATIONS_PER_CYCLE = 10; //num times it will grow or shrink in a cycle
  let pulsateTime = cycleTime / NUM_VARIATIONS_PER_CYCLE;

  let widthGrow = true; //height grow is the inverse of this
  let factor = 0.05;
  let self = this;

  let asyncPulsateIntervalId;
  let cycleIntervalId;
  let started = false;

  let originalRectangleSize = new Rectangle();

  /**
   * Performs one step of the asynchronous pulsate animation.
   * Grows one dimension while shrinking the other.
   */
  function asyncPulsate() {
    if (widthGrow) {
      self.rectangle.size.x += self.rectangle.size.x * factor;
      self.rectangle.size.y -= self.rectangle.size.y * factor;
    } else {
      self.rectangle.size.x -= self.rectangle.size.x * factor;
      self.rectangle.size.y += self.rectangle.size.y * factor;
    }
  }

  /**
   * Stops the pulsating effect and restores original size.
   * @memberof AsyncPulsate
   */
  this.stopPulsate = function () {
    if (!started) return;
    clearInterval(cycleIntervalId);
    clearInterval(asyncPulsateIntervalId);
    self.rectangle.size = originalRectangleSize.clone();
    widthGrow = true;
    started = false;
  };

  /**
   * Toggles the growth direction and resets size if needed.
   */
  function loop() {
    if (!widthGrow) self.rectangle.size = originalRectangleSize.clone();
    widthGrow = !widthGrow;
  }

  /**
   * Starts the pulsating effect.
   * @memberof AsyncPulsate
   */
  this.startPulsate = function () {
    if (started) return;
    originalRectangleSize = this.rectangle.size.clone();
    cycleIntervalId = setInterval(loop, cycleTime);
    asyncPulsateIntervalId = setInterval(asyncPulsate, pulsateTime);
    started = true;
  };
}
