"use strict";

//NOTE: if maxTimeinMilliseconds is not set, the effect will be executed until agent dies
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

  function pulsate() {
    if (grow) self.rectangle.grow(factor);
    else self.rectangle.shrink(factor);
  }

  this.stopPulsate = function () {
    if (!started) return;
    clearInterval(cycleIntervalId);
    clearInterval(pulsateIntervalId);
    self.rectangle.size = originalRectangleSize.clone();
    started = false;
  };

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
