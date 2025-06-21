import { createButton, createLabel, createWidget, rect } from "brainiac-engine";

export function startWidgetsDemo(server) {
  server.clearCurrentDemo();
  server.currentDemo = "widgets";
  console.log("Starting UI Widgets Demo...");

  try {
    const beServer = server.getBEServer();

    // Create a basic button
    const button = createButton(
      beServer,
      "media/images/black_square.png",
      rect(100, 100, 80, 40),
      function () {
        console.log("Button clicked!");
      },
    );
    server.demoWidgets.push(button);

    // Create a label
    const label = createLabel(
      beServer,
      rect(300, 100, 200, 30),
      "Interactive UI Demo",
    );
    server.demoWidgets.push(label);

    // Create a basic widget
    const widget = createWidget(
      beServer,
      "media/images/blue_square.png",
      rect(200, 200, 50, 50),
    );
    server.demoWidgets.push(widget);

    server.updateDemoInfo("UI Widgets: Buttons, labels, and basic widgets");
  } catch (error) {
    console.error("Error in widgets demo:", error);
  }
}
