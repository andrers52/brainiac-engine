import { strict as assert } from 'assert';
import sinon from 'sinon';
import { Sobel } from './Sobel.js';

describe('Sobel', function () {
  let sandbox;
  let mockImageData;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Create simple test ImageData
    mockImageData = {
      width: 3,
      height: 3,
      data: new Uint8ClampedArray(3 * 3 * 4),
    };

    // Fill with a simple gradient pattern for edge detection
    for (let i = 0; i < mockImageData.data.length; i += 4) {
      const pixelIndex = i / 4;
      const row = Math.floor(pixelIndex / 3);
      const col = pixelIndex % 3;
      const value = row * 50 + col * 30; // Create gradient
      mockImageData.data[i] = value; // Red
      mockImageData.data[i + 1] = value; // Green
      mockImageData.data[i + 2] = value; // Blue
      mockImageData.data[i + 3] = 255; // Alpha
    }
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Integration tests', function () {
    it('should apply Sobel edge detection and return imageData', function () {
      const result = Sobel(mockImageData);

      // Basic structure tests
      assert(result);
      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
      assert(result.data instanceof Uint8ClampedArray);
      assert.strictEqual(result.data.length, mockImageData.data.length);
    });

    it('should process all pixels', function () {
      const result = Sobel(mockImageData);

      // Check that alpha channels are preserved
      for (let i = 3; i < result.data.length; i += 4) {
        assert.strictEqual(result.data[i], 255);
      }
    });

    it('should handle empty imageData', function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      const result = Sobel(emptyImageData);

      assert.strictEqual(result.width, 0);
      assert.strictEqual(result.height, 0);
      assert.strictEqual(result.data.length, 0);
    });

    it('should handle single pixel image', function () {
      const singlePixelData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 100, 100, 255]),
      };

      const result = Sobel(singlePixelData);

      assert.strictEqual(result.width, 1);
      assert.strictEqual(result.height, 1);
      assert.strictEqual(result.data.length, 4);
      assert.strictEqual(result.data[3], 255); // Alpha preserved
    });

    it('should detect edges in gradient patterns', function () {
      const result = Sobel(mockImageData);

      // Check that the filter produces non-zero values for gradient input
      let hasNonZeroValues = false;
      for (let i = 0; i < result.data.length; i += 4) {
        if (
          result.data[i] > 0 ||
          result.data[i + 1] > 0 ||
          result.data[i + 2] > 0
        ) {
          hasNonZeroValues = true;
          break;
        }
      }
      assert(
        hasNonZeroValues,
        'Sobel filter should detect edges in gradient pattern',
      );
    });

    it('should maintain data structure integrity', function () {
      const result = Sobel(mockImageData);

      assert(Object.prototype.hasOwnProperty.call(result, 'width'));
      assert(Object.prototype.hasOwnProperty.call(result, 'height'));
      assert(Object.prototype.hasOwnProperty.call(result, 'data'));
      assert(result.data instanceof Uint8ClampedArray);
    });
  });
});
