"use strict";

import { Assert, EFunction } from "arslib";

import { HasBehavior } from "../HasBehavior.js";

//agentToFolow -> agent to aproach
//speed -> distance to get close to agentToFollow by each behavior iteration
//keepSamePosition -> if true the follower just keeps at the same position of the followed agent
export function FollowsAgent(
  agentToFollow,
  keepSamePosition = false,
  speed = 1,
  forceMove = false,
) {
  Assert.assert(agentToFollow, "FollowsAgent mixin needs an agent To Follow");

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
