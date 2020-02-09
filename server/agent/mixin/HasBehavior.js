'use strict'

import Assert from '../../../../arslib/util/assert.js'
import EFunction from '../../../../arslib/enhancements/e-function.js'

export default function HasBehavior (behaviorToSet) {
  Assert.assert(behaviorToSet, 'HasBehavior mixin needs a behavior')

  this.aggregateBehavior = function(addedBehavior) {
    this.behavior = (this.behavior) ? 
      EFunction.sequence(addedBehavior.bind(this), this.behavior, this) :
      addedBehavior
  }

  this.aggregateBehavior(behaviorToSet)  

}

