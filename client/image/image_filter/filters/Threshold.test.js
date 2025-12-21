'use strict';

import assert from 'assert';
import { Threshold } from './Threshold.js';

describe('Threshold Filter', () => {
  let imageData;

  beforeEach(() => {
    // Create a mock ImageData with known pixel values
    const data = new Uint8ClampedArray([
      255,
      255,
      255,
      255, // White pixel
      128,
      128,
      128,
      255, // Gray pixel
      0,
      0,
      0,
      255, // Black pixel
      200,
      100,
      50,
      255, // Color pixel
      64,
      64,
      64,
      255, // Dark gray pixel
      192,
      192,
      192,
      255, // Light gray pixel
    ]);
    imageData = {
      data: data,
      width: 2,
      height: 3,
    };
  });

  describe('Basic functionality', () => {
    it('should apply threshold effect to convert image to black and white', () => {
      const threshold = 128;
      const result = Threshold(imageData, threshold);

      assert.strictEqual(
        result,
        imageData,
        'Should return the same imageData object',
      );

      // Check that all pixels are either black (0) or white (255)
      for (let i = 0; i < result.data.length; i += 4) {
        const r = result.data[i];
        const g = result.data[i + 1];
        const b = result.data[i + 2];
        const alpha = result.data[i + 3];

        assert(
          r === 0 || r === 255,
          `Red channel should be 0 or 255, got ${r}`,
        );
        assert(
          g === 0 || g === 255,
          `Green channel should be 0 or 255, got ${g}`,
        );
        assert(
          b === 0 || b === 255,
          `Blue channel should be 0 or 255, got ${b}`,
        );
        assert.strictEqual(r, g, 'Red and green channels should be equal');
        assert.strictEqual(g, b, 'Green and blue channels should be equal');
        assert.strictEqual(alpha, 255, 'Alpha channel should remain unchanged');
      }
    });

    it('should use luminance formula for threshold calculation', () => {
      const threshold = 128;
      const result = Threshold(imageData, threshold);

      // White pixel (255, 255, 255) - luminance = 255 >= 128 → white
      assert.strictEqual(result.data[0], 255);
      assert.strictEqual(result.data[1], 255);
      assert.strictEqual(result.data[2], 255);

      // Gray pixel (128, 128, 128) - luminance = 128 >= 128 → white
      assert.strictEqual(result.data[4], 255);
      assert.strictEqual(result.data[5], 255);
      assert.strictEqual(result.data[6], 255);

      // Black pixel (0, 0, 0) - luminance = 0 < 128 → black
      assert.strictEqual(result.data[8], 0);
      assert.strictEqual(result.data[9], 0);
      assert.strictEqual(result.data[10], 0);
    });

    it('should handle color pixels correctly using luminance', () => {
      const threshold = 100;
      const result = Threshold(imageData, threshold);

      // Color pixel (200, 100, 50) - luminance ≈ 126.5 >= 100 → white
      assert.strictEqual(result.data[12], 255);
      assert.strictEqual(result.data[13], 255);
      assert.strictEqual(result.data[14], 255);
    });
  });

  describe('Threshold values', () => {
    it('should handle threshold of 0 (all pixels become white)', () => {
      const result = Threshold(imageData, 0);

      for (let i = 0; i < result.data.length; i += 4) {
        assert.strictEqual(
          result.data[i],
          255,
          'All red values should be white',
        );
        assert.strictEqual(
          result.data[i + 1],
          255,
          'All green values should be white',
        );
        assert.strictEqual(
          result.data[i + 2],
          255,
          'All blue values should be white',
        );
      }
    });

    it('should handle threshold of 255 (all pixels become black)', () => {
      const result = Threshold(imageData, 255);

      for (let i = 0; i < result.data.length; i += 4) {
        assert.strictEqual(result.data[i], 0, 'All red values should be black');
        assert.strictEqual(
          result.data[i + 1],
          0,
          'All green values should be black',
        );
        assert.strictEqual(
          result.data[i + 2],
          0,
          'All blue values should be black',
        );
      }
    });

    it('should handle mid-range threshold values correctly', () => {
      const threshold = 127;
      const result = Threshold(imageData, threshold);

      // Gray pixel (128, 128, 128) - luminance = 128 >= 127 → white
      assert.strictEqual(result.data[4], 255);
      assert.strictEqual(result.data[5], 255);
      assert.strictEqual(result.data[6], 255);

      // Dark gray pixel (64, 64, 64) - luminance = 64 < 127 → black
      assert.strictEqual(result.data[16], 0);
      assert.strictEqual(result.data[17], 0);
      assert.strictEqual(result.data[18], 0);
    });

    it('should handle exact threshold boundary conditions', () => {
      // Create pixel with exact luminance matching threshold
      const testData = new Uint8ClampedArray([128, 128, 128, 255]);
      const testImageData = {
        data: testData,
        width: 1,
        height: 1,
      };

      const result = Threshold(testImageData, 128);

      // Luminance = 128, threshold = 128, so 128 >= 128 → white
      assert.strictEqual(result.data[0], 255);
      assert.strictEqual(result.data[1], 255);
      assert.strictEqual(result.data[2], 255);
    });
  });

  describe('Edge cases', () => {
    it('should handle single pixel image', () => {
      const singlePixelData = new Uint8ClampedArray([100, 150, 200, 255]);
      const singlePixel = {
        data: singlePixelData,
        width: 1,
        height: 1,
      };

      const result = Threshold(singlePixel, 128);

      // Luminance ≈ 130.6 >= 128 → white
      assert.strictEqual(result.data[0], 255);
      assert.strictEqual(result.data[1], 255);
      assert.strictEqual(result.data[2], 255);
      assert.strictEqual(result.data[3], 255);
    });

    it('should handle empty image data', () => {
      const emptyData = new Uint8ClampedArray([]);
      const emptyImage = {
        data: emptyData,
        width: 0,
        height: 0,
      };

      const result = Threshold(emptyImage, 128);
      assert.strictEqual(result.data.length, 0);
    });

    it('should preserve alpha channel values', () => {
      const dataWithVaryingAlpha = new Uint8ClampedArray([
        128,
        128,
        128,
        255, // Opaque
        128,
        128,
        128,
        128, // Semi-transparent
        128,
        128,
        128,
        0, // Transparent
        128,
        128,
        128,
        64, // Quarter alpha
      ]);
      const imageWithAlpha = {
        data: dataWithVaryingAlpha,
        width: 2,
        height: 2,
      };

      const result = Threshold(imageWithAlpha, 128);

      // Check that alpha values are preserved
      assert.strictEqual(
        result.data[3],
        255,
        'First alpha should be preserved',
      );
      assert.strictEqual(
        result.data[7],
        128,
        'Second alpha should be preserved',
      );
      assert.strictEqual(result.data[11], 0, 'Third alpha should be preserved');
      assert.strictEqual(
        result.data[15],
        64,
        'Fourth alpha should be preserved',
      );
    });
  });

  describe('Luminance calculation verification', () => {
    it('should use correct luminance coefficients (ITU-R BT.709)', () => {
      // Test with pure red
      let redData = new Uint8ClampedArray([255, 0, 0, 255]);
      let redImage = { data: redData, width: 1, height: 1 };

      // Red luminance = 0.2126 * 255 ≈ 54.213
      const redResult = Threshold(redImage, 55);
      assert.strictEqual(
        redResult.data[0],
        0,
        'Pure red should be below threshold 55',
      );

      redData = new Uint8ClampedArray([255, 0, 0, 255]);
      redImage = { data: redData, width: 1, height: 1 };
      const redResult2 = Threshold(redImage, 54);
      assert.strictEqual(
        redResult2.data[0],
        255,
        'Pure red should be above or equal to threshold 54',
      );

      // Test with pure green
      let greenData = new Uint8ClampedArray([0, 255, 0, 255]);
      let greenImage = { data: greenData, width: 1, height: 1 };

      // Green luminance = 0.7152 * 255 ≈ 182.376
      const greenResult = Threshold(greenImage, 183);
      assert.strictEqual(
        greenResult.data[0],
        0,
        'Pure green should be below threshold 183',
      );

      greenData = new Uint8ClampedArray([0, 255, 0, 255]);
      greenImage = { data: greenData, width: 1, height: 1 };
      const greenResult2 = Threshold(greenImage, 182);
      assert.strictEqual(
        greenResult2.data[0],
        255,
        'Pure green should be above or equal to threshold 182',
      );

      // Test with pure blue
      let blueData = new Uint8ClampedArray([0, 0, 255, 255]);
      let blueImage = { data: blueData, width: 1, height: 1 };

      // Blue luminance = 0.0722 * 255 ≈ 18.411
      const blueResult = Threshold(blueImage, 19);
      assert.strictEqual(
        blueResult.data[0],
        0,
        'Pure blue should be below threshold 19',
      );

      blueData = new Uint8ClampedArray([0, 0, 255, 255]);
      blueImage = { data: blueData, width: 1, height: 1 };
      const blueResult2 = Threshold(blueImage, 18);
      assert.strictEqual(
        blueResult2.data[0],
        255,
        'Pure blue should be above or equal to threshold 18',
      );
    });
  });

  describe('Parameter validation and edge cases', () => {
    it('should handle negative threshold values', () => {
      const result = Threshold(imageData, -10);

      // All pixels should become white since all luminance values >= -10
      for (let i = 0; i < result.data.length; i += 4) {
        assert.strictEqual(result.data[i], 255);
        assert.strictEqual(result.data[i + 1], 255);
        assert.strictEqual(result.data[i + 2], 255);
      }
    });

    it('should handle threshold values above 255', () => {
      const result = Threshold(imageData, 300);

      // All pixels should become black since no luminance value >= 300
      for (let i = 0; i < result.data.length; i += 4) {
        assert.strictEqual(result.data[i], 0);
        assert.strictEqual(result.data[i + 1], 0);
        assert.strictEqual(result.data[i + 2], 0);
      }
    });

    it('should handle fractional threshold values', () => {
      const result = Threshold(imageData, 127.5);

      // Gray pixel (128, 128, 128) - luminance = 128 >= 127.5 → white
      assert.strictEqual(result.data[4], 255);
      assert.strictEqual(result.data[5], 255);
      assert.strictEqual(result.data[6], 255);
    });
  });

  describe('Data integrity', () => {
    it('should not modify the original image data structure', () => {
      const originalWidth = imageData.width;
      const originalHeight = imageData.height;
      const originalDataLength = imageData.data.length;

      Threshold(imageData, 128);

      assert.strictEqual(
        imageData.width,
        originalWidth,
        'Width should not change',
      );
      assert.strictEqual(
        imageData.height,
        originalHeight,
        'Height should not change',
      );
      assert.strictEqual(
        imageData.data.length,
        originalDataLength,
        'Data length should not change',
      );
    });

    it('should handle large images efficiently', () => {
      // Create a larger test image
      const largeData = new Uint8ClampedArray(4000); // 1000 pixels
      for (let i = 0; i < largeData.length; i += 4) {
        largeData[i] = Math.floor(Math.random() * 256); // Random R
        largeData[i + 1] = Math.floor(Math.random() * 256); // Random G
        largeData[i + 2] = Math.floor(Math.random() * 256); // Random B
        largeData[i + 3] = 255; // Full alpha
      }

      const largeImage = {
        data: largeData,
        width: 100,
        height: 10,
      };

      const startTime = process.hrtime();
      const result = Threshold(largeImage, 128);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

      assert(
        duration < 100,
        'Large image processing should complete in reasonable time',
      );
      assert.strictEqual(
        result.data.length,
        4000,
        'Result should have same data length',
      );

      // Verify all pixels are properly thresholded
      for (let i = 0; i < result.data.length; i += 4) {
        const r = result.data[i];
        const g = result.data[i + 1];
        const b = result.data[i + 2];

        assert(r === 0 || r === 255, 'All red values should be 0 or 255');
        assert.strictEqual(r, g, 'R and G should be equal');
        assert.strictEqual(g, b, 'G and B should be equal');
      }
    });
  });
});
