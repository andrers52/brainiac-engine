"use strict";

import { EFunction } from "arslib";
import { Action } from "./Action.js";

//   *** USAGE EXAMPLE***
//actionAgent.addTask(whatToDo, taskCompletionTest);

export function ActionScheduler() {
  let self = this;
  this.actions = [];

  function executeFirstAction() {
    self.actions[0].execute();
    return self;
  }

  function removeFirstActionIfFinished() {
    if (self.actions[0].isConditionMet()) {
      self.actions.shift();
    }
    return self;
  }

  this.execute = function () {
    if (this.actions.length < 1) {
      return this;
    }
    executeFirstAction();
    removeFirstActionIfFinished();
    return this;
  };

  //add action to be executed
  this.schedule = function (owner, whatToDo, conditionToMeet) {
    this.actions.push(
      new Action(whatToDo.bind(owner), conditionToMeet.bind(owner)),
    );
    return this;
  };

  this.behavior = EFunction.sequence(this.behavior, this.execute, this);
}
