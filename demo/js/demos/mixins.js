import { createAgent, Fade, Pulsate, Spin } from "brainiac-engine";

export function startMixinsDemo(server) {
  server.clearCurrentDemo();
  server.currentDemo = "mixins";
  console.log("Starting Visual Effects Demo...");

  try {
    const beServer = server.getBEServer();

    // Pulsating black square
    const pulsateAgent = createAgent(
      beServer,
      "media/images/blue_square.png",
      50,
      50,
      false,
      150,
      150,
    );
    Pulsate.call(pulsateAgent, 2000);
    pulsateAgent.startPulsate();
    server.demoAgents.push(pulsateAgent);

    // Spinning blue square
    const spinAgent = createAgent(
      beServer,
      "media/images/blue_square.png",
      50,
      50,
      false,
      300,
      150,
    );
    Spin.call(spinAgent, 3000);
    spinAgent.startSpinning();
    server.demoAgents.push(spinAgent);

    // Fading bubbles
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const fadeAgent = createAgent(
          beServer,
          "media/images/bubble.png",
          40,
          40,
          false,
          100 + i * 100,
          300,
        );
        Fade.call(fadeAgent, 2500);
        fadeAgent.startFading();
        server.demoAgents.push(fadeAgent);
      }, i * 800);
    }

    server.updateDemoInfo(
      "Visual Effects: Pulsate, Spin, and Fade mixins in action",
    );
  } catch (error) {
    console.error("Error in mixins demo:", error);
  }
}
