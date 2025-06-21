import { createAgent } from "../../index.js";

// Import all demo functions
import { startContainersDemo } from "./demos/containers.js";
import { startDraggableDemo } from "./demos/draggable.js";
import { startMixinsDemo } from "./demos/mixins.js";
import { startRasterDemo } from "./demos/raster.js";
import { startSensingDemo } from "./demos/sensing.js";
import { startWidgetsDemo } from "./demos/widgets.js";

// Advanced server class with multiple demo modes
export class AdvancedInteractiveTestsServer {
  constructor(beServer) {
    this.beServer = beServer;
    this.currentDemo = null;
    this.demoAgents = [];
    this.demoWidgets = [];
  }

  // Expose beServer for demos that need direct access
  getBEServer() {
    return this.beServer;
  }

  start() {
    console.log("Advanced Interactive Tests server started");

    // Start the environment with proper world dimensions
    this.beServer.environment.start(800, 600);

    // Start with the mixins demo after a small delay to ensure DOM is ready
    setTimeout(() => {
      startMixinsDemo(this);
    }, 100);
  }

  clearCurrentDemo() {
    console.log("Clearing current demo...");
    console.log(`Current demo agents to remove: ${this.demoAgents.length}`);
    console.log(`Current demo widgets to remove: ${this.demoWidgets.length}`);

    // Log all agents in environment before cleanup
    const allAgentsBefore = this.beServer.getEnvironment().getAgents();
    console.log(
      `Total agents in environment before cleanup: ${
        Object.keys(allAgentsBefore).length
      }`,
    );
    console.log(
      `Agent IDs before cleanup:`,
      Object.keys(allAgentsBefore).map((id) => parseInt(id)),
    );

    // Remove all demo agents
    this.demoAgents.forEach((agent) => {
      try {
        if (agent && typeof agent.die === "function") {
          console.log(`Removing demo agent ${agent.id}`);
          agent.die();
        }
      } catch (error) {
        console.warn("Error removing agent:", error);
      }
    });

    // Remove all demo widgets
    this.demoWidgets.forEach((widget) => {
      try {
        if (widget && typeof widget.die === "function") {
          console.log(`Removing demo widget ${widget.id}`);
          widget.die();
        }
      } catch (error) {
        console.warn("Error removing widget:", error);
      }
    });

    this.demoAgents = [];
    this.demoWidgets = [];
    this.currentDemo = null;

    // More aggressive cleanup: kill all non-singleton agents and clear spatial index
    console.log(
      "Performing aggressive cleanup - killing all agents and clearing spatial index",
    );
    this.beServer.getEnvironment().killAllAgents();

    // Log all agents in environment after cleanup
    const allAgentsAfter = this.beServer.getEnvironment().getAgents();
    console.log(
      `Total agents in environment after cleanup: ${
        Object.keys(allAgentsAfter).length
      }`,
    );
    console.log(
      `Agent IDs after cleanup:`,
      Object.keys(allAgentsAfter).map((id) => parseInt(id)),
    );
  }

  startMixinsDemo() {
    startMixinsDemo(this);
  }

  startSensingDemo() {
    startSensingDemo(this);
  }

  startWidgetsDemo() {
    startWidgetsDemo(this);
  }

  startDraggableDemo() {
    startDraggableDemo(this);
  }

  startContainersDemo() {
    startContainersDemo(this);
  }

  startRasterDemo() {
    startRasterDemo(this);
  }

  updateDemoInfo(text) {
    // This will be called from the client side
    if (typeof window !== "undefined") {
      const updateText = () => {
        const infoElement = document.getElementById("demo-info");
        if (infoElement) {
          infoElement.innerHTML = `<strong>Advanced Interactive Demo</strong><br>${text}`;
        }
      };

      // Update immediately
      updateText();

      // Also update after a short delay to ensure it persists
      setTimeout(updateText, 200);
    }
  }

  onUserConnected(user, cameraSize) {
    console.log("User connected:", user.name, "Camera size:", cameraSize);

    try {
      // Create the player agent
      const agent = createAgent(
        this.beServer,
        "media/images/star.png",
        50,
        50,
        true,
        50,
        50,
      );

      user.agent = agent;
      agent.name = user.name || "Player";

      console.log("Player agent created successfully for:", agent.name);
    } catch (error) {
      console.error("Error creating player agent:", error);
    }
  }
}
