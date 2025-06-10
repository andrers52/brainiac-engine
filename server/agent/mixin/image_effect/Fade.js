"use strict";

import { EFunction } from "arslib";

import { TimeToLive } from "../TimeToLive.js";

/**
 * @fileoverview Fade effect that gradually decreases opacity until the agent dies.
 * Provides smooth visual transition as agents fade out over time.
 */

/**
 * Adds fading behavior to an agent, gradually decreasing opacity and setting time to live.
 * @param {number} [fadingTime=2000] - Duration of the fade effect in milliseconds (minimum 1000ms).
 * @param {boolean} [startRightAway] - Whether to start fading immediately upon creation.
 */
export function Fade(fadingTime, startRightAway) {
  fadingTime = fadingTime || 2000;
  fadingTime = fadingTime < 1000 ? 1000 : fadingTime; //1 sec min
  //four steps per second
  const numSteps = (4 * fadingTime) / 1000;
  const timePerStep = fadingTime / numSteps;

  let intervalId;

  /**
   * @memberof Fade
   * @type {number}
   * @description Current opacity level of the agent (0-1).
   */
  this.opacity = 1;

  let self = this;

  /**
   * Decreases the agent's opacity by one step.
   */
  function fadeImage() {
    self.opacity -= 1 / numSteps;
  }

  /**
   * Starts the fading process, setting time to live and beginning opacity reduction.
   * @memberof Fade
   */
  this.startFading = function () {
    TimeToLive.call(this, fadingTime);
    !intervalId && (intervalId = setInterval(fadeImage, timePerStep));
  };

  /**
   * Clears the fading interval when called.
   */
  function clearFading() {
    intervalId && clearInterval(intervalId);
  }

  this.die = EFunction.sequence(clearFading, this.die, this);

  //otherwise will be called externally
  startRightAway && this.startFading();
}
