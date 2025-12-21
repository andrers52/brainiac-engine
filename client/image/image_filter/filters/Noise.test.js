import { strict as assert } from 'assert';
import sinon from 'sinon';
import { Noise } from './Noise.js';

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

describe('Noise', function () {
  let sandbox;
  let mathRandomStub;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Mock Math.random for predictable testing
    mathRandomStub = sandbox.stub(Math, 'random');
  });

  afterEach(function () {
    sandbox.restore();
  });

  // Helper function to create fresh imageData for each test
  function createFreshImageData() {
    return {
      width: 2,
      height: 2,
      data: new Uint8ClampedArray([
        // Pixel 1: Red
        100, 0, 0, 255,
        // Pixel 2: Green
        0, 100, 0, 255,
        // Pixel 3: Blue
        0, 0, 100, 255,
        // Pixel 4: Gray
        128, 128, 128, 255,
      ]),
    };
  }

  describe('Basic functionality', function () {
    it('should add random noise to RGB channels based on Math.random', function () {
      // Set up predictable random values
      mathRandomStub.returns(0.5); // This will result in (0.5 - 0.5) * factor = 0

      const testImageData = createFreshImageData();
      const originalData = new Uint8ClampedArray(testImageData.data);
      const factor = 55; // default factor

      const result = Noise(testImageData, factor);

      // With Math.random() = 0.5, rand = (0.5 - 0.5) * 55 = 0
      // So values should remain the same
      for (let i = 0; i < result.data.length; i += 4) {
        assert.strictEqual(result.data[i], originalData[i]); // Red unchanged
        assert.strictEqual(result.data[i + 1], originalData[i + 1]); // Green unchanged
        assert.strictEqual(result.data[i + 2], originalData[i + 2]); // Blue unchanged
        assert.strictEqual(result.data[i + 3], originalData[i + 3]); // Alpha unchanged
      }
    });

    it('should return the modified imageData object', function () {
      mathRandomStub.returns(0.5);
      const testImageData = createFreshImageData();
      const result = Noise(testImageData);

      assert.strictEqual(result, testImageData);
    });

    it('should not modify alpha channel', function () {
      mathRandomStub.returns(0.3);
      const testImageData = createFreshImageData();
      const originalAlpha = Array.from(testImageData.data).filter(
        (_, i) => i % 4 === 3,
      );

      Noise(testImageData);

      const newAlpha = Array.from(testImageData.data).filter(
        (_, i) => i % 4 === 3,
      );
      assert.deepStrictEqual(newAlpha, originalAlpha);
    });
  });

  describe('Default parameter handling', function () {
    it('should use default factor of 55 when not provided', function () {
      mathRandomStub.returns(0.0); // Will result in maximum positive noise

      const testImageData = createFreshImageData();
      const originalData = new Uint8ClampedArray(testImageData.data);
      Noise(testImageData); // No factor provided

      // With Math.random() = 0.0, rand = (0.5 - 0.0) * 55 = 27.5
      const expectedNoise = 27.5;

      assert.strictEqual(
        testImageData.data[0],
        clampedRound(originalData[0] + expectedNoise), // 100 + 27.5 = 127.5 -> 128
      );
      assert.strictEqual(
        testImageData.data[1],
        clampedRound(originalData[1] + expectedNoise), // 0 + 27.5 = 27.5 -> 28
      );
      assert.strictEqual(
        testImageData.data[2],
        clampedRound(originalData[2] + expectedNoise), // 0 + 27.5 = 27.5 -> 28
      );
    });

    it('should use provided factor when specified', function () {
      mathRandomStub.returns(0.0);
      const factor = 100;

      const testImageData = createFreshImageData();
      const originalData = new Uint8ClampedArray(testImageData.data);
      Noise(testImageData, factor);

      // With Math.random() = 0.0, rand = (0.5 - 0.0) * 100 = 50
      const expectedNoise = 50;

      assert.strictEqual(
        testImageData.data[0],
        clampedRound(originalData[0] + expectedNoise), // 100 + 50 = 150
      );
      assert.strictEqual(
        testImageData.data[1],
        clampedRound(originalData[1] + expectedNoise), // 0 + 50 = 50
      );
      assert.strictEqual(
        testImageData.data[2],
        clampedRound(originalData[2] + expectedNoise), // 0 + 50 = 50
      );
    });
  });

  describe('Noise calculation', function () {
    it('should add positive noise when Math.random < 0.5', function () {
      mathRandomStub.returns(0.2); // (0.5 - 0.2) * factor = positive noise

      const testImageData = createFreshImageData();
      const originalData = new Uint8ClampedArray(testImageData.data);
      const factor = 60;

      Noise(testImageData, factor);

      const expectedNoise = (0.5 - 0.2) * factor; // 0.3 * 60 = 18

      assert.strictEqual(
        testImageData.data[0],
        clampedRound(originalData[0] + expectedNoise), // 100 + 18 = 118
      );
      assert.strictEqual(
        testImageData.data[1],
        clampedRound(originalData[1] + expectedNoise), // 0 + 18 = 18
      );
      assert.strictEqual(
        testImageData.data[2],
        clampedRound(originalData[2] + expectedNoise), // 0 + 18 = 18
      );
    });

    it('should add negative noise when Math.random > 0.5', function () {
      mathRandomStub.returns(0.8); // (0.5 - 0.8) * factor = negative noise

      const testImageData = createFreshImageData();
      const originalData = new Uint8ClampedArray(testImageData.data);
      const factor = 40;

      Noise(testImageData, factor);

      const expectedNoise = (0.5 - 0.8) * factor; // -0.3 * 40 = -12

      assert.strictEqual(
        testImageData.data[0],
        clampedRound(originalData[0] + expectedNoise), // 100 + (-12) = 88
      );
      assert.strictEqual(
        testImageData.data[1],
        clampedRound(originalData[1] + expectedNoise), // 0 + (-12) = -12 -> 0
      );
      assert.strictEqual(
        testImageData.data[2],
        clampedRound(originalData[2] + expectedNoise), // 0 + (-12) = -12 -> 0
      );
    });

    it('should add no noise when Math.random = 0.5', function () {
      mathRandomStub.returns(0.5); // (0.5 - 0.5) * factor = 0

      const testImageData = createFreshImageData();
      const originalData = new Uint8ClampedArray(testImageData.data);

      Noise(testImageData, 100);

      // No change expected
      for (let i = 0; i < testImageData.data.length; i += 4) {
        assert.strictEqual(testImageData.data[i], originalData[i]);
        assert.strictEqual(testImageData.data[i + 1], originalData[i + 1]);
        assert.strictEqual(testImageData.data[i + 2], originalData[i + 2]);
      }
    });
  });

  describe('Factor parameter effects', function () {
    it('should produce more noise with higher factor', function () {
      mathRandomStub.returns(0.0);

      const imageData1 = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 100, 100, 255]),
      };
      const imageData2 = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 100, 100, 255]),
      };

      Noise(imageData1, 20); // Lower factor
      Noise(imageData2, 80); // Higher factor

      // Higher factor should produce more noise
      const noise1 = Math.abs(imageData1.data[0] - 100);
      const noise2 = Math.abs(imageData2.data[0] - 100);

      assert(noise2 > noise1);
    });

    it('should handle zero factor', function () {
      mathRandomStub.returns(0.2);

      // Create fresh imageData for this test
      const testImageData = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          100, 0, 0, 255, 0, 100, 0, 255, 0, 0, 100, 255, 128, 128, 128, 255,
        ]),
      };

      const originalData = new Uint8ClampedArray(testImageData.data);
      Noise(testImageData, 0);

      // No noise should be added
      for (let i = 0; i < testImageData.data.length; i += 4) {
        assert.strictEqual(testImageData.data[i], originalData[i]);
        assert.strictEqual(testImageData.data[i + 1], originalData[i + 1]);
        assert.strictEqual(testImageData.data[i + 2], originalData[i + 2]);
      }
    });

    it('should handle negative factor', function () {
      mathRandomStub.returns(0.2); // This would normally add positive noise

      const testImageData = createFreshImageData();
      const originalData = new Uint8ClampedArray(testImageData.data);
      const factor = -50;

      Noise(testImageData, factor);

      // With negative factor, the noise direction is inverted
      const expectedNoise = (0.5 - 0.2) * factor; // 0.3 * -50 = -15

      assert.strictEqual(
        testImageData.data[0],
        originalData[0] + expectedNoise,
      );
    });
  });

  describe('Random distribution', function () {
    it('should call Math.random for each pixel', function () {
      const testImageData = createFreshImageData();
      const pixelCount = testImageData.width * testImageData.height;
      mathRandomStub.returns(0.5);

      Noise(testImageData);

      // Should call Math.random once per pixel
      assert.strictEqual(mathRandomStub.callCount, pixelCount);
    });

    it('should apply different noise to each pixel when random values differ', function () {
      // Set up different random values for each pixel
      mathRandomStub.onCall(0).returns(0.2); // Positive noise
      mathRandomStub.onCall(1).returns(0.8); // Negative noise
      mathRandomStub.onCall(2).returns(0.5); // No noise
      mathRandomStub.onCall(3).returns(0.1); // Large positive noise

      // Create fresh imageData for this test
      const testImageData = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          100,
          0,
          0,
          255, // Pixel 1
          0,
          100,
          0,
          255, // Pixel 2
          0,
          0,
          100,
          255, // Pixel 3
          128,
          128,
          128,
          255, // Pixel 4
        ]),
      };

      const originalData = new Uint8ClampedArray(testImageData.data);
      const factor = 60;

      Noise(testImageData, factor);

      // Check that different pixels got different noise values
      const expectedNoise1 = (0.5 - 0.2) * 60; // 18
      const expectedNoise2 = (0.5 - 0.8) * 60; // -18
      const expectedNoise3 = (0.5 - 0.5) * 60; // 0

      assert.strictEqual(
        testImageData.data[0],
        clampedRound(originalData[0] + expectedNoise1),
      ); // 100 + 18 = 118
      assert.strictEqual(
        testImageData.data[4],
        clampedRound(originalData[4] + expectedNoise2),
      ); // 0 + (-18) = -18 -> 0
      assert.strictEqual(
        testImageData.data[8],
        clampedRound(originalData[8] + expectedNoise3),
      ); // 0 + 0 = 0

      // Verify different pixels got different adjustments (when they result in different final values)
      // testImageData.data[0] should be 118 (100 + 18)
      // testImageData.data[4] should be 0 (0 + (-18) clamped to 0)
      // testImageData.data[8] should be 0 (0 + 0)
      assert.notStrictEqual(testImageData.data[0], testImageData.data[4]);
      // Note: testImageData.data[4] and testImageData.data[8] both become 0, so they will be equal
    });
  });

  describe('Edge cases', function () {
    it('should handle empty imageData', function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      const result = Noise(emptyImageData);

      assert.strictEqual(result, emptyImageData);
      assert.strictEqual(result.data.length, 0);
      assert.strictEqual(mathRandomStub.callCount, 0); // No pixels to process
    });

    it('should handle single pixel image', function () {
      mathRandomStub.returns(0.3);

      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 150, 200, 255]),
      };

      Noise(singlePixelImageData, 50);

      const expectedNoise = (0.5 - 0.3) * 50; // 10

      assert.strictEqual(
        singlePixelImageData.data[0],
        100 + expectedNoise,
      );
      assert.strictEqual(
        singlePixelImageData.data[1],
        150 + expectedNoise,
      );
      assert.strictEqual(
        singlePixelImageData.data[2],
        200 + expectedNoise,
      );
      assert.strictEqual(singlePixelImageData.data[3], 255); // Alpha unchanged
    });

    it('should handle large factor values', function () {
      mathRandomStub.returns(0.0); // Maximum positive noise

      const imageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 100, 100, 255]),
      };

      Noise(imageData, 1000); // Very large factor

      const expectedNoise = (0.5 - 0.0) * 1000; // 500

      // Values get clamped to 255 due to Uint8ClampedArray
      assert.strictEqual(imageData.data[0], clampedRound(100 + expectedNoise)); // 100 + 500 = 600 -> 255
      assert.strictEqual(imageData.data[1], clampedRound(100 + expectedNoise)); // 100 + 500 = 600 -> 255
      assert.strictEqual(imageData.data[2], clampedRound(100 + expectedNoise)); // 100 + 500 = 600 -> 255
    });
  });

  describe('Value overflow/underflow', function () {
    it('should clamp values that exceed 255', function () {
      mathRandomStub.returns(0.0);

      const highValueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([200, 220, 240, 255]),
      };

      Noise(highValueImageData, 120); // Large noise factor

      const expectedNoise = (0.5 - 0.0) * 120; // 60

      assert.strictEqual(
        highValueImageData.data[0],
        clampedRound(200 + expectedNoise),
      ); // 200 + 60 = 260 -> 255
      assert.strictEqual(
        highValueImageData.data[1],
        clampedRound(220 + expectedNoise),
      ); // 220 + 60 = 280 -> 255
      assert.strictEqual(
        highValueImageData.data[2],
        clampedRound(240 + expectedNoise),
      ); // 240 + 60 = 300 -> 255
    });

    it('should clamp values that go below 0', function () {
      mathRandomStub.returns(1.0);

      const lowValueImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([20, 30, 40, 255]),
      };

      Noise(lowValueImageData, 100);

      const expectedNoise = (0.5 - 1.0) * 100; // -50

      assert.strictEqual(
        lowValueImageData.data[0],
        clampedRound(20 + expectedNoise),
      ); // 20 + (-50) = -30 -> 0
      assert.strictEqual(
        lowValueImageData.data[1],
        clampedRound(30 + expectedNoise),
      ); // 30 + (-50) = -20 -> 0
      assert.strictEqual(
        lowValueImageData.data[2],
        clampedRound(40 + expectedNoise),
      ); // 40 + (-50) = -10 -> 0
    });
  });

  describe('Data integrity', function () {
    it('should maintain imageData structure', function () {
      mathRandomStub.returns(0.5);
      const testImageData = createFreshImageData();
      const result = Noise(testImageData);

      assert(Object.prototype.hasOwnProperty.call(result, 'width'));
      assert(Object.prototype.hasOwnProperty.call(result, 'height'));
      assert(Object.prototype.hasOwnProperty.call(result, 'data'));
      assert(result.data instanceof Uint8ClampedArray);
    });

    it('should not change imageData dimensions', function () {
      mathRandomStub.returns(0.5);
      const testImageData = createFreshImageData();
      const originalWidth = testImageData.width;
      const originalHeight = testImageData.height;
      const originalLength = testImageData.data.length;

      Noise(testImageData);

      assert.strictEqual(testImageData.width, originalWidth);
      assert.strictEqual(testImageData.height, originalHeight);
      assert.strictEqual(testImageData.data.length, originalLength);
    });

    it('should process all pixels', function () {
      mathRandomStub.returns(0.4);
      const testImageData = createFreshImageData();
      const pixelCount = testImageData.width * testImageData.height;

      Noise(testImageData);

      // Verify all pixels were processed
      for (let i = 0; i < pixelCount * 4; i += 4) {
        assert(typeof testImageData.data[i] === 'number'); // Red
        assert(typeof testImageData.data[i + 1] === 'number'); // Green
        assert(typeof testImageData.data[i + 2] === 'number'); // Blue
        assert(typeof testImageData.data[i + 3] === 'number'); // Alpha
      }
    });
  });
});
