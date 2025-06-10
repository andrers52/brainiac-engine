"use strict";

import { EFunction } from "arslib";
import { Turnable } from "../Turnable.js";

//NOTE: if maxTimeinMilliseconds is not set, the effect will be executed until agent dies
export function Spin(maxTimeinMilliseconds) {
  let DEFAULT_MAX_TIME = 1000;
  let NUM_SPINS = 360;
  let spinTimeInMilliseconds =
    (maxTimeinMilliseconds || DEFAULT_MAX_TIME) / NUM_SPINS;
  let self = this;
  let spinIntervalId;

  Turnable.call(this);

  function spin() {
    self.rotateClockwise();
  }
  function clearSpin() {
    spinIntervalId && clearInterval(spinIntervalId);
    self.resetOrientation();
  }

  this.startSpinning = function () {
    !spinIntervalId &&
      (spinIntervalId = setInterval(spin, spinTimeInMilliseconds));
    maxTimeinMilliseconds && setTimeout(clearSpin, maxTimeinMilliseconds);
  };

  this.die = EFunction.sequence(clearSpin, this.die, this);
}
