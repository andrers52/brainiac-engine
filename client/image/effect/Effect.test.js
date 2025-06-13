import { strict as assert } from "assert";
import sinon from "sinon";
import { Effect } from "./Effect.js";

// Mock dependencies
global.document = global.document || {
  createElement: sinon.stub().returns({
    width: 0,
    height: 0,
    getContext: sinon.stub().returns({
      drawImage: sinon.spy(),
      save: sinon.spy(),
      restore: sinon.spy(),
      fill: sinon.spy(),
      stroke: sinon.spy(),
      fillStyle: "#000000",
      strokeStyle: "#000000",
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
    }),
  }),
};

describe("Effect", function () {
  let mockResourceStore;
  let mockCanvas;
  let mockContext;
  let mockImage;

  beforeEach(function () {
    mockImage = {
      width: 100,
      height: 80,
    };

    mockContext = {
      canvas: null, // Will be set to mockCanvas below
      drawImage: sinon.spy(),
      save: sinon.spy(),
      restore: sinon.spy(),
      translate: sinon.spy(),
      rotate: sinon.spy(),
      scale: sinon.spy(),
      clearRect: sinon.spy(),
      fillRect: sinon.spy(),
      beginPath: sinon.spy(),
      moveTo: sinon.spy(),
      lineTo: sinon.spy(),
      arc: sinon.spy(),
      rect: sinon.spy(),
      fill: sinon.spy(),
      stroke: sinon.spy(),
      closePath: sinon.spy(),
      createRadialGradient: sinon.stub().returns({
        addColorStop: sinon.spy(),
      }),
      fillStyle: "#000000",
      strokeStyle: "#000000",
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      lineWidth: 1,
      shadowBlur: 0,
      shadowColor: "",
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: sinon.stub().returns(mockContext),
    };

    // Set the canvas reference on the context
    mockContext.canvas = mockCanvas;

    global.document.createElement = sinon.stub().returns(mockCanvas);

    mockResourceStore = {
      retrieveResourceObject: sinon.stub().returns(mockImage),
      createNewImageName: sinon.stub().returns("generated_image_123.jpg"),
      addLocalResource: sinon.spy(),
    };
  });

  afterEach(function () {
    // Reset all sinon spies and stubs
    sinon.restore();
  });

  describe("Canvas creation and sizing", function () {
    it("should create canvas with image dimensions when imageName provided", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert.strictEqual(mockCanvas.width, 100);
      assert.strictEqual(mockCanvas.height, 80);
      assert(mockContext.drawImage.calledWith(mockImage, 0, 0));
    });

    it("should create canvas with imageSize dimensions when provided", function () {
      const imageSize = { x: 200, y: 150 };

      Effect(
        mockResourceStore,
        null,
        imageSize,
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert.strictEqual(mockCanvas.width, 200);
      assert.strictEqual(mockCanvas.height, 150);
      assert.strictEqual(mockContext.drawImage.callCount, 0);
    });

    it("should prioritize imageSize over image dimensions", function () {
      const imageSize = { x: 300, y: 250 };

      Effect(
        mockResourceStore,
        "test_image.png",
        imageSize,
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert.strictEqual(mockCanvas.width, 300);
      assert.strictEqual(mockCanvas.height, 250);
    });
  });

  describe("Context state management", function () {
    it("should save and restore context", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
      assert(mockContext.fill.calledOnce);
      assert(mockContext.stroke.calledOnce);
    });

    it("should set default styles when context styles are black", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert.strictEqual(mockContext.fillStyle, "white");
      assert.strictEqual(mockContext.strokeStyle, "white");
    });

    it("should apply opacity when provided", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        0.5,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert.strictEqual(mockContext.globalAlpha, 0.5);
    });

    it("should apply fill and stroke colors when provided", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        "red",
        "blue",
        null,
        "Circle",
        null,
      );

      assert.strictEqual(mockContext.fillStyle, "red");
      assert.strictEqual(mockContext.strokeStyle, "blue");
    });

    it("should apply combine option when provided", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "Circle",
        null,
        "multiply",
      );

      assert.strictEqual(mockContext.globalCompositeOperation, "multiply");
    });
  });

  describe("Effect switching", function () {
    it("should handle RadialGradient effect", function () {
      const result = Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "RadialGradient",
        { startColor: "red", endColor: "blue" },
      );

      assert.strictEqual(result, "test_image.png");
      assert(
        mockResourceStore.addLocalResource.calledWith(
          "test_image.png",
          mockCanvas,
        ),
      );
    });

    it("should handle Ship effect", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "Ship",
        null,
      );

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
    });

    it("should handle Triangle effect", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "Triangle",
        null,
      );

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
    });

    it("should handle Star effect", function () {
      // Test that it executes without error
      assert.doesNotThrow(() => {
        Effect(
          mockResourceStore,
          "test_image.png",
          null,
          null,
          null,
          null,
          null,
          "Star",
          null,
        );
      });

      // Verify canvas creation happened
      assert(global.document.createElement.called);
      assert(mockCanvas.getContext.called);
    });

    it("should handle Circle effect", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
    });

    it("should handle DottedRectangle effect", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "DottedRectangle",
        null,
      );

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
    });
  });

  describe("Image creation and storage", function () {
    it("should create new image when no imageName provided", function () {
      const result = Effect(
        mockResourceStore,
        null,
        { x: 100, y: 100 },
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert.strictEqual(result, "generated_image_123.jpg");
      assert(mockResourceStore.createNewImageName.calledOnce);
      assert(
        mockResourceStore.addLocalResource.calledWith(
          "generated_image_123.jpg",
          mockCanvas,
        ),
      );
    });

    it("should use provided newImageName when creating new image", function () {
      const result = Effect(
        mockResourceStore,
        null,
        { x: 100, y: 100 },
        null,
        null,
        null,
        "custom_name.png",
        "Circle",
        null,
      );

      assert.strictEqual(result, "custom_name.png");
      assert.strictEqual(mockResourceStore.createNewImageName.callCount, 0);
      assert(
        mockResourceStore.addLocalResource.calledWith(
          "custom_name.png",
          mockCanvas,
        ),
      );
    });

    it("should overwrite existing image when imageName provided", function () {
      const result = Effect(
        mockResourceStore,
        "existing_image.png",
        null,
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert.strictEqual(result, "existing_image.png");
      assert(
        mockResourceStore.addLocalResource.calledWith(
          "existing_image.png",
          mockCanvas,
        ),
      );
    });
  });

  describe("Resource store interaction", function () {
    it("should retrieve image from resource store when imageName provided", function () {
      Effect(
        mockResourceStore,
        "test_image.png",
        null,
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert(
        mockResourceStore.retrieveResourceObject.calledWith("test_image.png"),
      );
    });

    it("should not retrieve image when no imageName provided", function () {
      Effect(
        mockResourceStore,
        null,
        { x: 100, y: 100 },
        null,
        null,
        null,
        null,
        "Circle",
        null,
      );

      assert.strictEqual(mockResourceStore.retrieveResourceObject.callCount, 0);
    });
  });

  describe("Parameter handling", function () {
    it("should handle all parameters together", function () {
      const result = Effect(
        mockResourceStore,
        "base_image.png",
        { x: 150, y: 120 },
        0.8,
        "yellow",
        "green",
        "result_image.png",
        "Star",
        { points: 5 },
        "overlay",
      );

      // Should use imageSize dimensions
      assert.strictEqual(mockCanvas.width, 150);
      assert.strictEqual(mockCanvas.height, 120);

      // Should apply all style parameters
      assert.strictEqual(mockContext.globalAlpha, 0.8);
      assert.strictEqual(mockContext.fillStyle, "yellow");
      assert.strictEqual(mockContext.strokeStyle, "green");
      assert.strictEqual(mockContext.globalCompositeOperation, "overlay");

      // Should overwrite existing image (not create new one)
      assert.strictEqual(result, "base_image.png");
    });

    it("should handle undefined/null parameters gracefully", function () {
      assert.doesNotThrow(() => {
        Effect(
          mockResourceStore,
          null,
          { x: 100, y: 100 },
          null,
          null,
          null,
          null,
          "Circle",
          null,
          null,
        );
      });
    });
  });
});
