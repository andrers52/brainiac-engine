import { createWidget, Draggable, rect } from "brainiac-engine";

export function startDraggableDemo(server) {
  server.clearCurrentDemo();
  server.currentDemo = "draggable";
  console.log("Starting Draggable Objects Demo...");

  try {
    const beServer = server.getBEServer();

    // Create draggable widgets
    for (let i = 0; i < 3; i++) {
      const widget = createWidget(
        beServer,
        i % 2 === 0
          ? "media/images/black_square.png"
          : "media/images/blue_square.png",
        rect(150 + i * 100, 150, 50, 50),
      );

      // Make it draggable
      Draggable.call(widget, true, true);
      console.log(
        `Created draggable widget ${i + 1} at position (${150 + i * 100}, 150)`,
      );

      server.demoWidgets.push(widget);
    }

    // Create another draggable widget
    const draggableWidget = createWidget(
      beServer,
      "media/images/bubble.png",
      rect(300, 300, 60, 60),
    );

    Draggable.call(draggableWidget, true, true);
    console.log("Created draggable bubble at position (300, 300)");
    server.demoWidgets.push(draggableWidget);

    console.log(`Total widgets created: ${server.demoWidgets.length}`);

    server.updateDemoInfo(
      "Draggable Objects: Click and drag the squares and bubble",
    );
  } catch (error) {
    console.error("Error in draggable demo:", error);
  }
}
