import { strict as assert } from 'assert';
import sinon from 'sinon';
import { rect } from '../../../common/geometry/Rectangle.js';
import { Vector } from '../../../common/geometry/Vector.js';
import { BEServer } from '../../BEServer.js';
import { SensingAgent } from './SensingAgent.js';

describe('SensingAgent', function () {
  let agent, nearbyAgentsStub, clock;
  let beServer; // Declare beServer instance

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    beServer = new BEServer(); // Instantiate BEServer
    beServer.startSync(); // Start the server instance synchronously for tests

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

    // Stub on the instance
    nearbyAgentsStub = sinon
      .stub(beServer.getEnvironment(), 'getNearbyAgents')
      .returns([]);
  });

  afterEach(function () {
    clock.restore();
    if (nearbyAgentsStub) {
      // Ensure stub exists before restoring
      nearbyAgentsStub.restore();
    }
    beServer.stop(); // Stop the server to clean up timers
  });

  it('should throw an error if required event handlers are not implemented', function () {
    assert.throws(() => {
      // Pass beServer instance to SensingAgent call
      SensingAgent.call({}, beServer, () => false);
    }, /Error: added SensingAgent to agent without implementing/);
  });

  it('should detect agents within sensing distance', function () {
    const detectedAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 0)),
      isUserAgent: sinon.stub().returns(false),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    // Pass beServer instance to SensingAgent call
    SensingAgent.call(agent, beServer, () => true);

    // Check immediately - sensing happens on first call
    assert(agent.onSensingAgents.calledOnce);
    assert.strictEqual(
      agent.onSensingAgents.firstCall.args[0][0].agent,
      detectedAgent,
    );
  });

  it('should not detect agents outside sensing distance', function () {
    const detectedAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(200, 0, 1, 1), // Agent at (200, 0) - outside sensing range
      getPosition: sinon.stub().returns(new Vector(200, 0)),
      isUserAgent: sinon.stub().returns(false),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    // Pass beServer instance to SensingAgent call
    SensingAgent.call(agent, beServer, () => true);

    // Sensing happens immediately, not after timeout
    assert(agent.onSensingAgents.notCalled);
  });

  it('should detect user agent', function () {
    const detectedAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      isUserAgent: sinon.stub().returns(true),
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 0)),
    };

    nearbyAgentsStub.returns([detectedAgent]);

    // Pass beServer instance to SensingAgent call
    SensingAgent.call(agent, beServer, () => true);

    // Sensing happens immediately
    assert(agent.onSensingUserAgent.calledOnce);
    assert.strictEqual(
      agent.onSensingUserAgent.firstCall.args[0].agent,
      detectedAgent,
    );
  });

  it('should detect forward agents', function () {
    agent.orientation = 0; // Facing right
    const forwardAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(10, 0, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 0)), // Directly in front
      isUserAgent: sinon.stub().returns(false),
    };
    const backwardAgent = {
      id: 3,
      isCamera: false,
      isSolid: true,
      rectangle: rect(-10, 0, 1, 1),
      getPosition: sinon.stub().returns(new Vector(-10, 0)), // Directly behind
      isUserAgent: sinon.stub().returns(false),
    };

    nearbyAgentsStub.returns([forwardAgent, backwardAgent]);

    // Pass beServer instance to SensingAgent call
    SensingAgent.call(agent, beServer, () => true);

    // Check immediately
    assert(agent.onSensingForwardAgents.calledOnce);
    assert.strictEqual(
      agent.onSensingForwardAgents.firstCall.args[0][0].agent,
      forwardAgent,
    );
  });

  it('should detect the most forward agent', function () {
    agent.orientation = 0; // Facing right
    const mostForwardAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(10, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 1)), // Slightly off-center forward
      isUserAgent: sinon.stub().returns(false),
    };
    const lessForwardAgent = {
      id: 3,
      isCamera: false,
      isSolid: true,
      rectangle: rect(10, 5, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 5)), // More off-center forward
      isUserAgent: sinon.stub().returns(false),
    };

    nearbyAgentsStub.returns([mostForwardAgent, lessForwardAgent]);

    // Pass beServer instance to SensingAgent call
    SensingAgent.call(agent, beServer, () => true);

    // Check immediately
    assert(agent.onSensingMostForwardAgent.calledOnce);
    assert.strictEqual(
      agent.onSensingMostForwardAgent.firstCall.args[0].agent,
      mostForwardAgent,
    );
  });

  it('should call detector function for each nearby agent', function () {
    const agentInDistance = {
      id: 4,
      getPosition: () => new Vector(10, 0),
      rectangle: rect(10, 0, 1, 1),
      isUserAgent: () => false,
      isCamera: false,
      isSolid: true, // Add isSolid property
    };
    nearbyAgentsStub.returns([agentInDistance]);
    const detectorSpy = sinon.spy(() => true);

    SensingAgent.call(agent, beServer, detectorSpy, 100);

    // The detector is called with the agent being considered.
    assert(detectorSpy.calledOnceWith(agentInDistance));
  });

  it('should respect the delay between sensing checks', function () {
    // Ensure an agent is returned by getNearbyAgents to trigger onSensingAgents
    const detectedAgent = {
      id: 2,
      isCamera: false,
      isSolid: true,
      rectangle: rect(1, 1, 1, 1),
      getPosition: sinon.stub().returns(new Vector(10, 0)),
      isUserAgent: sinon.stub().returns(false),
    };
    nearbyAgentsStub.returns([detectedAgent]);

    SensingAgent.call(agent, beServer, () => true, 100, 250);
    assert(agent.onSensingAgents.calledOnce); // Initial call

    clock.tick(249);
    assert(agent.onSensingAgents.calledOnce); // Not called yet

    clock.tick(1);
    assert(agent.onSensingAgents.calledTwice); // Called after 250ms
  });
});
