import { createWidget, Draggable, rect, Vector } from "brainiac-engine";

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
    console.log("Bubble isDraggable:", draggableWidget.isDraggable);
    console.log("Bubble isBeingDragged:", draggableWidget.isBeingDragged);
    console.log(
      "Bubble has startDragging:",
      typeof draggableWidget.startDragging,
    );
    console.log(
      "Bubble has handleMouseMove:",
      typeof draggableWidget.handleMouseMove,
    );
    server.demoWidgets.push(draggableWidget);

    console.log(`Total widgets created: ${server.demoWidgets.length}`);

    // Add debug status text
    server.updateDemoInfo(
      "Draggable Objects: Click and drag the squares and bubble. Check console for debug info.",
    );

    // Test drag state directly
    setTimeout(() => {
      console.log("Testing drag state after 2 seconds...");
      const environment = beServer.getEnvironment();
      console.log(
        "Environment agents:",
        Object.keys(environment.getAgents()).length,
      );

      server.demoWidgets.forEach((widget, index) => {
        console.log(`Widget ${index + 1}:`, {
          id: widget.id,
          isDraggable: widget.isDraggable,
          isBeingDragged: widget.isBeingDragged,
          hasStartDragging: typeof widget.startDragging,
          hasHandleMouseMove: typeof widget.handleMouseMove,
          position: widget.getPosition(),
          isVisible: widget.isVisible,
          isAlive: widget.isAlive,
          rectangle: {
            center: widget.rectangle.center,
            size: widget.rectangle.size,
            topLeft: widget.rectangle.topLeft(),
            bottomRight: widget.rectangle.bottomRight(),
          },
        });
      });

      // Test spatial indexing
      console.log("Testing spatial indexing near widget positions...");
      server.demoWidgets.forEach((widget, index) => {
        const pos = widget.getPosition();
        const nearbyAgents =
          environment.spaceSegments.getNearbyAgentsByPosition(pos);
        console.log(
          `Nearby agents at widget ${index + 1} position (${pos.x}, ${pos.y}):`,
          nearbyAgents.map((a) => a.id),
        );
      });
    }, 2000);

    // Manual test: simulate a drag operation
    setTimeout(() => {
      console.log("MANUAL TEST: Simulating mouse click and drag...");
      const testWidget = server.demoWidgets[0];
      const environment = beServer.getEnvironment();

      if (testWidget) {
        console.log("Test widget details:", {
          id: testWidget.id,
          position: testWidget.getPosition(),
          rectangle: testWidget.rectangle,
          isVisible: testWidget.isVisible,
          isAlive: testWidget.isAlive,
        });

        // Test hit detection manually
        const testPos = testWidget.getPosition();
        console.log("Testing hit detection at widget center:", testPos);
        const hitResult = testWidget.checkHit(testPos);
        console.log("Hit detection result:", hitResult);

        // Test spatial index lookup
        const nearbyAgents =
          environment.spaceSegments.getNearbyAgentsByPosition(testPos);
        console.log(
          "Nearby agents at test position:",
          nearbyAgents.map((a) => a.id),
        );

        // Simulate mouse down event
        console.log("Simulating onMouseDown event...");
        environment.propagateUserEvent("onMouseDown", testPos);

        console.log(
          "Before manual drag - isBeingDragged:",
          testWidget.isBeingDragged,
        );

        console.log("Manual test completed - check agent state above");
      }
    }, 3000);
  } catch (error) {
    console.error("Error in draggable demo:", error);
  }
}
