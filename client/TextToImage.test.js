import { strict as assert } from "assert";
import sinon from "sinon";
import { TextToImage } from "./TextToImage.js";

describe("TextToImage", function () {
  let sandbox;
  let mockResourceStore;
  let mockContext;
  let mockCanvas;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Mock canvas and context
    mockCanvas = {
      width: 100,
      height: 50,
      getContext: sinon.stub(),
    };

    mockContext = {
      font: "",
      fillStyle: "",
      textBaseline: "",
      textAlign: "",
      canvas: mockCanvas,
      measureText: sinon.stub().returns({ width: 50 }),
      clearRect: sinon.stub(),
      beginPath: sinon.stub(),
      rect: sinon.stub(),
      fill: sinon.stub(),
      fillText: sinon.stub(),
    };

    mockCanvas.getContext.returns(mockContext);

    // Mock ResourceStore
    mockResourceStore = {
      retrieveResourceObject: sinon.stub().returns(mockCanvas),
      createNewImage: sinon.stub().returns("test-image-123"),
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("fontToFontFace", function () {
    it("should extract font face from font string", function () {
      const result = TextToImage.fontToFontFace("24px Arial");
      assert.strictEqual(result, " Arial");
    });

    it("should handle default font parameter", function () {
      const result = TextToImage.fontToFontFace();
      // The default font is "14px GoodDog", so extracting font face returns " GoodDog"
      // Note: There's a typo in the original code - "lenght" should be "length"
      // This test reflects the current behavior
      assert.strictEqual(result, " GoodDog");
    });

    it("should handle font string with multiple spaces", function () {
      const result = TextToImage.fontToFontFace("16px Times New Roman");
      assert.strictEqual(result, " Times New Roman");
    });
  });

  describe("drawText", function () {
    it("should draw text with all parameters", function () {
      TextToImage.drawText(
        mockResourceStore,
        "test-image",
        "Hello World",
        "16px Arial",
        "blue",
        "white",
      );

      assert(mockResourceStore.retrieveResourceObject.calledWith("test-image"));
      assert(mockContext.clearRect.calledWith(0, 0, 100, 50));
      assert(mockContext.beginPath.called);
      assert(mockContext.rect.calledWith(0, 0, 100, 50));
      assert.strictEqual(mockContext.fillStyle, "white");
      assert.strictEqual(mockContext.font, "16px Arial");
      assert.strictEqual(mockContext.textBaseline, "bottom");
      assert.strictEqual(mockContext.textAlign, "center");
      assert(mockContext.fillText.calledWith("Hello World", 50, 50));
    });

    it("should handle empty text with transparent background", function () {
      TextToImage.drawText(
        mockResourceStore,
        "test-image",
        "",
        "16px Arial",
        "blue",
        "white",
      );

      // Background should be set to transparent for empty text
      assert(mockContext.beginPath.called);
      assert.strictEqual(mockContext.fillStyle, "white"); // Text color is still set
    });

    it("should skip background drawing when backgroundColor is falsy", function () {
      TextToImage.drawText(
        mockResourceStore,
        "test-image",
        "Hello",
        "16px Arial",
        null,
        "black",
      );

      assert(mockContext.clearRect.called);
      assert(mockContext.beginPath.notCalled);
      assert(mockContext.fillText.calledWith("Hello", 50, 50));
    });

    it("should set correct context properties for text drawing", function () {
      TextToImage.drawText(
        mockResourceStore,
        "test-image",
        "Test",
        "20px Helvetica",
        "red",
        "green",
      );

      assert.strictEqual(mockContext.font, "20px Helvetica");
      assert.strictEqual(mockContext.fillStyle, "green");
      assert.strictEqual(mockContext.textBaseline, "bottom");
      assert.strictEqual(mockContext.textAlign, "center");
    });
  });

  describe("createRectangleFromTextAndFont", function () {
    it("should create rectangle from text and font measurements", function () {
      mockContext.measureText.returns({ width: 120 });

      const result = TextToImage.createRectangleFromTextAndFont(
        "24px Arial",
        "Hello World",
        mockContext,
      );

      assert.strictEqual(mockContext.font, "24px Arial");
      assert(mockContext.measureText.calledWith("Hello World"));
      assert.strictEqual(result.size.x, 120);
      assert.strictEqual(result.size.y, 24);
    });

    it("should handle minimum width of 1", function () {
      mockContext.measureText.returns({ width: 0 });

      const result = TextToImage.createRectangleFromTextAndFont(
        "16px Arial",
        "",
        mockContext,
      );

      assert.strictEqual(result.size.x, 1);
      assert.strictEqual(result.size.y, 16);
    });

    it("should extract font size correctly from various font strings", function () {
      mockContext.measureText.returns({ width: 50 });

      const result1 = TextToImage.createRectangleFromTextAndFont(
        "12px Arial",
        "test",
        mockContext,
      );
      const result2 = TextToImage.createRectangleFromTextAndFont(
        "bold 18px Helvetica",
        "test",
        mockContext,
      );

      assert.strictEqual(result1.size.y, 12);
      assert.strictEqual(result2.size.y, 18);
    });

    it("should throw error when font parameter is missing", function () {
      assert.throws(
        () =>
          TextToImage.createRectangleFromTextAndFont(null, "text", mockContext),
        /expecting font parameter/,
      );
    });

    it("should throw error when font parameter is not a string", function () {
      assert.throws(
        () =>
          TextToImage.createRectangleFromTextAndFont(123, "text", mockContext),
        /font is not a string literal/,
      );
    });
  });

  describe("createImageFromText", function () {
    beforeEach(function () {
      // Mock the getFontToFitTextOnRectangle function to avoid infinite loops
      mockContext.measureText = sinon.stub().callsFake(() => {
        // Extract current font size from the font string that was set
        const currentFont = mockContext.font || "16px Arial";
        const fontSize = parseInt(currentFont.match(/\d+/)[0]) || 16;

        // Simulate text width that scales with font size but becomes small quickly
        // This ensures the font fitting loop terminates reasonably fast
        if (fontSize > 50) {
          return { width: 200 }; // Too large initially
        } else if (fontSize > 20) {
          return { width: 50 }; // Medium size
        } else {
          return { width: 10 }; // Small enough to fit most rectangles
        }
      });
    });

    it("should return null for empty text", function () {
      const result = TextToImage.createImageFromText(
        mockResourceStore,
        undefined,
        "",
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      assert.deepStrictEqual(result, { imageName: null, font: null });
    });

    it("should throw error for non-string text parameter", function () {
      assert.throws(
        () =>
          TextToImage.createImageFromText(
            mockResourceStore,
            undefined,
            123,
            undefined,
            undefined,
            undefined,
            mockContext,
          ),
        /text is not a string literal/,
      );
    });

    it("should create image with default parameters", function () {
      const result = TextToImage.createImageFromText(
        mockResourceStore,
        undefined,
        "Hello",
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      assert.strictEqual(result.imageName, "test-image-123");
      assert(typeof result.font === "string");
      assert(mockResourceStore.createNewImage.called);
    });

    it("should create image with custom rectangle", function () {
      const customRect = { center: { x: 50, y: 25 }, size: { x: 200, y: 100 } };

      TextToImage.createImageFromText(
        mockResourceStore,
        customRect,
        "Custom Text",
        "Helvetica",
        "yellow",
        "purple",
        mockContext,
      );

      // Should create image with doubled size (400x200)
      assert(mockResourceStore.createNewImage.calledWith(400, 200, true));
    });

    it("should cache created images", function () {
      // Create two calls with the same text
      const result1 = TextToImage.createImageFromText(
        mockResourceStore,
        undefined, // Use undefined to trigger default parameter
        "Cached Text",
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      // Reset the mock to verify it's not called again for cached result
      mockResourceStore.createNewImage.resetHistory();

      const result2 = TextToImage.createImageFromText(
        mockResourceStore,
        undefined, // Use undefined to trigger default parameter
        "Cached Text",
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      // Both results should be identical (same reference)
      assert.strictEqual(result1.imageName, result2.imageName);
      assert.strictEqual(result1.font, result2.font);

      // Second call should not create a new image (cached)
      assert(mockResourceStore.createNewImage.notCalled);
    });

    it("should handle custom font face", function () {
      TextToImage.createImageFromText(
        mockResourceStore,
        undefined,
        "Custom Font",
        "Times New Roman",
        undefined,
        undefined,
        mockContext,
      );

      assert(mockResourceStore.createNewImage.called);
      assert.strictEqual(mockResourceStore.createNewImage.args[0][2], true);
    });

    it("should handle custom colors", function () {
      const drawTextSpy = sinon.spy(TextToImage, "drawText");

      TextToImage.createImageFromText(
        mockResourceStore,
        undefined,
        "Colored Text",
        "Arial",
        "rgba(255, 0, 0, 0.5)",
        "#00FF00",
        mockContext,
      );

      assert(
        drawTextSpy.calledWith(
          mockResourceStore,
          "test-image-123",
          "Colored Text",
          sinon.match.string,
          "rgba(255, 0, 0, 0.5)",
          "#00FF00",
        ),
      );

      drawTextSpy.restore();
    });
  });

  describe("Font fitting algorithm", function () {
    it("should reduce font size until text fits rectangle", function () {
      // Mock context to simulate text that's too wide initially, then fits
      let callCount = 0;
      mockContext.measureText = sinon.stub().callsFake(() => {
        callCount++;
        // Simulate text that gets smaller as font size decreases
        // First call (large font): width 150, subsequent calls: decreasing width
        if (callCount === 1) return { width: 150 }; // Too wide
        if (callCount === 2) return { width: 120 }; // Still too wide
        return { width: 80 }; // Fits within 100px rectangle width
      });

      TextToImage.createImageFromText(
        mockResourceStore,
        { center: { x: 50, y: 25 }, size: { x: 100, y: 50 } }, // Will be doubled to 200x100
        "Long Text That Needs Fitting",
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      // Should have called measureText multiple times to find fitting font
      assert(mockContext.measureText.callCount >= 2);
    });
  });

  describe("Rectangle creation and size calculations", function () {
    it("should double rectangle size for smooth scaling", function () {
      const rect = { center: { x: 50, y: 25 }, size: { x: 100, y: 50 } };

      TextToImage.createImageFromText(
        mockResourceStore,
        rect,
        "Test Text",
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      // Should create image with doubled dimensions
      assert(mockResourceStore.createNewImage.calledWith(200, 100, true));
    });

    it("should handle default rectangle size", function () {
      TextToImage.createImageFromText(
        mockResourceStore,
        undefined,
        "Test",
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      // Should use default rectangle (100x100) doubled to (200x200)
      assert(mockResourceStore.createNewImage.calledWith(200, 200, true));
    });
  });

  describe("Error handling and edge cases", function () {
    it("should handle zero-width text measurement", function () {
      mockContext.measureText.returns({ width: 0 });

      const result = TextToImage.createRectangleFromTextAndFont(
        "16px Arial",
        "",
        mockContext,
      );

      assert.strictEqual(result.size.x, 1); // Should use minimum width of 1
    });

    it("should handle small rectangles", function () {
      const smallRect = { center: { x: 50, y: 50 }, size: { x: 50, y: 50 } }; // Reasonable small size

      TextToImage.createImageFromText(
        mockResourceStore,
        smallRect,
        "X",
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      // Should still create image with doubled size
      assert(mockResourceStore.createNewImage.calledWith(100, 100, true));
    });

    it("should handle special characters in text", function () {
      const specialText = "éñ$₹@#%^&*()";

      TextToImage.createImageFromText(
        mockResourceStore,
        undefined,
        specialText,
        undefined,
        undefined,
        undefined,
        mockContext,
      );

      assert(mockResourceStore.createNewImage.called);
    });
  });
});
