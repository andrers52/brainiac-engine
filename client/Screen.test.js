import { strict as assert } from "assert";
import { rect } from "../common/geometry/Rectangle.js";
import { ResourceStore } from "./ResourceStore.js";
import { Screen } from "./Screen.js";

describe("Screen Module", function () {
  let screen;
  let resourceStore;

  beforeEach(function () {
    screen = new Screen();
    resourceStore = new ResourceStore();
  });

  describe("Initialization", function () {
    it("should initialize with default values", function () {
      assert.strictEqual(screen.zoomOutFactor, 1);
    });
  });
  describe("Canvas Operations", function () {
    beforeEach(function () {
      // Skip canvas operations in Node.js environment - these require full browser canvas support
      if (
        typeof process !== "undefined" &&
        process.versions &&
        process.versions.node
      ) {
        this.skip();
      }
      document.body.innerHTML = "";
      screen.start({
        onBeforeDrawAgentInput: null,
        onAfterDrawAgentInput: null,
        onAfterDrawScreenInput: null,
        minScreenDimensionInput: 100,
        getVisibleAgentsInput: () => [],
        cameraInput: { rectangle: rect(0, 0, 10, 10) },
        canvasIdInput: "testCanvas",
        worldWidth: 100,
        worldHeight: 100,
        resourceStoreInput: resourceStore,
      });
    });

    it("should add canvas to the document", function () {
      const canvas = document.getElementById("testCanvas");
      assert.ok(canvas);
    });

    it("should hide and show the canvas", function () {
      const canvas = document.getElementById("testCanvas");
      screen.hideCanvas();
      assert.strictEqual(canvas.style.visibility, "hidden");
      screen.showCanvas();
      assert.strictEqual(canvas.style.visibility, "visible");
    });

    it("should adjust canvas size to window size", function () {
      screen.adjustCanvasToWindowSize();
      const canvas = screen.getCanvas();
      assert.strictEqual(canvas.width, window.innerWidth);
      assert.strictEqual(canvas.height, window.innerHeight);
    });

    it("should set background image", function () {
      resourceStore.retrieveResourceObject = () => new Image();
      screen.setBackgroundImageName("testImage");
      assert.ok(screen.getContext());
    });
  });
  describe("Drawing Operations", function () {
    beforeEach(function () {
      // Skip drawing operations in Node.js environment - these require full browser canvas support
      if (
        typeof process !== "undefined" &&
        process.versions &&
        process.versions.node
      ) {
        this.skip();
      }
    });
    it("should clear the canvas", function () {
      screen.start({
        onBeforeDrawAgentInput: null,
        onAfterDrawAgentInput: null,
        onAfterDrawScreenInput: null,
        minScreenDimensionInput: 100,
        getVisibleAgentsInput: () => [],
        cameraInput: { rectangle: rect(0, 0, 10, 10) },
        canvasIdInput: "testCanvas",
        worldWidth: 100,
        worldHeight: 100,
        resourceStoreInput: resourceStore,
      });

      const context = screen.getContext();
      context.fillRect = function (x, y, width, height) {
        assert.strictEqual(x, 0);
        assert.strictEqual(y, 0);
        assert.strictEqual(width, context.canvas.width);
        assert.strictEqual(height, context.canvas.height);
      };

      screen.adjustCanvasToWindowSize();
    });

    it("should draw agent image with proper transformations", function () {
      const agent = {
        imageName: "testImage",
        rectangle: rect(0, 0, 100, 100),
        opacity: 0.5,
        orientation: Math.PI / 4,
      };

      const canvasRectangle = rect(0, 0, 100, 100);
      const context = {
        save: () => {},
        translate: (x, y) => {
          assert.ok(x >= 0);
          assert.ok(y >= 0);
        },
        rotate: (angle) => {
          assert.strictEqual(angle, 2 * Math.PI - agent.orientation);
        },
        drawImage: (image, x, y, width, height) => {
          assert.strictEqual(x, 0);
          assert.strictEqual(y, 0);
          assert.ok(width > 0);
          assert.ok(height > 0);
        },
        restore: () => {},
      };

      screen.drawAgentImage(agent, canvasRectangle);
    });
  });
  describe("Game Loop Operations", function () {
    beforeEach(function () {
      // Skip game loop operations in Node.js environment - these require full browser canvas support
      if (
        typeof process !== "undefined" &&
        process.versions &&
        process.versions.node
      ) {
        this.skip();
      }
    });

    it("should start and stop the game presentation loop", function () {
      let loopCounter = 0;

      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function (callback, interval) {
        loopCounter++;
        if (loopCounter > 2) {
          window.setTimeout = originalSetTimeout;
        }
        return originalSetTimeout(callback, interval);
      };
      screen.start({
        onBeforeDrawAgentInput: null,
        onAfterDrawAgentInput: null,
        onAfterDrawScreenInput: null,
        minScreenDimensionInput: 100,
        getVisibleAgentsInput: () => [],
        cameraInput: { rectangle: rect(0, 0, 10, 10) },
        canvasIdInput: "testCanvas",
        worldWidth: 100,
        worldHeight: 100,
        resourceStoreInput: resourceStore,
      });

      screen.gamePresentationLoop();
      assert.ok(loopCounter > 0);

      screen.stopGamePresentationLoop();
      assert.strictEqual(screen.presentationLoopId, null);
    });
  });
});
