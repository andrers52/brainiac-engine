"use strict";

import { Assert, EFunction } from "arslib";

import { HasBehavior } from "../HasBehavior.js";

/**
 * @fileoverview Mixin that provides agent following behavior.
 * Allows an agent to follow another agent either by keeping the same position or moving towards it.
 */

/**
 * Adds following behavior to an agent.
 * @param {Object} agentToFollow - The target agent to follow.
 * @param {boolean} [keepSamePosition=false] - If true, follower teleports to the same position as target.
 * @param {number} [speed=1] - Distance to move towards target per behavior iteration.
 * @param {boolean} [forceMove=false] - Whether to force movement even if normally blocked.
 * @throws {Error} If agentToFollow is not provided.
 */
export function FollowsAgent(
  agentToFollow,
  keepSamePosition = false,
  speed = 1,
  forceMove = false,
) {
  Assert.assert(agentToFollow, "FollowsAgent mixin needs an agent To Follow");

  /**
   * The main following behavior function executed each behavior cycle.
   * @returns {Object} This agent instance for chaining.
   */
  function followBehavior() {
    if (keepSamePosition) {
      this.setPosition(agentToFollow.getPosition(), forceMove);
      return this;
    }

    this.moveTowardsAnotherAgent(agentToFollow, speed);
    return this;
  }

  if (!this.behavior) HasBehavior.call(this, followBehavior);
  else this.behavior = EFunction.sequence(this.behavior, followBehavior, this);
}
