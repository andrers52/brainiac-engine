import { strict as assert } from "assert";
import sinon from "sinon";
import { GrayScale } from "./GrayScale.js";

describe("GrayScale", function () {
  let sandbox;
  let mockImageData;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Create mock ImageData with known values for easy testing
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
        // Pixel 4: White
        255, 255, 255, 255,
      ]),
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  // Helper function to simulate Uint8ClampedArray rounding behavior (round half to even)
  function clampedRound(value) {
    const floor = Math.floor(value);
    const decimal = value - floor;

    if (decimal < 0.5) {
      return floor;
    } else if (decimal > 0.5) {
      return floor + 1;
    } else {
      // Exactly 0.5 - round to nearest even number
      return floor % 2 === 0 ? floor : floor + 1;
    }
  }

  describe("Basic functionality", function () {
    it("should convert RGB values to grayscale using luminance formula", function () {
      const originalData = new Uint8ClampedArray(mockImageData.data);

      const result = GrayScale(mockImageData);

      // Check each pixel conversion
      for (let i = 0; i < result.data.length; i += 4) {
        const originalR = originalData[i];
        const originalG = originalData[i + 1];
        const originalB = originalData[i + 2];

        const expectedGrayscale =
          originalR * 0.3 + originalG * 0.59 + originalB * 0.11;

        // Uint8ClampedArray uses "round half to even" behavior
        const clampedGrayscale = clampedRound(expectedGrayscale);

        assert.strictEqual(result.data[i], clampedGrayscale); // Red = grayscale
        assert.strictEqual(result.data[i + 1], clampedGrayscale); // Green = grayscale
        assert.strictEqual(result.data[i + 2], clampedGrayscale); // Blue = grayscale
        assert.strictEqual(result.data[i + 3], originalData[i + 3]); // Alpha unchanged
      }
    });

    it("should return the modified imageData object", function () {
      const result = GrayScale(mockImageData);

      assert.strictEqual(result, mockImageData);
    });

    it("should not modify alpha channel", function () {
      const originalAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );

      GrayScale(mockImageData);

      const newAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );
      assert.deepStrictEqual(newAlpha, originalAlpha);
    });
  });

  describe("Luminance formula accuracy", function () {
    it("should use correct luminance weights (0.3, 0.59, 0.11)", function () {
      // Pure red pixel
      const redImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      GrayScale(redImageData);

      const expectedRedGrayscale = clampedRound(255 * 0.3); // 76.5 -> 76
      assert.strictEqual(redImageData.data[0], expectedRedGrayscale);
      assert.strictEqual(redImageData.data[1], expectedRedGrayscale);
      assert.strictEqual(redImageData.data[2], expectedRedGrayscale);
    });

    it("should handle pure green correctly", function () {
      const greenImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 255, 0, 255]),
      };

      GrayScale(greenImageData);

      const expectedGreenGrayscale = clampedRound(255 * 0.59); // 150.45 -> 150
      assert.strictEqual(greenImageData.data[0], expectedGreenGrayscale);
      assert.strictEqual(greenImageData.data[1], expectedGreenGrayscale);
      assert.strictEqual(greenImageData.data[2], expectedGreenGrayscale);
    });

    it("should handle pure blue correctly", function () {
      const blueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255]),
      };

      GrayScale(blueImageData);

      const expectedBlueGrayscale = clampedRound(255 * 0.11); // 28.05 -> 28
      assert.strictEqual(blueImageData.data[0], expectedBlueGrayscale);
      assert.strictEqual(blueImageData.data[1], expectedBlueGrayscale);
      assert.strictEqual(blueImageData.data[2], expectedBlueGrayscale);
    });

    it("should handle white correctly", function () {
      const whiteImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 255, 255, 255]),
      };

      GrayScale(whiteImageData);

      const expectedWhiteGrayscale = clampedRound(255 * (0.3 + 0.59 + 0.11)); // 255
      assert.strictEqual(whiteImageData.data[0], expectedWhiteGrayscale);
      assert.strictEqual(whiteImageData.data[1], expectedWhiteGrayscale);
      assert.strictEqual(whiteImageData.data[2], expectedWhiteGrayscale);
    });

    it("should handle black correctly", function () {
      const blackImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 0, 255]),
      };

      GrayScale(blackImageData);

      const expectedBlackGrayscale = 0; // 0 * any weight = 0
      assert.strictEqual(blackImageData.data[0], expectedBlackGrayscale);
      assert.strictEqual(blackImageData.data[1], expectedBlackGrayscale);
      assert.strictEqual(blackImageData.data[2], expectedBlackGrayscale);
    });
  });

  describe("Grayscale calculation properties", function () {
    it("should make all RGB channels equal for each pixel", function () {
      GrayScale(mockImageData);

      for (let i = 0; i < mockImageData.data.length; i += 4) {
        const red = mockImageData.data[i];
        const green = mockImageData.data[i + 1];
        const blue = mockImageData.data[i + 2];

        assert.strictEqual(red, green);
        assert.strictEqual(green, blue);
        assert.strictEqual(red, blue);
      }
    });

    it("should preserve the luminance perception of the original image", function () {
      // Test with a known color combination
      const colorImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 150, 50, 255]), // Mixed color
      };

      GrayScale(colorImageData);

      const expectedGrayscale = 100 * 0.3 + 150 * 0.59 + 50 * 0.11; // 124
      assert.strictEqual(colorImageData.data[0], expectedGrayscale);
      assert.strictEqual(colorImageData.data[1], expectedGrayscale);
      assert.strictEqual(colorImageData.data[2], expectedGrayscale);
    });

    it("should handle mid-range values correctly", function () {
      const midRangeImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 128, 128, 255]),
      };

      GrayScale(midRangeImageData);

      const expectedGrayscale = clampedRound(128 * (0.3 + 0.59 + 0.11)); // 128
      assert.strictEqual(midRangeImageData.data[0], expectedGrayscale);
      assert.strictEqual(midRangeImageData.data[1], expectedGrayscale);
      assert.strictEqual(midRangeImageData.data[2], expectedGrayscale);
    });
  });

  describe("Edge cases", function () {
    it("should handle empty imageData", function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      const result = GrayScale(emptyImageData);

      assert.strictEqual(result, emptyImageData);
      assert.strictEqual(result.data.length, 0);
    });

    it("should handle single pixel image", function () {
      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([200, 100, 50, 255]),
      };

      GrayScale(singlePixelImageData);

      const expectedGrayscale = clampedRound(
        200 * 0.3 + 100 * 0.59 + 50 * 0.11,
      ); // 124.5 -> 124
      assert.strictEqual(singlePixelImageData.data[0], expectedGrayscale);
      assert.strictEqual(singlePixelImageData.data[1], expectedGrayscale);
      assert.strictEqual(singlePixelImageData.data[2], expectedGrayscale);
      assert.strictEqual(singlePixelImageData.data[3], 255);
    });

    it("should handle large image data", function () {
      const largeImageData = {
        width: 100,
        height: 100,
        data: new Uint8ClampedArray(100 * 100 * 4),
      };

      // Fill with a pattern
      for (let i = 0; i < largeImageData.data.length; i += 4) {
        largeImageData.data[i] = 200; // Red
        largeImageData.data[i + 1] = 150; // Green
        largeImageData.data[i + 2] = 100; // Blue
        largeImageData.data[i + 3] = 255; // Alpha
      }

      const result = GrayScale(largeImageData);
      const expectedGrayscale = clampedRound(
        200 * 0.3 + 150 * 0.59 + 100 * 0.11,
      ); // 159.5 -> 160

      // Check a few random pixels
      assert.strictEqual(result.data[0], expectedGrayscale);
      assert.strictEqual(result.data[1], expectedGrayscale);
      assert.strictEqual(result.data[2], expectedGrayscale);
      assert.strictEqual(result.data[400], expectedGrayscale); // Another pixel
    });
  });

  describe("Floating point precision", function () {
    it("should handle fractional grayscale values", function () {
      const imageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([123, 67, 89, 255]),
      };

      GrayScale(imageData);

      const expectedGrayscale = clampedRound(123 * 0.3 + 67 * 0.59 + 89 * 0.11); // 86.22 -> 86
      assert.strictEqual(imageData.data[0], expectedGrayscale);
      assert.strictEqual(imageData.data[1], expectedGrayscale);
      assert.strictEqual(imageData.data[2], expectedGrayscale);
    });

    it("should maintain precision for complex calculations", function () {
      const imageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([33, 177, 211, 255]),
      };

      GrayScale(imageData);

      const expectedGrayscale = clampedRound(
        33 * 0.3 + 177 * 0.59 + 211 * 0.11,
      ); // 137.54 -> 138
      assert.strictEqual(imageData.data[0], expectedGrayscale);
      assert.strictEqual(imageData.data[1], expectedGrayscale);
      assert.strictEqual(imageData.data[2], expectedGrayscale);
    });
  });

  describe("Data integrity", function () {
    it("should maintain imageData structure", function () {
      const result = GrayScale(mockImageData);

      assert(result.hasOwnProperty("width"));
      assert(result.hasOwnProperty("height"));
      assert(result.hasOwnProperty("data"));
      assert(result.data instanceof Uint8ClampedArray);
    });

    it("should not change imageData dimensions", function () {
      const originalWidth = mockImageData.width;
      const originalHeight = mockImageData.height;
      const originalLength = mockImageData.data.length;

      GrayScale(mockImageData);

      assert.strictEqual(mockImageData.width, originalWidth);
      assert.strictEqual(mockImageData.height, originalHeight);
      assert.strictEqual(mockImageData.data.length, originalLength);
    });

    it("should process all pixels", function () {
      const pixelCount = mockImageData.width * mockImageData.height;

      GrayScale(mockImageData);

      // Verify all pixels were processed and are now grayscale
      for (let i = 0; i < pixelCount * 4; i += 4) {
        assert(typeof mockImageData.data[i] === "number"); // Red
        assert(typeof mockImageData.data[i + 1] === "number"); // Green
        assert(typeof mockImageData.data[i + 2] === "number"); // Blue
        assert(typeof mockImageData.data[i + 3] === "number"); // Alpha

        // All RGB values should be equal (grayscale)
        assert.strictEqual(mockImageData.data[i], mockImageData.data[i + 1]);
        assert.strictEqual(
          mockImageData.data[i + 1],
          mockImageData.data[i + 2],
        );
      }
    });
  });
});
