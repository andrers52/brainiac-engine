import {
  createWidget,
  Draggable,
  HasBehavior,
  HasHint,
  rect,
} from 'brainiac-engine';

export function startDraggableDemo(server) {
  server.clearCurrentDemo();
  server.currentDemo = 'draggable';
  console.log('Starting Draggable Objects Demo with one agent...');

  try {
    const beServer = server.getBEServer();

    // Create draggable widget (star)
    const rect1 = rect(300, 200, 60, 60);
    console.log('Created rect1 input:', {
      center: rect1.center,
      size: rect1.size,
      x: rect1.x,
      y: rect1.y,
      width: rect1.width,
      height: rect1.height,
    });

    const widget1 = createWidget(beServer, 'media/images/star.png', rect1);
    console.log('Created widget1:', {
      id: widget1.id,
      position: widget1.getPosition(),
      isVisible: widget1.isVisible,
    }); // Make widget draggable
    Draggable.call(widget1, true, true);
    server.demoWidgets.push(widget1);

    // Add behavior support first (required for HasHint)
    // Use a simple no-op behavior as the base
    HasBehavior.call(widget1, function () {
      // Base behavior - does nothing, just enables aggregateBehavior
    });

    // Add hint/label to widget
    HasHint.call(widget1, 'Draggable Star', 'Arial');
    console.log('Added hint to widget1:', {
      hasHint: !!widget1.hint,
      hintText: widget1.hint ? widget1.hint.getText() : 'none',
      hintId: widget1.hint ? widget1.hint.id : 'none',
      hintPosition: widget1.hint ? widget1.hint.getPosition() : 'none',
      hintVisible: widget1.hint ? widget1.hint.isVisible : 'none',
    });

    // Add the hint to demoWidgets so it gets tracked and cleaned up
    if (widget1.hint) {
      server.demoWidgets.push(widget1.hint);
    }

    console.log('Created draggable widget with hint - star at (300, 200)');
    console.log('Draggable Objects Demo setup complete!');
    console.log(`Total demo widgets created: ${server.demoWidgets.length}`);

    // Display instructions
    server.updateDemoInfo(
      'Draggable Object Demo with Label',
      'Click and drag the star to move it around. The label \'Draggable Star\' is automatically created using HasHint mixin and will follow the object as you drag it.',
    );

    setTimeout(() => {
      console.log('=== SPATIAL INDEX DEBUG (after 1 second) ===');
      const environment = beServer.getEnvironment();
      const allAgents = environment.getAgents();
      console.log(
        `Total agents in environment: ${Object.keys(allAgents).length}`,
      );

      // Test spatial query for widget and hint
      server.demoWidgets.forEach((agent, index) => {
        const pos = agent.getPosition();
        const nearbyAgents =
          environment.spaceSegments.getNearbyAgentsByPosition(pos);
        console.log(
          `Widget ${index + 1} at (${pos.x}, ${pos.y}) - nearby agents:`,
          nearbyAgents.map((a) => a.id),
        );
      });
    }, 1000);
  } catch (error) {
    console.error('Error in draggable demo:', error);
    server.updateDemoInfo(
      'Error',
      `Failed to start draggable demo: ${error.message}`,
    );
  }
}
