import { strict as assert } from 'assert';
import sinon from 'sinon';
import { IncreaseTransparency } from './IncreaseTransparency.js';

describe('IncreaseTransparency', function () {
  let sandbox;
  let mockImageData;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Create mock ImageData with varying alpha values
    mockImageData = {
      width: 2,
      height: 2,
      data: new Uint8ClampedArray([
        // Pixel 1: Fully opaque red
        255, 0, 0, 255,
        // Pixel 2: Semi-transparent green
        0, 255, 0, 128,
        // Pixel 3: Nearly transparent blue
        0, 0, 255, 5,
        // Pixel 4: Fully transparent white
        255, 255, 255, 0,
      ]),
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Basic functionality', function () {
    it('should decrease alpha by 1 for non-transparent pixels', function () {
      const originalData = new Uint8ClampedArray(mockImageData.data);

      const result = IncreaseTransparency(mockImageData);

      // Check each pixel
      for (let i = 0; i < result.data.length; i += 4) {
        const originalAlpha = originalData[i + 3];
        const newAlpha = result.data[i + 3];

        if (originalAlpha > 0) {
          assert.strictEqual(newAlpha, originalAlpha - 1);
        } else {
          assert.strictEqual(newAlpha, 0); // Already transparent pixels stay at 0
        }

        // RGB channels should remain unchanged
        assert.strictEqual(result.data[i], originalData[i]);
        assert.strictEqual(result.data[i + 1], originalData[i + 1]);
        assert.strictEqual(result.data[i + 2], originalData[i + 2]);
      }
    });

    it('should return the modified imageData object', function () {
      const result = IncreaseTransparency(mockImageData);

      assert.strictEqual(result, mockImageData);
    });

    it('should not modify RGB channels', function () {
      const originalRGB = [];
      for (let i = 0; i < mockImageData.data.length; i += 4) {
        originalRGB.push([
          mockImageData.data[i],
          mockImageData.data[i + 1],
          mockImageData.data[i + 2],
        ]);
      }

      IncreaseTransparency(mockImageData);

      for (
        let i = 0, pixelIndex = 0;
        i < mockImageData.data.length;
        i += 4, pixelIndex++
      ) {
        assert.strictEqual(mockImageData.data[i], originalRGB[pixelIndex][0]); // Red
        assert.strictEqual(
          mockImageData.data[i + 1],
          originalRGB[pixelIndex][1],
        ); // Green
        assert.strictEqual(
          mockImageData.data[i + 2],
          originalRGB[pixelIndex][2],
        ); // Blue
      }
    });
  });

  describe('Alpha value handling', function () {
    it('should not decrease alpha below 0', function () {
      const zeroAlphaImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 0]), // Alpha already 0
      };

      IncreaseTransparency(zeroAlphaImageData);

      assert.strictEqual(zeroAlphaImageData.data[3], 0); // Should remain 0
    });

    it('should handle alpha value of 1 correctly', function () {
      const oneAlphaImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 1]), // Alpha = 1
      };

      IncreaseTransparency(oneAlphaImageData);

      assert.strictEqual(oneAlphaImageData.data[3], 0); // Should become 0
    });

    it('should handle maximum alpha value correctly', function () {
      const maxAlphaImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255]), // Alpha = 255
      };

      IncreaseTransparency(maxAlphaImageData);

      assert.strictEqual(maxAlphaImageData.data[3], 254); // Should become 254
    });

    it('should handle mid-range alpha values', function () {
      const midAlphaImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 128]), // Alpha = 128
      };

      IncreaseTransparency(midAlphaImageData);

      assert.strictEqual(midAlphaImageData.data[3], 127); // Should become 127
    });
  });

  describe('Multiple applications', function () {
    it('should gradually increase transparency with multiple calls', function () {
      const imageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 10]), // Alpha = 10
      };

      // Apply the effect multiple times
      IncreaseTransparency(imageData);
      assert.strictEqual(imageData.data[3], 9);

      IncreaseTransparency(imageData);
      assert.strictEqual(imageData.data[3], 8);

      IncreaseTransparency(imageData);
      assert.strictEqual(imageData.data[3], 7);
    });

    it('should stop decreasing at 0 even with multiple calls', function () {
      const imageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 2]), // Alpha = 2
      };

      // Apply the effect multiple times
      IncreaseTransparency(imageData);
      assert.strictEqual(imageData.data[3], 1);

      IncreaseTransparency(imageData);
      assert.strictEqual(imageData.data[3], 0);

      IncreaseTransparency(imageData);
      assert.strictEqual(imageData.data[3], 0); // Should stay at 0

      IncreaseTransparency(imageData);
      assert.strictEqual(imageData.data[3], 0); // Should stay at 0
    });
  });

  describe('Mixed transparency scenarios', function () {
    it('should handle image with mixed alpha values correctly', function () {
      const mixedImageData = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255,
          0,
          0,
          255, // Fully opaque
          0,
          255,
          0,
          100, // Semi-transparent
          0,
          0,
          255,
          1, // Nearly transparent
          128,
          128,
          128,
          0, // Fully transparent
        ]),
      };

      IncreaseTransparency(mixedImageData);

      assert.strictEqual(mixedImageData.data[3], 254); // 255 -> 254
      assert.strictEqual(mixedImageData.data[7], 99); // 100 -> 99
      assert.strictEqual(mixedImageData.data[11], 0); // 1 -> 0
      assert.strictEqual(mixedImageData.data[15], 0); // 0 -> 0 (unchanged)
    });

    it('should preserve the relative transparency order', function () {
      const imageData = {
        width: 3,
        height: 1,
        data: new Uint8ClampedArray([
          255,
          0,
          0,
          200, // Most opaque
          0,
          255,
          0,
          100, // Medium opacity
          0,
          0,
          255,
          50, // Least opaque
        ]),
      };

      IncreaseTransparency(imageData);

      // Order should be preserved: 199 > 99 > 49
      assert(imageData.data[3] > imageData.data[7]); // 199 > 99
      assert(imageData.data[7] > imageData.data[11]); // 99 > 49
    });
  });

  describe('Edge cases', function () {
    it('should handle empty imageData', function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      const result = IncreaseTransparency(emptyImageData);

      assert.strictEqual(result, emptyImageData);
      assert.strictEqual(result.data.length, 0);
    });

    it('should handle single pixel image', function () {
      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 150, 200, 64]),
      };

      IncreaseTransparency(singlePixelImageData);

      assert.strictEqual(singlePixelImageData.data[0], 100); // Red unchanged
      assert.strictEqual(singlePixelImageData.data[1], 150); // Green unchanged
      assert.strictEqual(singlePixelImageData.data[2], 200); // Blue unchanged
      assert.strictEqual(singlePixelImageData.data[3], 63); // Alpha decreased
    });

    it('should handle large image data', function () {
      const largeImageData = {
        width: 100,
        height: 100,
        data: new Uint8ClampedArray(100 * 100 * 4),
      };

      // Fill with pattern
      for (let i = 0; i < largeImageData.data.length; i += 4) {
        largeImageData.data[i] = 128; // Red
        largeImageData.data[i + 1] = 64; // Green
        largeImageData.data[i + 2] = 192; // Blue
        largeImageData.data[i + 3] = 200; // Alpha
      }

      const result = IncreaseTransparency(largeImageData);

      // Check a few random pixels
      assert.strictEqual(result.data[3], 199); // First pixel alpha
      assert.strictEqual(result.data[403], 199); // Another pixel alpha
      assert.strictEqual(result.data[0], 128); // RGB should be unchanged
      assert.strictEqual(result.data[1], 64);
      assert.strictEqual(result.data[2], 192);
    });
  });

  describe('Boundary values', function () {
    it('should handle all possible alpha values correctly', function () {
      const testValues = [0, 1, 2, 127, 128, 254, 255];

      testValues.forEach((alphaValue) => {
        const imageData = {
          width: 1,
          height: 1,
          data: new Uint8ClampedArray([100, 100, 100, alphaValue]),
        };

        IncreaseTransparency(imageData);

        const expectedAlpha = alphaValue > 0 ? alphaValue - 1 : 0;
        assert.strictEqual(
          imageData.data[3],
          expectedAlpha,
          `Alpha ${alphaValue} should become ${expectedAlpha}`,
        );
      });
    });
  });

  describe('Data integrity', function () {
    it('should maintain imageData structure', function () {
      const result = IncreaseTransparency(mockImageData);

      assert(Object.prototype.hasOwnProperty.call(result, 'width'));
      assert(Object.prototype.hasOwnProperty.call(result, 'height'));
      assert(Object.prototype.hasOwnProperty.call(result, 'data'));
      assert(result.data instanceof Uint8ClampedArray);
    });

    it('should not change imageData dimensions', function () {
      const originalWidth = mockImageData.width;
      const originalHeight = mockImageData.height;
      const originalLength = mockImageData.data.length;

      IncreaseTransparency(mockImageData);

      assert.strictEqual(mockImageData.width, originalWidth);
      assert.strictEqual(mockImageData.height, originalHeight);
      assert.strictEqual(mockImageData.data.length, originalLength);
    });

    it('should process all pixels', function () {
      const pixelCount = mockImageData.width * mockImageData.height;

      IncreaseTransparency(mockImageData);

      // Verify all pixels were processed
      for (let i = 0; i < pixelCount * 4; i += 4) {
        assert(typeof mockImageData.data[i] === 'number'); // Red
        assert(typeof mockImageData.data[i + 1] === 'number'); // Green
        assert(typeof mockImageData.data[i + 2] === 'number'); // Blue
        assert(typeof mockImageData.data[i + 3] === 'number'); // Alpha

        // Alpha should be within valid range
        assert(mockImageData.data[i + 3] >= 0);
        assert(mockImageData.data[i + 3] <= 255);
      }
    });
  });
});
