'use strict'

import Assert from '../../../../../../arslib/util/assert.js'
//NOTE: executes in the context of the owner (this -> agent owning the actions)
export default function Action (whatToDo, conditionToMeet) {
  Assert.assertIsFunction(whatToDo, 'Action expecting a function to execute')
  Assert.assertIsFunction(conditionToMeet, 'Action expecting a test function')

  this.execute = function() {
    whatToDo()
    return this
  }

  this.isConditionMet = conditionToMeet
}

//utility function to create never ending loops
Action.neverSatisfiedCondition = function() {
  return false
}

