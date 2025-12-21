'use strict';

import { Assert, EFunction } from 'arslib';

/**
 * @fileoverview Behavior management mixin for agents.
 * Provides functionality to add and aggregate behaviors for agent AI.
 */

/**
 * Adds behavior functionality to an agent, allowing behavior composition and sequencing.
 * @param {Function} behaviorToSet - Initial behavior function to set for the agent.
 * @throws {Error} If behaviorToSet is not provided.
 */
export function HasBehavior(behaviorToSet) {
  Assert.assert(behaviorToSet, 'HasBehavior mixin needs a behavior');

  /**
   * Aggregates a new behavior with existing behaviors.
   * @memberof HasBehavior
   * @param {Function} addedBehavior - Behavior function to add to the sequence.
   */
  this.aggregateBehavior = function (addedBehavior) {
    this.behavior = this.behavior
      ? EFunction.sequence(addedBehavior.bind(this), this.behavior, this)
      : addedBehavior;
  };

  this.aggregateBehavior(behaviorToSet);
}
