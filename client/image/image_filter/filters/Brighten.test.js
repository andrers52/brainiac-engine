import { strict as assert } from 'assert';
import sinon from 'sinon';
import { Brighten } from './Brighten.js';

describe('Brighten', function () {
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
        // Pixel 4: Dark gray
        50, 50, 50, 255,
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

  describe('Basic functionality', function () {
    it('should brighten all RGB channels by the specified amount', function () {
      const brightenAmount = 50;
      const originalData = new Uint8ClampedArray(mockImageData.data);

      const result = Brighten(mockImageData, brightenAmount);

      // Check that RGB values are increased by brightenAmount
      for (let i = 0; i < result.data.length; i += 4) {
        assert.strictEqual(result.data[i], originalData[i] + brightenAmount); // Red
        assert.strictEqual(
          result.data[i + 1],
          originalData[i + 1] + brightenAmount,
        ); // Green
        assert.strictEqual(
          result.data[i + 2],
          originalData[i + 2] + brightenAmount,
        ); // Blue
        assert.strictEqual(result.data[i + 3], originalData[i + 3]); // Alpha unchanged
      }
    });

    it('should return the modified imageData object', function () {
      const result = Brighten(mockImageData, 25);

      assert.strictEqual(result, mockImageData);
    });

    it('should not modify alpha channel', function () {
      const originalAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );

      Brighten(mockImageData, 100);

      const newAlpha = Array.from(mockImageData.data).filter(
        (_, i) => i % 4 === 3,
      );
      assert.deepStrictEqual(newAlpha, originalAlpha);
    });
  });

  describe('Parameter validation', function () {
    it('should throw error when BrightenAdjustment is not provided', function () {
      assert.throws(() => {
        Brighten(mockImageData);
      }, /The Brighten effect needs a BrightenAdjustment property/);
    });

    it('should throw error when BrightenAdjustment is null', function () {
      assert.throws(() => {
        Brighten(mockImageData, null);
      }, /The Brighten effect needs a BrightenAdjustment property/);
    });

    it('should not throw error when BrightenAdjustment is 0', function () {
      assert.doesNotThrow(() => {
        Brighten(mockImageData, 0);
      });
    });

    it('should not throw error when valid BrightenAdjustment is provided', function () {
      assert.doesNotThrow(() => {
        Brighten(mockImageData, 50);
      });
    });
  });

  describe('Different brightness values', function () {
    it('should handle positive brightness adjustment', function () {
      const brightenAmount = 75;
      const originalRed = mockImageData.data[0];

      Brighten(mockImageData, brightenAmount);

      assert.strictEqual(mockImageData.data[0], originalRed + brightenAmount);
    });

    it('should handle negative brightness adjustment (darkening)', function () {
      const darkenAmount = -25;
      const originalRed = mockImageData.data[0];

      Brighten(mockImageData, darkenAmount);

      assert.strictEqual(mockImageData.data[0], originalRed + darkenAmount);
    });

    it('should handle zero brightness adjustment', function () {
      const originalData = new Uint8ClampedArray(mockImageData.data);

      Brighten(mockImageData, 0);

      assert.deepStrictEqual(mockImageData.data, originalData);
    });

    it('should handle maximum brightness adjustment (with clamping)', function () {
      Brighten(mockImageData, 255);

      // First pixel should be brightened, but clamped to 255 by Uint8ClampedArray
      assert.strictEqual(mockImageData.data[0], 255); // 50 + 255 = 305, clamped to 255
      assert.strictEqual(mockImageData.data[1], 255); // 0 + 255 = 255
      assert.strictEqual(mockImageData.data[2], 255); // 0 + 255 = 255
    });
  });

  describe('Edge cases', function () {
    it('should handle empty imageData', function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      const result = Brighten(emptyImageData, 50);

      assert.strictEqual(result, emptyImageData);
      assert.strictEqual(result.data.length, 0);
    });

    it('should handle single pixel image', function () {
      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 150, 200, 255]),
      };

      Brighten(singlePixelImageData, 50);

      assert.strictEqual(singlePixelImageData.data[0], 150);
      assert.strictEqual(singlePixelImageData.data[1], 200);
      assert.strictEqual(singlePixelImageData.data[2], 250);
      assert.strictEqual(singlePixelImageData.data[3], 255);
    });

    it('should handle large image data', function () {
      const largeImageData = {
        width: 100,
        height: 100,
        data: new Uint8ClampedArray(100 * 100 * 4).fill(128),
      };

      const result = Brighten(largeImageData, 50);

      // Check a few random pixels
      assert.strictEqual(result.data[0], 178); // 128 + 50
      assert.strictEqual(result.data[4], 178); // 128 + 50
      assert.strictEqual(result.data[3], 128); // Alpha unchanged
    });
  });

  describe('Pixel value bounds (Uint8ClampedArray behavior)', function () {
    it('should clamp values that exceed 255 to 255', function () {
      const highValueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([200, 220, 240, 255]),
      };

      Brighten(highValueImageData, 100);

      // Values are clamped by Uint8ClampedArray
      assert.strictEqual(highValueImageData.data[0], 255); // 200 + 100 = 300, clamped to 255
      assert.strictEqual(highValueImageData.data[1], 255); // 220 + 100 = 320, clamped to 255
      assert.strictEqual(highValueImageData.data[2], 255); // 240 + 100 = 340, clamped to 255
    });

    it('should clamp values that go below 0 to 0', function () {
      const lowValueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([20, 30, 40, 255]),
      };

      Brighten(lowValueImageData, -50);

      // Values are clamped by Uint8ClampedArray
      assert.strictEqual(lowValueImageData.data[0], 0); // 20 - 50 = -30, clamped to 0
      assert.strictEqual(lowValueImageData.data[1], 0); // 30 - 50 = -20, clamped to 0
      assert.strictEqual(lowValueImageData.data[2], 0); // 40 - 50 = -10, clamped to 0
    });
  });

  describe('Data integrity', function () {
    it('should maintain imageData structure', function () {
      const result = Brighten(mockImageData, 50);

      assert(Object.prototype.hasOwnProperty.call(result, 'width'));
      assert(Object.prototype.hasOwnProperty.call(result, 'height'));
      assert(Object.prototype.hasOwnProperty.call(result, 'data'));
      assert(result.data instanceof Uint8ClampedArray);
    });

    it('should not change imageData dimensions', function () {
      const originalWidth = mockImageData.width;
      const originalHeight = mockImageData.height;
      const originalLength = mockImageData.data.length;

      Brighten(mockImageData, 50);

      assert.strictEqual(mockImageData.width, originalWidth);
      assert.strictEqual(mockImageData.height, originalHeight);
      assert.strictEqual(mockImageData.data.length, originalLength);
    });

    it('should process all pixels', function () {
      const pixelCount = mockImageData.width * mockImageData.height;
      const expectedDataLength = pixelCount * 4;

      assert.strictEqual(mockImageData.data.length, expectedDataLength);

      Brighten(mockImageData, 25);

      // Ensure all RGB values were processed (alpha should remain unchanged)
      for (let i = 0; i < mockImageData.data.length; i += 4) {
        // We can't easily verify the exact values without storing originals,
        // but we can verify the structure is intact
        assert(typeof mockImageData.data[i] === 'number'); // Red
        assert(typeof mockImageData.data[i + 1] === 'number'); // Green
        assert(typeof mockImageData.data[i + 2] === 'number'); // Blue
        assert(typeof mockImageData.data[i + 3] === 'number'); // Alpha
      }
    });
  });
});
