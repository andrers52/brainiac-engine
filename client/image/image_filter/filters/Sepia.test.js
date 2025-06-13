import { strict as assert } from "assert";
import sinon from "sinon";
import { Sepia } from "./Sepia.js";

// Helper function to simulate Uint8ClampedArray rounding (round half to even / banker's rounding)
function clampedRound(value) {
  const rounded = Math.round(value);
  // For exact .5 values, Math.round uses "round half away from zero"
  // but Uint8ClampedArray uses "round half to even"
  if (Math.abs(value - Math.floor(value) - 0.5) < Number.EPSILON) {
    const floor = Math.floor(value);
    return floor % 2 === 0 ? floor : floor + 1;
  }
  return Math.max(0, Math.min(255, rounded));
}

describe("Sepia", function () {
  let sandbox;
  let mockImageData;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Create mock ImageData with known values
    mockImageData = {
      width: 2,
      height: 2,
      data: new Uint8ClampedArray([
        // Pixel 1: Pure red
        255, 0, 0, 255,
        // Pixel 2: Pure green
        0, 255, 0, 255,
        // Pixel 3: Pure blue
        0, 0, 255, 255,
        // Pixel 4: Gray
        128, 128, 128, 255,
      ]),
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("Basic functionality", function () {
    it("should apply sepia tone using luminance calculation", function () {
      const originalData = new Uint8ClampedArray(mockImageData.data);

      const result = Sepia(mockImageData);

      // Check each pixel conversion
      for (let i = 0; i < result.data.length; i += 4) {
        const originalR = originalData[i];
        const originalG = originalData[i + 1];
        const originalB = originalData[i + 2];

        const avg = 0.3 * originalR + 0.59 * originalG + 0.11 * originalB;

        assert.strictEqual(result.data[i], clampedRound(avg + 100)); // Red = avg + 100
        assert.strictEqual(result.data[i + 1], clampedRound(avg + 50)); // Green = avg + 50
        assert.strictEqual(result.data[i + 2], clampedRound(avg)); // Blue = avg
        assert.strictEqual(result.data[i + 3], originalData[i + 3]); // Alpha unchanged
      }
    });

    it("should return the modified imageData object", function () {
      const result = Sepia(mockImageData);

      assert.strictEqual(result, mockImageData);
    });

    it("should not modify alpha channel", function () {
      const originalAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );

      Sepia(mockImageData);

      const newAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );
      assert.deepStrictEqual(newAlpha, originalAlpha);
    });
  });

  describe("Sepia tone calculation", function () {
    it("should handle pure red correctly", function () {
      const redImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      Sepia(redImageData);

      const avg = 255 * 0.3; // 76.5
      assert.strictEqual(redImageData.data[0], clampedRound(avg + 100)); // 176.5 -> 176
      assert.strictEqual(redImageData.data[1], clampedRound(avg + 50)); // 126.5 -> 126
      assert.strictEqual(redImageData.data[2], clampedRound(avg)); // 76.5 -> 76
    });

    it("should handle pure green correctly", function () {
      const greenImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 255, 0, 255]),
      };

      Sepia(greenImageData);

      const avg = 255 * 0.59; // 150.45
      assert.strictEqual(greenImageData.data[0], clampedRound(avg + 100)); // 250.45 -> 250
      assert.strictEqual(greenImageData.data[1], clampedRound(avg + 50)); // 200.45 -> 200
      assert.strictEqual(greenImageData.data[2], clampedRound(avg)); // 150.45 -> 150
    });

    it("should handle pure blue correctly", function () {
      const blueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255]),
      };

      Sepia(blueImageData);

      const avg = 255 * 0.11; // 28.05
      assert.strictEqual(blueImageData.data[0], clampedRound(avg + 100)); // 128.05 -> 128
      assert.strictEqual(blueImageData.data[1], clampedRound(avg + 50)); // 78.05 -> 78
      assert.strictEqual(blueImageData.data[2], clampedRound(avg)); // 28.05 -> 28
    });

    it("should handle white correctly", function () {
      const whiteImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 255, 255, 255]),
      };

      Sepia(whiteImageData);

      const avg = 255 * (0.3 + 0.59 + 0.11); // 255
      assert.strictEqual(whiteImageData.data[0], clampedRound(avg + 100)); // 355 -> 255 (clamped)
      assert.strictEqual(whiteImageData.data[1], clampedRound(avg + 50)); // 305 -> 255 (clamped)
      assert.strictEqual(whiteImageData.data[2], clampedRound(avg)); // 255
    });

    it("should handle black correctly", function () {
      const blackImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 0, 255]),
      };

      Sepia(blackImageData);

      const avg = 0; // All channels are 0
      assert.strictEqual(blackImageData.data[0], avg + 100); // 100
      assert.strictEqual(blackImageData.data[1], avg + 50); // 50
      assert.strictEqual(blackImageData.data[2], avg); // 0
    });
  });

  describe("Sepia characteristics", function () {
    it("should create warm tones (red > green > blue)", function () {
      const imageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 100, 100, 255]), // Gray
      };

      Sepia(imageData);

      // For gray input, all channels contribute equally to avg
      const avg = 100; // 100 * (0.3 + 0.59 + 0.11) = 100

      assert.strictEqual(imageData.data[0], avg + 100); // Red = 200
      assert.strictEqual(imageData.data[1], avg + 50); // Green = 150
      assert.strictEqual(imageData.data[2], avg); // Blue = 100

      // Verify warm tone: Red > Green > Blue
      assert(imageData.data[0] > imageData.data[1]);
      assert(imageData.data[1] > imageData.data[2]);
    });

    it("should maintain relative brightness order", function () {
      const imageData = {
        width: 3,
        height: 1,
        data: new Uint8ClampedArray([
          50,
          50,
          50,
          255, // Dark gray
          128,
          128,
          128,
          255, // Medium gray
          200,
          200,
          200,
          255, // Light gray
        ]),
      };

      Sepia(imageData);

      // All pixels should maintain their relative brightness in red channel
      assert(imageData.data[0] < imageData.data[4]); // Dark < Medium
      assert(imageData.data[4] < imageData.data[8]); // Medium < Light
    });

    it("should preserve luminance information", function () {
      const colorImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([120, 80, 40, 255]),
      };

      Sepia(colorImageData);

      const expectedAvg = 120 * 0.3 + 80 * 0.59 + 40 * 0.11; // 87.6
      assert.strictEqual(colorImageData.data[2], clampedRound(expectedAvg)); // Blue channel preserves luminance
    });
  });

  describe("Edge cases", function () {
    it("should handle empty imageData", function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      const result = Sepia(emptyImageData);

      assert.strictEqual(result, emptyImageData);
      assert.strictEqual(result.data.length, 0);
    });

    it("should handle single pixel image", function () {
      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([75, 150, 100, 255]),
      };

      Sepia(singlePixelImageData);

      const expectedAvg = 75 * 0.3 + 150 * 0.59 + 100 * 0.11; // 112
      assert.strictEqual(singlePixelImageData.data[0], expectedAvg + 100); // 212
      assert.strictEqual(singlePixelImageData.data[1], expectedAvg + 50); // 162
      assert.strictEqual(singlePixelImageData.data[2], expectedAvg); // 112
      assert.strictEqual(singlePixelImageData.data[3], 255); // Alpha unchanged
    });

    it("should handle large image data", function () {
      const largeImageData = {
        width: 100,
        height: 100,
        data: new Uint8ClampedArray(100 * 100 * 4),
      };

      // Fill with pattern
      for (let i = 0; i < largeImageData.data.length; i += 4) {
        largeImageData.data[i] = 60; // Red
        largeImageData.data[i + 1] = 120; // Green
        largeImageData.data[i + 2] = 180; // Blue
        largeImageData.data[i + 3] = 255; // Alpha
      }

      const result = Sepia(largeImageData);
      const expectedAvg = 60 * 0.3 + 120 * 0.59 + 180 * 0.11; // 108.6

      // Check a few random pixels
      assert.strictEqual(result.data[0], clampedRound(expectedAvg + 100)); // 208.6 -> 209
      assert.strictEqual(result.data[1], clampedRound(expectedAvg + 50)); // 158.6 -> 159
      assert.strictEqual(result.data[2], clampedRound(expectedAvg)); // 108.6 -> 109
      assert.strictEqual(result.data[400], clampedRound(expectedAvg + 100)); // Another pixel
    });
  });

  describe("Value overflow", function () {
    it("should clamp red channel when it would exceed 255", function () {
      const brightImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([200, 200, 200, 255]),
      };

      Sepia(brightImageData);

      const avg = 200; // Gray input: avg = 200
      assert.strictEqual(brightImageData.data[0], clampedRound(300)); // 200 + 100 = 300 -> 255 (clamped)
      assert.strictEqual(brightImageData.data[1], clampedRound(250)); // 200 + 50 = 250
      assert.strictEqual(brightImageData.data[2], clampedRound(200)); // 200
    });

    it("should clamp green channel when it would exceed 255", function () {
      const veryBrightImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 255, 255, 255]),
      };

      Sepia(veryBrightImageData);

      const avg = 255;
      assert.strictEqual(veryBrightImageData.data[0], clampedRound(355)); // 255 + 100 = 355 -> 255 (clamped)
      assert.strictEqual(veryBrightImageData.data[1], clampedRound(305)); // 255 + 50 = 305 -> 255 (clamped)
      assert.strictEqual(veryBrightImageData.data[2], clampedRound(255)); // 255
    });
  });

  describe("Floating point precision", function () {
    it("should handle fractional luminance values", function () {
      const imageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([123, 67, 89, 255]),
      };

      Sepia(imageData);

      const expectedAvg = 123 * 0.3 + 67 * 0.59 + 89 * 0.11; // 86.42
      assert.strictEqual(imageData.data[0], clampedRound(expectedAvg + 100)); // 186.42 -> 186
      assert.strictEqual(imageData.data[1], clampedRound(expectedAvg + 50)); // 136.42 -> 136
      assert.strictEqual(imageData.data[2], clampedRound(expectedAvg)); // 86.42 -> 86
    });
  });

  describe("Data integrity", function () {
    it("should maintain imageData structure", function () {
      const result = Sepia(mockImageData);

      assert(result.hasOwnProperty("width"));
      assert(result.hasOwnProperty("height"));
      assert(result.hasOwnProperty("data"));
      assert(result.data instanceof Uint8ClampedArray);
    });

    it("should not change imageData dimensions", function () {
      const originalWidth = mockImageData.width;
      const originalHeight = mockImageData.height;
      const originalLength = mockImageData.data.length;

      Sepia(mockImageData);

      assert.strictEqual(mockImageData.width, originalWidth);
      assert.strictEqual(mockImageData.height, originalHeight);
      assert.strictEqual(mockImageData.data.length, originalLength);
    });

    it("should process all pixels", function () {
      const pixelCount = mockImageData.width * mockImageData.height;

      Sepia(mockImageData);

      // Verify all pixels were processed
      for (let i = 0; i < pixelCount * 4; i += 4) {
        assert(typeof mockImageData.data[i] === "number"); // Red
        assert(typeof mockImageData.data[i + 1] === "number"); // Green
        assert(typeof mockImageData.data[i + 2] === "number"); // Blue
        assert(typeof mockImageData.data[i + 3] === "number"); // Alpha

        // Verify sepia characteristics: Red >= Green >= Blue
        assert(mockImageData.data[i] >= mockImageData.data[i + 1]);
        assert(mockImageData.data[i + 1] >= mockImageData.data[i + 2]);
      }
    });
  });
});
