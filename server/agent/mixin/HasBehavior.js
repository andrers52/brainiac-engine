"use strict";

import { Assert, EFunction } from "arslib";

export function HasBehavior(behaviorToSet) {
  Assert.assert(behaviorToSet, "HasBehavior mixin needs a behavior");

  this.aggregateBehavior = function (addedBehavior) {
    this.behavior = this.behavior
      ? EFunction.sequence(addedBehavior.bind(this), this.behavior, this)
      : addedBehavior;
  };

  this.aggregateBehavior(behaviorToSet);
}
