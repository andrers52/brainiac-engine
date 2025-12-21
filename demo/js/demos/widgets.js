import { createButton, createLabel, createWidget, rect } from 'brainiac-engine';

export function startWidgetsDemo(server) {
  server.clearCurrentDemo();
  server.currentDemo = 'widgets';
  console.log('Starting UI Widgets Demo...');

  try {
    const beServer = server.getBEServer();

    // Create a basic button with improved mouse up handling
    const button = createButton(
      beServer,
      'media/images/blue_square.png',
      rect(100, 100, 80, 40),
      function () {
        console.log('Button clicked!');
      },
    );

    // Add debugging to understand the mouse event flow
    const originalOnMouseDownHit = button.onMouseDownHit;
    button.onMouseDownHit = function (mouseWorldPosition) {
      console.log('Button: Mouse down hit detected');
      if (originalOnMouseDownHit) {
        originalOnMouseDownHit.call(this, mouseWorldPosition);
      }
    };

    const originalOnMouseUp = button.onMouseUp;
    button.onMouseUp = function (mouseWorldPosition) {
      console.log('Button: Mouse up received (general event)');
      if (originalOnMouseUp) {
        originalOnMouseUp.call(this, mouseWorldPosition);
      }
    };

    const originalOnMouseUpHit = button.onMouseUpHit;
    button.onMouseUpHit = function (mouseWorldPosition) {
      console.log('Button: Mouse up hit detected (over button)');
      if (originalOnMouseUpHit) {
        originalOnMouseUpHit.call(this, mouseWorldPosition);
      }
    };

    server.demoWidgets.push(button);

    // Create a label
    const label = createLabel(
      beServer,
      rect(300, 100, 200, 30),
      'Interactive UI Demo - Try clicking and dragging away from button',
    );
    server.demoWidgets.push(label);

    // Create a basic widget
    const widget = createWidget(
      beServer,
      'media/images/blue_square.png',
      rect(200, 200, 50, 50),
    );
    server.demoWidgets.push(widget);

    server.updateDemoInfo(
      'UI Widgets: Buttons with proper mouse up handling, labels, and basic widgets',
    );
  } catch (error) {
    console.error('Error in widgets demo:', error);
  }
}
