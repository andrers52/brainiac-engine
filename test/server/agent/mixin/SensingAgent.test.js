import { strict as assert } from "assert";
import sinon from "sinon";
import { rect } from "../../../../common/geometry/Rectangle.js";
import { Vector } from "../../../../common/geometry/Vector.js";
import { SensingAgent } from "../../../../server/agent/mixin/SensingAgent.js";
import { environment } from "../../../../server/agent/singleton/Environment.js";

describe("SensingAgent", function () {
  let agent, nearbyAgentsStub;

  beforeEach(function () {
    agent = {
      id: 1,
      isAlive: true,
      orientation: 0,
      getPosition: sinon.stub().returns(new Vector(0, 0)),
      onSensingAgents: sinon.spy(),
      onSensingUserAgent: sinon.spy(),
      onSensingForwardAgents: sinon.spy(),
      onSensingMostForwardAgent: sinon.spy(),
    };

    nearbyAgentsStub = sinon.stub(environment, "getNearbyAgents").returns([]);
  });

  afterEach(function () {
    nearbyAgentsStub.restore();
  });

  it("should throw an error if required event handlers are not implemented", function () {
    assert.throws(() => {
      SensingAgent.call({}, () => false);
    }, /Error: added SensingAgent to agent without implementing/);
  });

  it("should detect agents within sensing distance", function () {
    const detectedAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 0)),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    SensingAgent.call(agent, () => true);

    sinon.clock.tick(300);

    assert(agent.onSensingAgents.calledOnce);
    assert.strictEqual(
      agent.onSensingAgents.firstCall.args[0][0].agent,
      detectedAgent,
    );
  });

  it("should not detect agents outside sensing distance", function () {
    const detectedAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(200, 0)),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    SensingAgent.call(agent, () => true);

    sinon.clock.tick(300);

    assert(agent.onSensingAgents.notCalled);
  });

  it("should detect user agent", function () {
    const detectedAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      isUserAgent: sinon.stub().returns(true),
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 0)),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    SensingAgent.call(agent, () => true);

    sinon.clock.tick(300);

    assert(agent.onSensingUserAgent.calledOnce);
    assert.strictEqual(
      agent.onSensingUserAgent.firstCall.args[0].agent,
      detectedAgent,
    );
  });

  it("should detect forward agents", function () {
    const detectedAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 0)),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    SensingAgent.call(agent, () => true);

    sinon.clock.tick(300);

    assert(agent.onSensingForwardAgents.calledOnce);
    assert.strictEqual(
      agent.onSensingForwardAgents.firstCall.args[0][0].agent,
      detectedAgent,
    );
  });

  it("should detect the most forward agent", function () {
    const detectedAgent1 = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 0)),
    };

    const detectedAgent2 = {
      id: 3,
      isCamera: false,
      isSolid: true,
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(5, 0)),
    };

    nearbyAgentsStub.returns([detectedAgent1, detectedAgent2]);

    SensingAgent.call(agent, () => true);

    sinon.clock.tick(300);

    assert(agent.onSensingMostForwardAgent.calledOnce);
    assert.strictEqual(
      agent.onSensingMostForwardAgent.firstCall.args[0].agent,
      detectedAgent2,
    );
  });
});
