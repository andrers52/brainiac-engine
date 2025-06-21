import {
  createAgent,
  SensingAgent,
  SensingWorldBorder,
  Vector,
} from "brainiac-engine";

export function startSensingDemo(server) {
  server.clearCurrentDemo();
  server.currentDemo = "sensing";
  console.log("Starting Collision & Sensing Demo...");

  try {
    // Create an obstacle agent
    const obstacleAgent = createAgent(
      server.beServer,
      "media/images/bubble.png",
      60,
      60,
      false,
      500,
      200,
    );
    server.demoAgents.push(obstacleAgent);

    // Create a sensing agent that moves toward the obstacle
    const sensingAgent = createAgent(
      server.beServer,
      "media/images/black_square.png",
      40,
      40,
      false,
      50,
      200,
    );

    // Add sensing behavior
    sensingAgent.onSensingAgent = function (otherAgent) {
      console.log("Agent collision detected!");
      otherAgent.die();
      this.die();
    };

    sensingAgent.behavior = function () {
      this.move(new Vector(2, 0, 0));
    };

    SensingAgent.call(sensingAgent, null);
    server.demoAgents.push(sensingAgent);

    // Create a world border sensing agent
    const borderAgent = createAgent(
      server.beServer,
      "media/images/blue_square.png",
      30,
      30,
      false,
      700,
      100,
    );

    borderAgent.onSensingWorldBorder = function () {
      console.log("World border detected!");
      this.die();
    };

    borderAgent.behavior = function () {
      this.move(new Vector(3, 1, 0));
    };

    SensingWorldBorder.call(borderAgent, null);
    server.demoAgents.push(borderAgent);

    server.updateDemoInfo(
      "Collision & Sensing: Watch agents detect collisions and world boundaries",
    );
  } catch (error) {
    console.error("Error in sensing demo:", error);
  }
}
