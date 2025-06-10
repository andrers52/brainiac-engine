"use strict";

/**
 * @file Mixin that provides automatic agent destruction after a specified time period.
 * @module TimeToLive
 */

/**
 * Mixin that adds time-to-live functionality to agents.
 * Automatically calls the agent's die() method after the specified time period.
 * Useful for temporary objects like bullets, explosions, or temporary effects.
 *
 * @param {number} [timeToLiveInMilliseconds] - Time in milliseconds before the agent dies.
 *                                             Defaults to 5000ms (5 seconds) if not specified.
 *
 * @example
 * // Agent will die after 3 seconds
 * const agent = new Agent();
 * TimeToLive.call(agent, 3000);
 *
 * @example
 * // Agent will die after default 5 seconds
 * const agent = new Agent();
 * TimeToLive.call(agent);
 *
 * @requires The agent must have isAlive property and die() method
 * @mixin
 */
export function TimeToLive(timeToLiveInMilliseconds) {
  /** @constant {number} Default time to live in milliseconds */
  let DEFAULT_TIME_TO_LIVE = 5000;

  setTimeout(() => {
    if (this.isAlive) this.die();
  }, timeToLiveInMilliseconds || DEFAULT_TIME_TO_LIVE);
}
