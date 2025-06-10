"use strict";

import { Rectangle } from "../../../../common/geometry/Rectangle.js";

//TODO: CHECK POSSIBILITY OF MERGING WITH PULSATE EFFECT
//NOTE: if maxTimeinMilliseconds is not set, the effect will be executed until agent dies
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

  function asyncPulsate() {
    if (widthGrow) {
      self.rectangle.size.x += self.rectangle.size.x * factor;
      self.rectangle.size.y -= self.rectangle.size.y * factor;
    } else {
      self.rectangle.size.x -= self.rectangle.size.x * factor;
      self.rectangle.size.y += self.rectangle.size.y * factor;
    }
  }

  this.stopPulsate = function () {
    if (!started) return;
    clearInterval(cycleIntervalId);
    clearInterval(asyncPulsateIntervalId);
    self.rectangle.size = originalRectangleSize.clone();
    widthGrow = true;
    started = false;
  };

  function loop() {
    if (!widthGrow) self.rectangle.size = originalRectangleSize.clone();
    widthGrow = !widthGrow;
  }

  this.startPulsate = function () {
    if (started) return;
    originalRectangleSize = this.rectangle.size.clone();
    cycleIntervalId = setInterval(loop, cycleTime);
    asyncPulsateIntervalId = setInterval(asyncPulsate, pulsateTime);
    started = true;
  };
}
