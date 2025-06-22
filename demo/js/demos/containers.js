import { createAgent, createContainer, rect } from "brainiac-engine";

export function startContainersDemo(server) {
  server.clearCurrentDemo();
  server.currentDemo = "containers";
  console.log("Starting Layout Containers Demo...");

  try {
    // Create agents first
    const ag1 = createAgent(
      server.beServer,
      "media/images/blue_square.png",
      40,
      40,
      false,
    );
    const ag2 = createAgent(
      server.beServer,
      "media/images/blue_square.png",
      40,
      40,
      false,
    );
    const ag3 = createAgent(
      server.beServer,
      "media/images/blue_square.png",
      40,
      40,
      false,
    );
    const ag4 = createAgent(
      server.beServer,
      "media/images/blue_square.png",
      40,
      40,
      false,
    );

    // Create sub-containers
    const container1 = createContainer([ag1, ag2], "vertical", 5, null);
    const container2 = createContainer([ag3, ag4], "vertical", 5, null);

    // Create main container
    const superContainer = createContainer(
      [container1, container2],
      "horizontal",
      10,
      rect(100, 100, 200, 200),
    );

    server.demoWidgets.push(superContainer);
    server.demoAgents.push(ag1, ag2, ag3, ag4);

    server.updateDemoInfo(
      "Layout Containers: Horizontal and vertical layout management",
    );
  } catch (error) {
    console.error("Error in containers demo:", error);
  }
}
