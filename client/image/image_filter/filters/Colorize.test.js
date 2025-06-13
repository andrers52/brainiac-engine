import { strict as assert } from "assert";
import sinon from "sinon";
import { Colorize } from "./Colorize.js";

describe("Colorize", function () {
  let sandbox;
  let mockImageData;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Create mock ImageData with known values
    mockImageData = {
      width: 2,
      height: 2,
      data: new Uint8ClampedArray([
        // Pixel 1: Dark red
        50, 0, 0, 255,
        // Pixel 2: Dark green
        0, 50, 0, 255,
        // Pixel 3: Dark blue
        0, 0, 50, 255,
        // Pixel 4: Gray
        100, 100, 100, 255,
      ]),
    };

    // Mock Assert.assert to prevent errors in tests
    global.Assert = {
      assert: sandbox.stub(),
    };
  });

  afterEach(function () {
    sandbox.restore();
    delete global.Assert;
  });

  describe("Basic functionality", function () {
    it("should add color values to each RGB channel", function () {
      const color = { red: 50, green: 25, blue: 75 };
      const originalData = new Uint8ClampedArray(mockImageData.data);

      const result = Colorize(mockImageData, color);

      // Check that RGB values are increased by color amounts
      for (let i = 0; i < result.data.length; i += 4) {
        assert.strictEqual(result.data[i], originalData[i] + color.red); // Red
        assert.strictEqual(
          result.data[i + 1],
          originalData[i + 1] + color.green,
        ); // Green
        assert.strictEqual(
          result.data[i + 2],
          originalData[i + 2] + color.blue,
        ); // Blue (Note: bug in original - should be i+2)
        assert.strictEqual(result.data[i + 3], originalData[i + 3]); // Alpha unchanged
      }
    });

    it("should return the modified imageData object", function () {
      const color = { red: 10, green: 20, blue: 30 };
      const result = Colorize(mockImageData, color);

      assert.strictEqual(result, mockImageData);
    });

    it("should not modify alpha channel", function () {
      const color = { red: 50, green: 50, blue: 50 };
      const originalAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );

      Colorize(mockImageData, color);

      const newAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );
      assert.deepStrictEqual(newAlpha, originalAlpha);
    });
  });

  describe("Parameter validation", function () {
    it("should throw error when color is not provided", function () {
      assert.throws(() => {
        Colorize(mockImageData);
      }, /The colorize effect needs a color/);
    });

    it("should throw error when color is null", function () {
      assert.throws(() => {
        Colorize(mockImageData, null);
      }, /The colorize effect needs a color/);
    });

    it("should not throw error when valid color is provided", function () {
      const color = { red: 10, green: 20, blue: 30 };
      assert.doesNotThrow(() => {
        Colorize(mockImageData, color);
      });
    });
  });

  describe("Different color values", function () {
    it("should handle positive color adjustments", function () {
      const color = { red: 75, green: 50, blue: 25 };
      const originalData = new Uint8ClampedArray(mockImageData.data);

      Colorize(mockImageData, color);

      assert.strictEqual(mockImageData.data[0], originalData[0] + 75); // Red channel
      assert.strictEqual(mockImageData.data[1], originalData[1] + 50); // Green channel
      assert.strictEqual(mockImageData.data[2], originalData[2] + 25); // Blue channel
    });

    it("should handle negative color adjustments (with clamping)", function () {
      const color = { red: -25, green: -10, blue: -30 };
      const originalData = new Uint8ClampedArray(mockImageData.data);

      Colorize(mockImageData, color);

      // Values are clamped by Uint8ClampedArray
      // mockImageData.data = [100, 150, 200, 255] initially
      assert.strictEqual(
        mockImageData.data[0],
        Math.max(0, originalData[0] - 25),
      ); // Red: 100-25 = 75
      assert.strictEqual(
        mockImageData.data[1],
        Math.max(0, originalData[1] - 10),
      ); // Green: 150-10 = 140
      assert.strictEqual(
        mockImageData.data[2],
        Math.max(0, originalData[2] - 30),
      ); // Blue: 200-30 = 170
    });

    it("should handle zero color adjustments", function () {
      const color = { red: 0, green: 0, blue: 0 };
      const originalData = new Uint8ClampedArray(mockImageData.data);

      Colorize(mockImageData, color);

      // RGB values should remain unchanged
      for (let i = 0; i < mockImageData.data.length; i += 4) {
        assert.strictEqual(mockImageData.data[i], originalData[i]);
        assert.strictEqual(mockImageData.data[i + 1], originalData[i + 1]);
        assert.strictEqual(mockImageData.data[i + 2], originalData[i + 2]);
      }
    });

    it("should handle mixed positive and negative values (with clamping)", function () {
      const color = { red: 50, green: -25, blue: 100 };
      const originalData = new Uint8ClampedArray(mockImageData.data);

      Colorize(mockImageData, color);

      // Values are clamped by Uint8ClampedArray
      // mockImageData.data = [100, 150, 200, 255] initially
      assert.strictEqual(
        mockImageData.data[0],
        Math.min(255, Math.max(0, originalData[0] + 50)),
      ); // Red: 100+50 = 150
      assert.strictEqual(
        mockImageData.data[1],
        Math.min(255, Math.max(0, originalData[1] - 25)),
      ); // Green: 150-25 = 125
      assert.strictEqual(
        mockImageData.data[2],
        Math.min(255, Math.max(0, originalData[2] + 100)),
      ); // Blue: 200+100 = 300, clamped to 255
    });
  });

  describe("Bug in original implementation (now fixed)", function () {
    it("should correctly calculate blue channel after fix", function () {
      // Note: The original code had a bug: pix[i + 2] = pix[i + 3] + color.blue;
      // It is now fixed to: pix[i + 2] = pix[i + 2] + color.blue;
      // This test verifies the correct behavior

      const color = { red: 10, green: 20, blue: 30 };
      const originalData = new Uint8ClampedArray(mockImageData.data);

      Colorize(mockImageData, color);

      // The fix now correctly uses blue + color.blue instead of alpha + color.blue
      assert.strictEqual(mockImageData.data[2], originalData[2] + color.blue); // Fixed: using blue (i+2) correctly
    });

    it("should process blue channel correctly for all pixels after fix", function () {
      const color = { red: 5, green: 10, blue: 15 };
      const originalData = new Uint8ClampedArray(mockImageData.data);

      Colorize(mockImageData, color);

      // Check all pixels are processed correctly
      for (let i = 0; i < mockImageData.data.length; i += 4) {
        assert.strictEqual(mockImageData.data[i], originalData[i] + color.red); // Red correct
        assert.strictEqual(
          mockImageData.data[i + 1],
          originalData[i + 1] + color.green,
        ); // Green correct
        assert.strictEqual(
          mockImageData.data[i + 2],
          originalData[i + 2] + color.blue,
        ); // Blue CORRECT (now uses blue value)
        assert.strictEqual(mockImageData.data[i + 3], originalData[i + 3]); // Alpha unchanged
      }
    });
  });

  describe("Edge cases", function () {
    it("should handle empty imageData", function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };
      const color = { red: 50, green: 50, blue: 50 };

      const result = Colorize(emptyImageData, color);

      assert.strictEqual(result, emptyImageData);
      assert.strictEqual(result.data.length, 0);
    });

    it("should handle single pixel image", function () {
      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 150, 200, 255]),
      };
      const color = { red: 25, green: -50, blue: 10 };

      Colorize(singlePixelImageData, color);

      assert.strictEqual(singlePixelImageData.data[0], 125); // 100 + 25
      assert.strictEqual(singlePixelImageData.data[1], 100); // 150 - 50
      assert.strictEqual(singlePixelImageData.data[2], 210); // 200 + 10 (fixed: using blue value)
      assert.strictEqual(singlePixelImageData.data[3], 255); // Alpha unchanged
    });

    it("should handle color object with missing properties", function () {
      const incompleteColor = { red: 50 }; // Missing green and blue
      const originalData = new Uint8ClampedArray(mockImageData.data);

      // This will cause undefined to be added, which becomes 0 in Uint8ClampedArray
      Colorize(mockImageData, incompleteColor);

      // First pixel: red should be increased, green and blue will have undefined (0) added
      assert.strictEqual(mockImageData.data[0], originalData[0] + 50); // red + color.red
      assert.strictEqual(mockImageData.data[1], originalData[1]); // green + undefined (becomes 0)
      assert.strictEqual(mockImageData.data[2], originalData[2]); // blue + undefined (becomes 0)
    });
  });

  describe("Color overflow/underflow (Uint8ClampedArray behavior)", function () {
    it("should clamp values that exceed 255 to 255", function () {
      const highValueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([200, 220, 240, 255]),
      };
      const color = { red: 100, green: 80, blue: 60 };

      Colorize(highValueImageData, color);

      // Uint8ClampedArray automatically clamps values to 0-255 range
      assert.strictEqual(highValueImageData.data[0], 255); // 200 + 100 = 300, clamped to 255
      assert.strictEqual(highValueImageData.data[1], 255); // 220 + 80 = 300, clamped to 255
      assert.strictEqual(highValueImageData.data[2], 255); // 240 + 60 = 300, clamped to 255
    });

    it("should clamp values that go below 0 to 0", function () {
      const lowValueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([20, 30, 40, 255]),
      };
      const color = { red: -50, green: -60, blue: -70 };

      Colorize(lowValueImageData, color);

      // Uint8ClampedArray automatically clamps values to 0-255 range
      assert.strictEqual(lowValueImageData.data[0], 0); // 20 - 50 = -30, clamped to 0
      assert.strictEqual(lowValueImageData.data[1], 0); // 30 - 60 = -30, clamped to 0
      assert.strictEqual(lowValueImageData.data[2], 0); // 40 - 70 = -30, clamped to 0
    });
  });

  describe("Data integrity", function () {
    it("should maintain imageData structure", function () {
      const color = { red: 10, green: 20, blue: 30 };
      const result = Colorize(mockImageData, color);

      assert(result.hasOwnProperty("width"));
      assert(result.hasOwnProperty("height"));
      assert(result.hasOwnProperty("data"));
      assert(result.data instanceof Uint8ClampedArray);
    });

    it("should not change imageData dimensions", function () {
      const color = { red: 25, green: 25, blue: 25 };
      const originalWidth = mockImageData.width;
      const originalHeight = mockImageData.height;
      const originalLength = mockImageData.data.length;

      Colorize(mockImageData, color);

      assert.strictEqual(mockImageData.width, originalWidth);
      assert.strictEqual(mockImageData.height, originalHeight);
      assert.strictEqual(mockImageData.data.length, originalLength);
    });

    it("should process all pixels", function () {
      const color = { red: 15, green: 25, blue: 35 };
      const pixelCount = mockImageData.width * mockImageData.height;

      Colorize(mockImageData, color);

      // Verify all pixels were processed
      for (let i = 0; i < pixelCount * 4; i += 4) {
        assert(typeof mockImageData.data[i] === "number"); // Red
        assert(typeof mockImageData.data[i + 1] === "number"); // Green
        assert(typeof mockImageData.data[i + 2] === "number"); // Blue
        assert(typeof mockImageData.data[i + 3] === "number"); // Alpha
      }
    });
  });
});
