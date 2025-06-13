import { strict as assert } from "assert";
import sinon from "sinon";
import { ImageFilter } from "../ImageFilter.js";
import { Sharpen } from "./Sharpen.js";

describe("Sharpen", function () {
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
      .stub(ImageFilter, "convolute")
      .returns(mockImageData);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("Basic functionality", function () {
    it("should call ImageFilter.convolute with correct sharpen kernel", function () {
      const expectedKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

      Sharpen(mockImageData);

      assert(convoluteSpy.calledOnce);
      assert(convoluteSpy.calledWith(mockImageData, expectedKernel));
    });

    it("should return the result from ImageFilter.convolute", function () {
      const result = Sharpen(mockImageData);

      assert.strictEqual(result, mockImageData);
    });

    it("should use 3x3 sharpen kernel", function () {
      Sharpen(mockImageData);

      const calledKernel = convoluteSpy.firstCall.args[1];

      // Check that kernel has 9 elements (3x3)
      assert.strictEqual(calledKernel.length, 9);
      assert.strictEqual(Math.sqrt(calledKernel.length), 3);
    });
  });

  describe("Kernel properties", function () {
    it("should use the correct sharpen kernel values", function () {
      Sharpen(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];
      const expectedKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

      assert.deepStrictEqual(kernel, expectedKernel);
    });

    it("should have center value of 5", function () {
      Sharpen(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];

      // Center element (index 4 in 3x3 kernel)
      assert.strictEqual(kernel[4], 5);
    });

    it("should have edge values of -1", function () {
      Sharpen(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];

      // Edge elements (indices 1, 3, 5, 7)
      assert.strictEqual(kernel[1], -1); // Top
      assert.strictEqual(kernel[3], -1); // Left
      assert.strictEqual(kernel[5], -1); // Right
      assert.strictEqual(kernel[7], -1); // Bottom
    });

    it("should have corner values of 0", function () {
      Sharpen(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];

      // Corner elements (indices 0, 2, 6, 8)
      assert.strictEqual(kernel[0], 0); // Top-left
      assert.strictEqual(kernel[2], 0); // Top-right
      assert.strictEqual(kernel[6], 0); // Bottom-left
      assert.strictEqual(kernel[8], 0); // Bottom-right
    });

    it("should create an edge-enhancing kernel", function () {
      Sharpen(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];

      // Sharpen kernel enhances edges by:
      // - Amplifying center pixel (5x)
      // - Subtracting adjacent pixels (-1x)
      // - Ignoring diagonal pixels (0x)

      const centerWeight = kernel[4];
      const edgeWeights = [kernel[1], kernel[3], kernel[5], kernel[7]];
      const cornerWeights = [kernel[0], kernel[2], kernel[6], kernel[8]];

      assert.strictEqual(centerWeight, 5);
      edgeWeights.forEach((weight) => assert.strictEqual(weight, -1));
      cornerWeights.forEach((weight) => assert.strictEqual(weight, 0));
    });

    it("should have positive kernel sum (enhances brightness)", function () {
      Sharpen(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];
      const sum = kernel.reduce((acc, val) => acc + val, 0);

      // Sum = 5 + 4*(-1) + 4*(0) = 5 - 4 = 1
      assert.strictEqual(sum, 1);
      assert(sum > 0); // Positive sum means it preserves/enhances brightness
    });
  });

  describe("Edge cases", function () {
    it("should handle null imageData gracefully", function () {
      Sharpen(null);

      assert(convoluteSpy.calledWith(null));
    });

    it("should handle undefined imageData gracefully", function () {
      Sharpen(undefined);

      assert(convoluteSpy.calledWith(undefined));
    });

    it("should handle empty imageData", function () {
      const emptyImageData = {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray([]),
      };

      Sharpen(emptyImageData);

      assert(convoluteSpy.calledWith(emptyImageData));
    });

    it("should handle single pixel image", function () {
      const singlePixelImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      Sharpen(singlePixelImageData);

      assert(convoluteSpy.calledWith(singlePixelImageData));
    });
  });

  describe("Integration with ImageFilter", function () {
    it("should pass through any additional parameters to convolute", function () {
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

      const result = Sharpen(mockImageData);

      assert(result);
      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
    });

    it("should maintain imageData structure", function () {
      const result = Sharpen(mockImageData);

      assert(result.hasOwnProperty("width"));
      assert(result.hasOwnProperty("height"));
      assert(result.hasOwnProperty("data"));
    });
  });

  describe("Comparison with blur", function () {
    it("should use opposite approach compared to blur filter", function () {
      // Blur kernel: all positive, uniform weights
      const blurKernel = [
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

      Sharpen(mockImageData);
      const sharpenKernel = convoluteSpy.firstCall.args[1];

      // Sharpen should have:
      // - Large positive center (vs small positive in blur)
      // - Negative edges (vs positive in blur)
      assert(sharpenKernel[4] > blurKernel[4]); // Center: 5 > 1/9
      assert(sharpenKernel[1] < 0 && blurKernel[1] > 0); // Edges: negative vs positive
    });
  });

  describe("Kernel mathematical properties", function () {
    it("should be a high-pass filter", function () {
      Sharpen(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];

      // High-pass filter characteristics:
      // - Positive center value larger than sum of negative values
      // - Sum is small and positive (preserves overall brightness)
      const centerValue = kernel[4];
      const negativeSum = kernel
        .filter((v) => v < 0)
        .reduce((a, b) => a + b, 0);

      assert(centerValue > Math.abs(negativeSum));
      assert(centerValue + negativeSum === 1); // Total sum
    });

    it("should enhance edge detection", function () {
      Sharpen(mockImageData);

      const kernel = convoluteSpy.firstCall.args[1];

      // Edge enhancement pattern:
      // [0, -1,  0]
      // [-1, 5, -1]
      // [0, -1,  0]

      // This pattern detects edges by finding differences between center and adjacent pixels
      assert.deepStrictEqual(kernel, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
    });
  });

  describe("Performance characteristics", function () {
    it("should only call convolute once per sharpen operation", function () {
      Sharpen(mockImageData);
      Sharpen(mockImageData);
      Sharpen(mockImageData);

      assert.strictEqual(convoluteSpy.callCount, 3);
    });

    it("should pass the same imageData reference", function () {
      Sharpen(mockImageData);

      const passedImageData = convoluteSpy.firstCall.args[0];
      assert.strictEqual(passedImageData, mockImageData);
    });
  });

  describe("Filter characteristics", function () {
    it("should be suitable for edge enhancement", function () {
      // The sharpen kernel is specifically designed to enhance edges
      // by amplifying differences between adjacent pixels

      Sharpen(mockImageData);
      const kernel = convoluteSpy.firstCall.args[1];

      // Verify it follows the edge enhancement pattern
      // Center pixel gets multiplied by 5 (amplified)
      // Adjacent pixels get subtracted (creates contrast)
      // Diagonal pixels are ignored (preserves diagonal edges)

      assert.strictEqual(kernel[4], 5); // Center amplification
      assert.strictEqual(kernel[1] + kernel[3] + kernel[5] + kernel[7], -4); // Edge subtraction
      assert.strictEqual(kernel[0] + kernel[2] + kernel[6] + kernel[8], 0); // Diagonal ignore
    });
  });
});
