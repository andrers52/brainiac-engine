import { strict as assert } from 'assert';
import sinon from 'sinon';
import { Invert } from './Invert.js';

describe('Invert', function () {
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
        // Pixel 4: Gray
        128, 128, 128, 255,
      ]),
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Basic functionality', function () {
    it('should invert RGB values by subtracting from 255', function () {
      const originalData = new Uint8ClampedArray(mockImageData.data);

      const result = Invert(mockImageData);

      // Check each pixel inversion
      for (let i = 0; i < result.data.length; i += 4) {
        assert.strictEqual(result.data[i], 255 - originalData[i]); // Red inverted
        assert.strictEqual(result.data[i + 1], 255 - originalData[i + 1]); // Green inverted
        assert.strictEqual(result.data[i + 2], 255 - originalData[i + 2]); // Blue inverted
        assert.strictEqual(result.data[i + 3], originalData[i + 3]); // Alpha unchanged
      }
    });

    it('should return the modified imageData object', function () {
      const result = Invert(mockImageData);

      assert.strictEqual(result, mockImageData);
    });

    it('should not modify alpha channel', function () {
      const originalAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );

      Invert(mockImageData);

      const newAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );
      assert.deepStrictEqual(newAlpha, originalAlpha);
    });
  });

  describe('Color inversion accuracy', function () {
    it('should invert pure red to cyan', function () {
      const redImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      Invert(redImageData);

      assert.strictEqual(redImageData.data[0], 0); // 255 - 255 = 0
      assert.strictEqual(redImageData.data[1], 255); // 255 - 0 = 255
      assert.strictEqual(redImageData.data[2], 255); // 255 - 0 = 255
      // Result: cyan (0, 255, 255)
    });

    it('should invert pure green to magenta', function () {
      const greenImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 255, 0, 255]),
      };

      Invert(greenImageData);

      assert.strictEqual(greenImageData.data[0], 255); // 255 - 0 = 255
      assert.strictEqual(greenImageData.data[1], 0); // 255 - 255 = 0
      assert.strictEqual(greenImageData.data[2], 255); // 255 - 0 = 255
      // Result: magenta (255, 0, 255)
    });

    it('should invert pure blue to yellow', function () {
      const blueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255]),
      };

      Invert(blueImageData);

      assert.strictEqual(blueImageData.data[0], 255); // 255 - 0 = 255
      assert.strictEqual(blueImageData.data[1], 255); // 255 - 0 = 255
      assert.strictEqual(blueImageData.data[2], 0); // 255 - 255 = 0
      // Result: yellow (255, 255, 0)
    });

    it('should invert white to black', function () {
      const whiteImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 255, 255, 255]),
      };

      Invert(whiteImageData);

      assert.strictEqual(whiteImageData.data[0], 0); // 255 - 255 = 0
      assert.strictEqual(whiteImageData.data[1], 0); // 255 - 255 = 0
      assert.strictEqual(whiteImageData.data[2], 0); // 255 - 255 = 0
      // Result: black (0, 0, 0)
    });

    it('should invert black to white', function () {
      const blackImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 0, 255]),
      };

      Invert(blackImageData);

      assert.strictEqual(blackImageData.data[0], 255); // 255 - 0 = 255
      assert.strictEqual(blackImageData.data[1], 255); // 255 - 0 = 255
      assert.strictEqual(blackImageData.data[2], 255); // 255 - 0 = 255
      // Result: white (255, 255, 255)
    });

    it('should invert gray correctly', function () {
      const grayImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 128, 128, 255]),
      };

      Invert(grayImageData);

      assert.strictEqual(grayImageData.data[0], 127); // 255 - 128 = 127
      assert.strictEqual(grayImageData.data[1], 127); // 255 - 128 = 127
      assert.strictEqual(grayImageData.data[2], 127); // 255 - 128 = 127
      // Result: slightly darker gray (127, 127, 127)
    });
  });

  describe('Inversion properties', function () {
    it('should be symmetric (double inversion returns to original)', function () {
      const originalImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 150, 200, 255]),
      };
      const originalData = new Uint8ClampedArray(originalImageData.data);

      // Invert once
      Invert(originalImageData);

      // Invert again
      Invert(originalImageData);

      // Should be back to original (except for rounding errors)
      assert.strictEqual(originalImageData.data[0], originalData[0]);
      assert.strictEqual(originalImageData.data[1], originalData[1]);
      assert.strictEqual(originalImageData.data[2], originalData[2]);
      assert.strictEqual(originalImageData.data[3], originalData[3]);
    });

    it('should handle mid-point value correctly', function () {
      const midPointImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([127, 127, 127, 255]),
      };

      Invert(midPointImageData);

      assert.strictEqual(midPointImageData.data[0], 128); // 255 - 127 = 128
      assert.strictEqual(midPointImageData.data[1], 128); // 255 - 127 = 128
      assert.strictEqual(midPointImageData.data[2], 128); // 255 - 127 = 128
    });

    it('should handle the complement value correctly', function () {
      const imageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 200, 50, 255]),
      };

      Invert(imageData);

      assert.strictEqual(imageData.data[0], 155); // 255 - 100 = 155
      assert.strictEqual(imageData.data[1], 55); // 255 - 200 = 55
      assert.strictEqual(imageData.data[2], 205); // 255 - 50 = 205
    });
  });

  describe('Edge cases', function () {
    it('should handle empty imageData', function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      const result = Invert(emptyImageData);

      assert.strictEqual(result, emptyImageData);
      assert.strictEqual(result.data.length, 0);
    });

    it('should handle single pixel image', function () {
      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([75, 150, 225, 255]),
      };

      Invert(singlePixelImageData);

      assert.strictEqual(singlePixelImageData.data[0], 180); // 255 - 75 = 180
      assert.strictEqual(singlePixelImageData.data[1], 105); // 255 - 150 = 105
      assert.strictEqual(singlePixelImageData.data[2], 30); // 255 - 225 = 30
      assert.strictEqual(singlePixelImageData.data[3], 255); // Alpha unchanged
    });

    it('should handle large image data', function () {
      const largeImageData = {
        width: 100,
        height: 100,
        data: new Uint8ClampedArray(100 * 100 * 4),
      };

      // Fill with a pattern
      for (let i = 0; i < largeImageData.data.length; i += 4) {
        largeImageData.data[i] = 100; // Red
        largeImageData.data[i + 1] = 150; // Green
        largeImageData.data[i + 2] = 200; // Blue
        largeImageData.data[i + 3] = 255; // Alpha
      }

      const result = Invert(largeImageData);

      // Check a few random pixels
      assert.strictEqual(result.data[0], 155); // 255 - 100 = 155
      assert.strictEqual(result.data[1], 105); // 255 - 150 = 105
      assert.strictEqual(result.data[2], 55); // 255 - 200 = 55
      assert.strictEqual(result.data[3], 255); // Alpha unchanged

      assert.strictEqual(result.data[400], 155); // Another pixel
      assert.strictEqual(result.data[401], 105);
      assert.strictEqual(result.data[402], 55);
    });
  });

  describe('Boundary values', function () {
    it('should handle minimum RGB values (0)', function () {
      const minImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 0, 255]),
      };

      Invert(minImageData);

      assert.strictEqual(minImageData.data[0], 255); // 255 - 0 = 255
      assert.strictEqual(minImageData.data[1], 255); // 255 - 0 = 255
      assert.strictEqual(minImageData.data[2], 255); // 255 - 0 = 255
    });

    it('should handle maximum RGB values (255)', function () {
      const maxImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 255, 255, 255]),
      };

      Invert(maxImageData);

      assert.strictEqual(maxImageData.data[0], 0); // 255 - 255 = 0
      assert.strictEqual(maxImageData.data[1], 0); // 255 - 255 = 0
      assert.strictEqual(maxImageData.data[2], 0); // 255 - 255 = 0
    });

    it('should handle all possible RGB values correctly', function () {
      for (let value = 0; value <= 255; value += 51) {
        // Test 0, 51, 102, 153, 204, 255
        const imageData = {
          width: 1,
          height: 1,
          data: new Uint8ClampedArray([value, value, value, 255]),
        };

        Invert(imageData);

        const expectedInverted = 255 - value;
        assert.strictEqual(imageData.data[0], expectedInverted);
        assert.strictEqual(imageData.data[1], expectedInverted);
        assert.strictEqual(imageData.data[2], expectedInverted);
      }
    });
  });

  describe('Alpha channel preservation', function () {
    it('should preserve various alpha values', function () {
      const alphaValues = [0, 64, 128, 192, 255];

      alphaValues.forEach((alphaValue) => {
        const imageData = {
          width: 1,
          height: 1,
          data: new Uint8ClampedArray([100, 150, 200, alphaValue]),
        };

        Invert(imageData);

        assert.strictEqual(
          imageData.data[3],
          alphaValue,
          `Alpha value ${alphaValue} should be preserved`,
        );
      });
    });
  });

  describe('Data integrity', function () {
    it('should maintain imageData structure', function () {
      const result = Invert(mockImageData);

      assert(result.hasOwnProperty('width'));
      assert(result.hasOwnProperty('height'));
      assert(result.hasOwnProperty('data'));
      assert(result.data instanceof Uint8ClampedArray);
    });

    it('should not change imageData dimensions', function () {
      const originalWidth = mockImageData.width;
      const originalHeight = mockImageData.height;
      const originalLength = mockImageData.data.length;

      Invert(mockImageData);

      assert.strictEqual(mockImageData.width, originalWidth);
      assert.strictEqual(mockImageData.height, originalHeight);
      assert.strictEqual(mockImageData.data.length, originalLength);
    });

    it('should process all pixels', function () {
      const pixelCount = mockImageData.width * mockImageData.height;

      Invert(mockImageData);

      // Verify all pixels were processed
      for (let i = 0; i < pixelCount * 4; i += 4) {
        assert(typeof mockImageData.data[i] === 'number'); // Red
        assert(typeof mockImageData.data[i + 1] === 'number'); // Green
        assert(typeof mockImageData.data[i + 2] === 'number'); // Blue
        assert(typeof mockImageData.data[i + 3] === 'number'); // Alpha

        // RGB values should be within valid range
        assert(mockImageData.data[i] >= 0 && mockImageData.data[i] <= 255);
        assert(
          mockImageData.data[i + 1] >= 0 && mockImageData.data[i + 1] <= 255,
        );
        assert(
          mockImageData.data[i + 2] >= 0 && mockImageData.data[i + 2] <= 255,
        );
      }
    });
  });
});
