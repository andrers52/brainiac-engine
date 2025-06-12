import { strict as assert } from "assert";
import sinon from "sinon";
import { Action } from "./Action.js";

describe("Action", function () {
  let whatToDo, conditionToMeet, action;

  beforeEach(function () {
    whatToDo = sinon.spy();
    conditionToMeet = sinon.stub().returns(true);
    action = new Action(whatToDo, conditionToMeet);
  });

  it("should throw an error if whatToDo is not a function", function () {
    assert.throws(() => {
      new Action(null, conditionToMeet);
    }, /Test failed: Action expecting a function to execute/);
  });

  it("should throw an error if conditionToMeet is not a function", function () {
    assert.throws(() => {
      new Action(whatToDo, null);
    }, /Test failed: Action expecting a test function/);
  });

  it("should execute the whatToDo function", function () {
    action.execute();
    assert(whatToDo.calledOnce);
  });

  it("should return the action instance after execution", function () {
    const result = action.execute();
    assert.strictEqual(result, action);
  });

  it("should evaluate the conditionToMeet function", function () {
    assert.strictEqual(action.isConditionMet(), true);
  });

  it("should have a static neverSatisfiedCondition method that returns false", function () {
    assert.strictEqual(Action.neverSatisfiedCondition(), false);
  });
});
