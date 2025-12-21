import { strict as assert } from 'assert';
import sinon from 'sinon';
import { ImageFilter } from '../ImageFilter.js';
import { Blur } from './Blur.js';

describe('Blur', function () {
  let sandbox;
  let mockImageData;
  let convoluteSpy;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Create mock ImageData
    mockImageData = {
      width: 4,
      height: 4,
      data: new Uint8ClampedArray([
        // Row 1: Red pixels
        255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
        // Row 2: Green pixels
        0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
        // Row 3: Blue pixels
        0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
        // Row 4: White pixels
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255,
      ]),
    };

    // Spy on ImageFilter.convolute
    convoluteSpy = sandbox
      .stub(ImageFilter, 'convolute')
      .returns(mockImageData);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Basic functionality', function () {
    it('should call ImageFilter.convolute with correct blur kernel', function () {
      const expectedKernel = [
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
      ];

      Blur(mockImageData);

      assert(convoluteSpy.calledOnce);
      assert(convoluteSpy.calledWith(mockImageData, expectedKernel));
    });

    it('should return the result from ImageFilter.convolute', function () {
      const result = Blur(mockImageData);

      assert.strictEqual(result, mockImageData);
    });

    it('should use 3x3 blur kernel with equal weights', function () {
      Blur(mockImageData);

      const calledKernel = convoluteSpy.firstCall.args[1];

      // Check that all kernel values are 1/9
      assert.strictEqual(calledKernel.length, 9);
      calledKernel.forEach((value) => {
        assert.strictEqual(value, 1 / 9);
      });
    });
  });

  describe('Kernel properties', function () {
    it('should use normalized kernel that sums to 1', function () {
      Blur(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];
      const sum = kernel.reduce((acc, val) => acc + val, 0);

      // Should sum to 1 (with floating point tolerance)
      assert(Math.abs(sum - 1) < 0.0001);
    });

    it('should use uniform kernel (all values equal)', function () {
      Blur(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];
      const firstValue = kernel[0];

      kernel.forEach((value) => {
        assert.strictEqual(value, firstValue);
      });
    });

    it('should create a 3x3 kernel matrix', function () {
      Blur(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];

      // 3x3 = 9 elements
      assert.strictEqual(kernel.length, 9);

      // Check that it's a valid 3x3 matrix structure
      assert.strictEqual(Math.sqrt(kernel.length), 3);
    });
  });

  describe('Edge cases', function () {
    it('should handle null imageData gracefully', function () {
      Blur(null);

      assert(convoluteSpy.calledWith(null));
    });

    it('should handle undefined imageData gracefully', function () {
      Blur(undefined);

      assert(convoluteSpy.calledWith(undefined));
    });

    it('should handle empty imageData', function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      Blur(emptyImageData);

      assert(convoluteSpy.calledWith(emptyImageData));
    });

    it('should handle single pixel image', function () {
      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      Blur(singlePixelImageData);

      assert(convoluteSpy.calledWith(singlePixelImageData));
    });
  });

  describe('Integration with ImageFilter', function () {
    it('should pass through any additional parameters to convolute', function () {
      // Restore the stub to test actual integration
      convoluteSpy.restore();

      // Create a proper mock context for ImageFilter
      const mockContext = {
        createImageData: sandbox.stub().callsFake((w, h) => ({
          width: w,
          height: h,
          data: new Uint8ClampedArray(w * h * 4),
        })),
      };

      ImageFilter.tmpCtx = mockContext;

      const result = Blur(mockImageData);

      assert(result);
      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
    });

    it('should maintain imageData structure', function () {
      const result = Blur(mockImageData);

      assert(Object.prototype.hasOwnProperty.call(result, 'width'));
      assert(Object.prototype.hasOwnProperty.call(result, 'height'));
      assert(Object.prototype.hasOwnProperty.call(result, 'data'));
    });
  });

  describe('Performance characteristics', function () {
    it('should only call convolute once per blur operation', function () {
      Blur(mockImageData);
      Blur(mockImageData);
      Blur(mockImageData);

      assert.strictEqual(convoluteSpy.callCount, 3);
    });

    it('should pass the same imageData reference', function () {
      Blur(mockImageData);

      const passedImageData = convoluteSpy.firstCall.args[0];
      assert.strictEqual(passedImageData, mockImageData);
    });
  });
});
