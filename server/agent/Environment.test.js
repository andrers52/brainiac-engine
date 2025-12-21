import { strict as assert } from 'assert';
import sinon from 'sinon';
import { Vector } from '../../common/geometry/Vector.js';
import { Environment } from './Environment.js';

describe('Environment', function () {
  let environment, agent, nearbyAgent, clock;

  beforeEach(function () {
    environment = new Environment();
    agent = {
      id: 1,
      isCamera: false,
      isUserAgent: sinon.stub().returns(false),
      isVisible: true, // Required for mouse event propagation
      rectangle: {
        center: new Vector(0, 0),
        meanSize: sinon.stub().returns(10),
        checkIntersection: sinon.stub().returns(true),
      },
      behavior: sinon.spy(),
      die: sinon.spy(),
      checkHit: sinon.stub().returns(true), // Required for mouse event hit detection
    };
    nearbyAgent = {
      id: 2,
      isCamera: false,
      isUserAgent: sinon.stub().returns(false),
      rectangle: {
        center: new Vector(0, 0),
        meanSize: sinon.stub().returns(10),
        checkIntersection: sinon.stub().returns(true),
      },
    };

    sinon.stub(environment.spaceSegments, 'addAgent');
    sinon
      .stub(environment.spaceSegments, 'getNearbyAgents')
      .returns([nearbyAgent]);
    sinon
      .stub(environment.spaceSegments, 'getNearbyAgentsByRectangle')
      .returns([nearbyAgent]);
    sinon.stub(environment.spaceSegments, 'removeAgent');
    sinon.stub(environment.spaceSegments, 'updateAgent');
    sinon
      .stub(environment.spaceSegments, 'getNearbyAgentsByPosition')
      .returns([nearbyAgent]);
    sinon.stub(environment.spaceSegments, 'clear');
    sinon.stub(environment.spaceSegments, 'start'); // Add spy for start method
    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    environment.spaceSegments.addAgent.restore();
    environment.spaceSegments.getNearbyAgents.restore();
    environment.spaceSegments.getNearbyAgentsByRectangle.restore();
    environment.spaceSegments.removeAgent.restore();
    environment.spaceSegments.updateAgent.restore();
    environment.spaceSegments.getNearbyAgentsByPosition.restore();
    environment.spaceSegments.clear.restore();
    environment.spaceSegments.start.restore(); // Restore the start spy
    clock.restore();
  });

  it('should add an agent', function () {
    environment.addAgent(agent);
    assert.strictEqual(environment.getAgents()[agent.id], agent);
    assert(environment.spaceSegments.addAgent.calledOnce);
  });

  it('should remove an agent', function () {
    environment.addAgent(agent);
    environment.removeAgent(agent);
    assert.strictEqual(environment.getAgents()[agent.id], undefined);
    assert(environment.spaceSegments.removeAgent.calledOnce);
  });

  it('should get nearby agents', function () {
    environment.addAgent(agent);
    const nearbyAgents = environment.getNearbyAgents(agent);
    assert.strictEqual(nearbyAgents.length, 1);
    assert(environment.spaceSegments.getNearbyAgents.calledOnce);
  });

  it('should get nearby user agents', function () {
    environment.addAgent(agent);
    nearbyAgent.isUserAgent = sinon.stub().returns(true); // Make nearbyAgent a user agent
    const nearbyUserAgents = environment.getNearbyUserAgents(agent);
    assert.strictEqual(nearbyUserAgents.length, 1);
    assert(environment.spaceSegments.getNearbyAgents.calledOnce);
  });

  it('should update an agent', function () {
    environment.addAgent(agent);
    environment.updateAgent(agent);
    assert(environment.spaceSegments.updateAgent.calledOnce);
  });

  it('should check if agent exists', function () {
    environment.addAgent(agent);
    const exists = environment.checkAgentExists(agent);
    assert.strictEqual(exists, true);
  });

  it('should return null if no overlapping agent is found', function () {
    environment.addAgent(agent);
    const overlappingAgent =
      environment.otherAgentOverlappingWithProposedRectangle(
        agent,
        agent.rectangle,
      );
    assert.strictEqual(overlappingAgent, nearbyAgent);
  });

  it('should kill all agents', function () {
    environment.addAgent(agent);
    environment.killAllAgents();
    assert(agent.die.calledOnce);
    assert(environment.spaceSegments.clear.calledOnce);
  });

  it('should propagate user event', function () {
    const event = 'onMouseDown';
    const arg = new Vector(0, 0);
    agent[event + 'Hit'] = sinon.spy(); // Add the expected event handler spy
    environment.addAgent(agent);
    environment.propagateUserEvent(event, arg, agent);
    assert(agent[event + 'Hit'].calledOnce);
  });

  it('should start the environment', function () {
    environment.start(100, 100);
    assert.strictEqual(environment.getWorldRectangle().size.x, 100);
    assert.strictEqual(environment.getWorldRectangle().size.y, 100);
    assert(environment.spaceSegments.start.calledOnce);
  });
});
