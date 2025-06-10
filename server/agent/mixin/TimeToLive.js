"use strict";

export function TimeToLive(timeToLiveInMilliseconds) {
  let DEFAULT_TIME_TO_LIVE = 5000;
  setTimeout(() => {
    if (this.isAlive) this.die();
  }, timeToLiveInMilliseconds || DEFAULT_TIME_TO_LIVE);
}
