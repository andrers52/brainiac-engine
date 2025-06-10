"use strict";

import { EFunction } from "arslib";
import { Action } from "./Action.js";

/**
 * @fileoverview Action scheduling system for managing sequential task execution.
 * Provides a queue-based system for executing actions in order with completion testing.
 *
 * Usage Example:
 * actionAgent.addTask(whatToDo, taskCompletionTest);
 */

/**
 * Creates an ActionScheduler that manages a queue of actions to be executed sequentially.
 * Actions are executed in FIFO order and removed when their completion condition is met.
 * @constructor
 */
export function ActionScheduler() {
  let self = this;

  /**
   * @memberof ActionScheduler
   * @type {Action[]}
   * @description Queue of actions to be executed in order.
   */
  this.actions = [];

  /**
   * Executes the first action in the queue.
   * @returns {ActionScheduler} This scheduler instance.
   */
  function executeFirstAction() {
    self.actions[0].execute();
    return self;
  }

  /**
   * Removes the first action from the queue if its completion condition is met.
   * @returns {ActionScheduler} This scheduler instance.
   */
  function removeFirstActionIfFinished() {
    if (self.actions[0].isConditionMet()) {
      self.actions.shift();
    }
    return self;
  }

  /**
   * Executes the current action and removes it if completed.
   * @memberof ActionScheduler
   * @returns {ActionScheduler} This scheduler instance for chaining.
   */
  this.execute = function () {
    if (this.actions.length < 1) {
      return this;
    }
    executeFirstAction();
    removeFirstActionIfFinished();
    return this;
  };

  /**
   * Schedules a new action to be executed.
   * @memberof ActionScheduler
   * @param {Object} owner - The object context for action execution.
   * @param {Function} whatToDo - Function to execute for this action.
   * @param {Function} conditionToMeet - Function that returns true when action is complete.
   * @returns {ActionScheduler} This scheduler instance for chaining.
   */
  this.schedule = function (owner, whatToDo, conditionToMeet) {
    this.actions.push(
      new Action(whatToDo.bind(owner), conditionToMeet.bind(owner)),
    );
    return this;
  };

  this.behavior = EFunction.sequence(this.behavior, this.execute, this);
}
