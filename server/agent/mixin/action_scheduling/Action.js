'use strict';

import { Assert } from 'arslib';

/**
 * @fileoverview Action class for defining executable actions with completion conditions.
 * Used in action scheduling systems to define tasks that can be executed and tested for completion.
 */

/**
 * Creates an Action that can be executed and tested for completion.
 * Actions execute in the context of their owner (this -> agent owning the actions).
 * @constructor
 * @param {Function} whatToDo - Function to execute when the action runs.
 * @param {Function} conditionToMeet - Function that returns true when action is complete.
 * @throws {Error} If whatToDo or conditionToMeet are not functions.
 */
export function Action(whatToDo, conditionToMeet) {
  Assert.assertIsFunction(whatToDo, 'Action expecting a function to execute');
  Assert.assertIsFunction(conditionToMeet, 'Action expecting a test function');

  /**
   * Executes the action's function.
   * @memberof Action
   * @returns {Action} This action instance for chaining.
   */
  this.execute = function () {
    whatToDo();
    return this;
  };

  /**
   * @memberof Action
   * @type {Function}
   * @description Function that tests if the action's completion condition is met.
   */
  this.isConditionMet = conditionToMeet;
}

/**
 * Utility function to create never-ending loops.
 * @static
 * @memberof Action
 * @returns {boolean} Always returns false, creating an infinite action.
 */
Action.neverSatisfiedCondition = function () {
  return false;
};
