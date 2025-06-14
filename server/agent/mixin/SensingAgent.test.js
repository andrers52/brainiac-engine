import { strict as assert } from "assert";
import sinon from "sinon";
import { rect } from "../../../common/geometry/Rectangle.js";
import { Vector } from "../../../common/geometry/Vector.js";
import { BEServer } from "../../singleton/BEServer.js";
import { SensingAgent } from "./SensingAgent.js";

describe("SensingAgent", function () {
  let agent, nearbyAgentsStub, clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers();

    agent = {
      id: 1,
      isAlive: true,
      orientation: 0,
      rectangle: rect(0, 0, 10, 10),
      getPosition: sinon.stub().returns(new Vector(0, 0)),
      onSensingAgents: sinon.spy(),
      onSensingUserAgent: sinon.spy(),
      onSensingForwardAgents: sinon.spy(),
      onSensingMostForwardAgent: sinon.spy(),
    };

    nearbyAgentsStub = sinon
      .stub(BEServer.getEnvironment(), "getNearbyAgents")
      .returns([]);
  });

  afterEach(function () {
    clock.restore();
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
      isUserAgent: sinon.stub().returns(false),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    SensingAgent.call(agent, () => true);

    // Check immediately - sensing happens on first call
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
      rectangle: rect(200, 0, 1, 1), // Agent at (200, 0) - outside sensing range
      getPosition: sinon.stub().returns(new Vector(200, 0)),
      isUserAgent: sinon.stub().returns(false),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    SensingAgent.call(agent, () => true);

    // Sensing happens immediately, not after timeout
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

    // Sensing happens immediately
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
      isUserAgent: sinon.stub().returns(false),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    SensingAgent.call(agent, () => true);

    // Sensing happens immediately
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
      rectangle: rect(10, 0, 1, 1), // Agent at (10, 0)
      getPosition: sinon.stub().returns(new Vector(10, 0)),
      isUserAgent: sinon.stub().returns(false),
    };

    const detectedAgent2 = {
      id: 3,
      isCamera: false,
      isSolid: true,
      rectangle: rect(5, 0, 1, 1), // Agent at (5, 0) - closer, should be "most forward"
      getPosition: sinon.stub().returns(new Vector(5, 0)),
      isUserAgent: sinon.stub().returns(false),
    };

    nearbyAgentsStub.returns([detectedAgent1, detectedAgent2]);

    SensingAgent.call(agent, () => true);

    // Sensing happens immediately
    assert(agent.onSensingMostForwardAgent.calledOnce);
    assert.strictEqual(
      agent.onSensingMostForwardAgent.firstCall.args[0].agent,
      detectedAgent2,
    );
  });
});
