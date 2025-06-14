import { strict as assert } from "assert";
import sinon from "sinon";
import { Vector } from "../../../common/geometry/Vector.js";
import { spaceSegments } from "../../singleton/SpaceSegments.js";
import { Environment } from "./Environment.js";

describe("Environment", function () {
  let environment, agent, nearbyAgent, clock;

  beforeEach(function () {
    environment = new Environment();
    agent = {
      id: 1,
      isCamera: false,
      isSingleton: false,
      isUserAgent: sinon.stub().returns(false),
      isVisible: true, // Required for mouse event propagation
      rectangle: {
        center: new Vector(0, 0),
        meanSize: sinon.stub().returns(10),
      },
      behavior: sinon.spy(),
      die: sinon.spy(),
      checkHit: sinon.stub().returns(true), // Required for mouse event hit detection
    };
    nearbyAgent = {
      id: 2,
      isCamera: false,
      isSingleton: false,
      isUserAgent: sinon.stub().returns(false),
      rectangle: {
        center: new Vector(0, 0),
        meanSize: sinon.stub().returns(10),
      },
    };

    sinon.stub(spaceSegments, "addAgent");
    sinon.stub(spaceSegments, "getNearbyAgents").returns([nearbyAgent]);
    sinon
      .stub(spaceSegments, "getNearbyAgentsByRectangle")
      .returns([nearbyAgent]);
    sinon.stub(spaceSegments, "removeAgent");
    sinon.stub(spaceSegments, "updateAgent");
    sinon
      .stub(spaceSegments, "getNearbyAgentsByPosition")
      .returns([nearbyAgent]);
    sinon.stub(spaceSegments, "clear");
    sinon.stub(spaceSegments, "start"); // Add spy for start method
    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    spaceSegments.addAgent.restore();
    spaceSegments.getNearbyAgents.restore();
    spaceSegments.getNearbyAgentsByRectangle.restore();
    spaceSegments.removeAgent.restore();
    spaceSegments.updateAgent.restore();
    spaceSegments.getNearbyAgentsByPosition.restore();
    spaceSegments.clear.restore();
    spaceSegments.start.restore(); // Restore the start spy
    clock.restore();
  });

  it("should add an agent", function () {
    environment.addAgent(agent);
    assert.strictEqual(environment.getAgents()[agent.id], agent);
    assert(spaceSegments.addAgent.calledOnce);
  });

  it("should remove an agent", function () {
    environment.addAgent(agent);
    environment.removeAgent(agent);
    assert.strictEqual(environment.getAgents()[agent.id], undefined);
    assert(spaceSegments.removeAgent.calledOnce);
  });

  it("should get nearby agents", function () {
    environment.addAgent(agent);
    const nearbyAgents = environment.getNearbyAgents(agent);
    assert.strictEqual(nearbyAgents.length, 1);
    assert(spaceSegments.getNearbyAgents.calledOnce);
  });

  it("should get nearby user agents", function () {
    environment.addAgent(agent);
    nearbyAgent.isUserAgent = sinon.stub().returns(true); // Make nearbyAgent a user agent
    const nearbyUserAgents = environment.getNearbyUserAgents(agent);
    assert.strictEqual(nearbyUserAgents.length, 1);
    assert(spaceSegments.getNearbyAgents.calledOnce);
  });

  it("should update an agent", function () {
    environment.addAgent(agent);
    environment.updateAgent(agent);
    assert(spaceSegments.updateAgent.calledOnce);
  });

  it("should check if agent exists", function () {
    environment.addAgent(agent);
    const exists = environment.checkAgentExists(agent);
    assert.strictEqual(exists, true);
  });

  it("should return null if no overlapping agent is found", function () {
    environment.addAgent(agent);
    const overlappingAgent =
      environment.otherAgentOverlappingWithProposedRectangle(
        agent,
        agent.rectangle,
      );
    assert.strictEqual(overlappingAgent, nearbyAgent);
  });

  it("should kill all non-singleton agents", function () {
    environment.addAgent(agent);
    environment.killAllAgents();
    assert(agent.die.calledOnce);
    assert(spaceSegments.clear.calledOnce);
  });

  it("should propagate user event", function () {
    const event = "onMouseDown";
    const arg = new Vector(0, 0);
    agent[event + "Hit"] = sinon.spy(); // Add the expected event handler spy
    environment.addAgent(agent);
    environment.propagateUserEvent(event, arg, agent);
    assert(agent[event + "Hit"].calledOnce);
  });

  it("should start the environment", function () {
    environment.start(100, 100);
    assert.strictEqual(environment.getWorldRectangle().size.x, 100);
    assert.strictEqual(environment.getWorldRectangle().size.y, 100);
    assert(spaceSegments.start.calledOnce);
  });
});
