import { strict as assert } from "assert";
import { SpaceSegments } from "./SpaceSegments.js";

describe("SpaceSegments", () => {
  const WORLD_WIDTH = 100;
  const WORLD_HEIGHT = 100;
  let spaceSegments;

  beforeEach(() => {
    spaceSegments = new SpaceSegments();
    spaceSegments.start(WORLD_WIDTH, WORLD_HEIGHT);
  });

  it("should initialize segments correctly", () => {
    assert.equal(spaceSegments.NUM_SEGMENT_ROWS, 20);
    assert.equal(spaceSegments.NUM_SEGMENT_COLUMNS, 20);
  });

  it("should add agent correctly", () => {
    const agent = { id: "agent1", getPosition: () => ({ x: 0, y: 0 }) };
    spaceSegments.addAgent(agent);
    assert.equal(spaceSegments.checkAgentExists(agent), true);
  });

  it("should remove agent correctly", () => {
    const agent = { id: "agent1", getPosition: () => ({ x: 0, y: 0 }) };
    spaceSegments.addAgent(agent);
    spaceSegments.removeAgent(agent);
    assert.equal(spaceSegments.checkAgentExists(agent), false);
  });

  it("should update agent position correctly", () => {
    const agent = { id: "agent1", getPosition: () => ({ x: 0, y: 0 }) };
    spaceSegments.addAgent(agent);
    agent.getPosition = () => ({ x: 10, y: 10 });
    spaceSegments.updateAgent(agent);
    assert.equal(spaceSegments.checkAgentExists(agent), true);
  });

  it("should get nearby agents by position correctly", () => {
    const agent1 = { id: "agent1", getPosition: () => ({ x: 0, y: 0 }) };
    const agent2 = { id: "agent2", getPosition: () => ({ x: 0, y: 0 }) };
    spaceSegments.addAgent(agent1);
    spaceSegments.addAgent(agent2);
    const nearbyAgents = spaceSegments.getNearbyAgentsByPosition({
      x: 0,
      y: 0,
    });
    assert(nearbyAgents.includes(agent1));
    assert(nearbyAgents.includes(agent2));
  });

  it("should get nearby agents by rectangle correctly", () => {
    const agent1 = { id: "agent1", getPosition: () => ({ x: 0, y: 0 }) };
    const agent2 = { id: "agent2", getPosition: () => ({ x: 50, y: 50 }) };
    spaceSegments.addAgent(agent1);
    spaceSegments.addAgent(agent2);
    const encompassingRectangle = {
      topLeft: () => ({ x: -50, y: -50 }),
      bottomRight: () => ({ x: 50, y: 50 }),
    };
    const nearbyAgents = spaceSegments.getNearbyAgentsByRectangle(
      encompassingRectangle,
    );
    console.log(
      "Nearby agents:",
      nearbyAgents.map((agent) => agent.id),
    );
    assert(nearbyAgents.includes(agent1));
    assert(nearbyAgents.includes(agent2));
  });
});
