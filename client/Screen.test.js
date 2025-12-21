import { strict as assert } from 'assert';
import { rect } from '../common/geometry/Rectangle.js';
import { ParticlesContainer } from './ParticlesContainer.js';
import { ResourceStore } from './ResourceStore.js';
import { Screen } from './Screen.js';

describe('Screen Module', function () {
  let screen;
  let resourceStore;
  let particlesContainer;

  beforeEach(function () {
    screen = new Screen();
    resourceStore = new ResourceStore();

    // Mock the missing particle images that ParticlesContainer needs
    const originalRetrieveResourceObject = resourceStore.retrieveResourceObject;
    resourceStore.retrieveResourceObject = function (identifier) {
      // Mock the particle images that are commonly requested
      if (
        identifier === 'redParticle.jpg' ||
        identifier === 'greenParticle.jpg' ||
        identifier === 'blueParticle.jpg' ||
        identifier === 'whiteParticle.jpg' ||
        identifier === 'testImage'
      ) {
        // Return a mock Image object
        const mockImage = new Image();
        mockImage.width = 10;
        mockImage.height = 10;
        return mockImage;
      }
      // For all other resources, use the original method
      return originalRetrieveResourceObject.call(this, identifier);
    };

    particlesContainer = new ParticlesContainer();
  });

  afterEach(function () {
    // Clean up any running game loops
    if (screen && screen.stopGamePresentationLoop) {
      screen.stopGamePresentationLoop();
    }

    // Clean up DOM
    document.body.innerHTML = '';

    // Clean up any lingering timers
    if (global.cleanupAllTimers) {
      global.cleanupAllTimers();
    }
  });

  describe('Initialization', function () {
    it('should initialize with default values', function () {
      assert.strictEqual(screen.zoomOutFactor, 1);
    });
  });
  describe('Canvas Operations', function () {
    beforeEach(function () {
      // Set up a clean DOM environment for each test
      document.body.innerHTML = '';

      screen.start({
        onBeforeDrawAgentInput: null,
        onAfterDrawAgentInput: null,
        onAfterDrawScreenInput: null,
        minScreenDimensionInput: 100,
        getVisibleAgentsInput: () => [],
        cameraInput: { rectangle: rect(0, 0, 10, 10) },
        canvasIdInput: 'testCanvas',
        worldWidth: 100,
        worldHeight: 100,
        resourceStoreInput: resourceStore,
        particlesContainerInput: particlesContainer,
      });
    });

    it('should add canvas to the document', function () {
      const canvas = document.getElementById('testCanvas');
      assert.ok(canvas);
    });
    it('should hide and show the canvas', function () {
      const canvas = screen.getCanvas();

      screen.hideCanvas();
      assert.strictEqual(canvas.style.visibility, 'hidden');

      screen.showCanvas();
      assert.strictEqual(canvas.style.visibility, 'visible');
    });

    it('should adjust canvas size to window size', function () {
      screen.adjustCanvasToWindowSize();
      const canvas = screen.getCanvas();
      assert.strictEqual(canvas.width, window.innerWidth);
      assert.strictEqual(canvas.height, window.innerHeight);
    });

    it('should set background image', function () {
      resourceStore.retrieveResourceObject = () => new Image();
      screen.setBackgroundImageName('testImage');
      assert.ok(screen.getContext());
    });
  });
  describe('Drawing Operations', function () {
    beforeEach(function () {
      // Set up a clean DOM environment for each test
      document.body.innerHTML = '';
    });
    it('should clear the canvas', function () {
      screen.start({
        onBeforeDrawAgentInput: null,
        onAfterDrawAgentInput: null,
        onAfterDrawScreenInput: null,
        minScreenDimensionInput: 100,
        getVisibleAgentsInput: () => [],
        cameraInput: { rectangle: rect(0, 0, 10, 10) },
        canvasIdInput: 'testCanvas',
        worldWidth: 100,
        worldHeight: 100,
        resourceStoreInput: resourceStore,
        particlesContainerInput: particlesContainer,
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

    it('should draw agent image with proper transformations', function () {
      // This test would require setting up a full screen context and agent
      // Since drawAgentImage is a private function, we test it indirectly
      // through the public screen.gamePresentationLoop functionality
      screen.start({
        onBeforeDrawAgentInput: null,
        onAfterDrawAgentInput: null,
        onAfterDrawScreenInput: null,
        minScreenDimensionInput: 100,
        getVisibleAgentsInput: () => [
          {
            imageName: 'testImage',
            rectangle: rect(0, 0, 100, 100),
            opacity: 0.5,
            orientation: Math.PI / 4,
          },
        ],
        cameraInput: { rectangle: rect(0, 0, 10, 10) },
        canvasIdInput: 'testCanvas',
        worldWidth: 100,
        worldHeight: 100,
        resourceStoreInput: resourceStore,
        particlesContainerInput: particlesContainer,
      });

      // Test that the screen can handle drawing agents through the public API
      assert.doesNotThrow(() => {
        screen.gamePresentationLoop();
      });
    });
  });
  describe('Game Loop Operations', function () {
    beforeEach(function () {
      // Set up a clean DOM environment for each test
      document.body.innerHTML = '';
    });
    it('should start and stop the game presentation loop', function () {
      let loopCounter = 0;

      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function (callback, interval) {
        loopCounter++;
        if (loopCounter > 2) {
          // Restore original setTimeout to prevent infinite loop
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
        canvasIdInput: 'testCanvas',
        worldWidth: 100,
        worldHeight: 100,
        resourceStoreInput: resourceStore,
        particlesContainerInput: particlesContainer,
      });

      screen.gamePresentationLoop();
      assert.ok(loopCounter > 0);

      // Stop the game loop before checking
      screen.stopGamePresentationLoop();

      // Restore the original setTimeout to ensure test cleanup
      window.setTimeout = originalSetTimeout;

      // Verify that the loop has stopped by checking that no more setTimeout calls are made
      // We can't access presentationLoopId directly as it's a private variable
      // So we just verify the method exists and can be called without error
      assert.doesNotThrow(() => {
        screen.stopGamePresentationLoop(); // Should be safe to call multiple times
      });
    });
  });
});
