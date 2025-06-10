"use strict";

import { EFunction } from "arslib";

import { TimeToLive } from "../TimeToLive.js";

//decrease opacity and die
export function Fade(fadingTime, startRightAway) {
  fadingTime = fadingTime || 2000;
  fadingTime = fadingTime < 1000 ? 1000 : fadingTime; //1 sec min
  //four steps per second
  const numSteps = (4 * fadingTime) / 1000;
  const timePerStep = fadingTime / numSteps;

  let intervalId;
  this.opacity = 1;

  let self = this;
  function fadeImage() {
    self.opacity -= 1 / numSteps;
  }

  this.startFading = function () {
    TimeToLive.call(this, fadingTime);
    !intervalId && (intervalId = setInterval(fadeImage, timePerStep));
  };

  function clearFading() {
    intervalId && clearInterval(intervalId);
  }

  this.die = EFunction.sequence(clearFading, this.die, this);

  //otherwise will be called externally
  startRightAway && this.startFading();
}
