import { strict as assert } from "assert";
import sinon from "sinon";
import { HasBehavior } from "../../../../server/agent/mixin/HasBehavior.js";

describe("HasBehavior", function () {
  it("should throw an error if no behavior is provided", function () {
    assert.throws(() => {
      HasBehavior.call({});
    }, /HasBehavior mixin needs a behavior/);
  });

  it("should set the initial behavior", function () {
    const behavior = sinon.spy();
    const agent = {};
    HasBehavior.call(agent, behavior);
    assert.strictEqual(agent.behavior, behavior);
  });

  it("should aggregate behaviors", function () {
    const behavior1 = sinon.spy();
    const behavior2 = sinon.spy();
    const agent = {};

    HasBehavior.call(agent, behavior1);
    agent.aggregateBehavior(behavior2);

    assert.strictEqual(typeof agent.behavior, "function");
    agent.behavior();

    assert(behavior1.calledOnce);
    assert(behavior2.calledOnce);
  });

  it("should execute behaviors in sequence", function () {
    const behavior1 = sinon.spy();
    const behavior2 = sinon.spy();
    const agent = {};

    HasBehavior.call(agent, behavior1);
    agent.aggregateBehavior(behavior2);

    const aggregatedBehavior = agent.behavior;

    aggregatedBehavior();

    assert(behavior2.calledBefore(behavior1));
  });

  it("should bind behaviors to the agent context", function () {
    const agent = {};
    const behavior = function () {
      this.test = true;
    };

    HasBehavior.call(agent, behavior);
    agent.behavior();

    assert.strictEqual(agent.test, true);
  });
});
