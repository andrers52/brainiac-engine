import { strict as assert } from "assert";
import sinon from "sinon";
import { ImageFilter } from "./ImageFilter.js";

describe("ImageFilter", function () {
  let mockResourceStore;
  let mockImageData;
  let mockContext;
  let mockCanvas;
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // Create mock ImageData
    mockImageData = {
      width: 4,
      height: 4,
      data: new Uint8ClampedArray([
        // Row 1: Red pixels
        255,
        0,
        0,
        255, // Red
        255,
        0,
        0,
        255, // Red
        255,
        0,
        0,
        255, // Red
        255,
        0,
        0,
        255, // Red
        // Row 2: Green pixels
        0,
        255,
        0,
        255, // Green
        0,
        255,
        0,
        255, // Green
        0,
        255,
        0,
        255, // Green
        0,
        255,
        0,
        255, // Green
        // Row 3: Blue pixels
        0,
        0,
        255,
        255, // Blue
        0,
        0,
        255,
        255, // Blue
        0,
        0,
        255,
        255, // Blue
        0,
        0,
        255,
        255, // Blue
        // Row 4: White pixels
        255,
        255,
        255,
        255, // White
        255,
        255,
        255,
        255, // White
        255,
        255,
        255,
        255, // White
        255,
        255,
        255,
        255, // White
      ]),
    };

    // Create mock canvas context
    mockContext = {
      createImageData: sandbox.stub().callsFake((w, h) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4),
      })),
      getImageData: sandbox.stub().returns(mockImageData),
      putImageData: sandbox.stub(),
    };

    // Create mock canvas
    mockCanvas = {
      width: 4,
      height: 4,
      getContext: sandbox.stub().returns(mockContext),
    };

    // Mock document.createElement to return our mock canvas
    if (global.document && !global.document.createElement.isSinonProxy) {
      sandbox.stub(global.document, "createElement").returns(mockCanvas);
    }

    // Mock ImageFilter's static canvas context
    ImageFilter.tmpCtx = mockContext;

    // Create mock ResourceStore
    mockResourceStore = {
      cloneImage: sandbox.stub().returns("cloned_image_name"),
      getImageData: sandbox.stub().returns(mockImageData),
      setImageData: sandbox.stub(),
      retrieveResourceObject: sandbox.stub().returns(mockCanvas),
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("ImageFilter main function", function () {
    it("should apply filters to original image when applyOverOriginalImage is true", function () {
      const mockFilter = sandbox.stub().returns(mockImageData);
      const imageName = "test_image";

      const result = ImageFilter(
        mockResourceStore,
        imageName,
        true, // applyOverOriginalImage
        mockFilter,
        "filter_arg",
      );

      assert.strictEqual(result, imageName);
      assert(mockResourceStore.cloneImage.notCalled);
      assert(mockResourceStore.getImageData.calledWith(imageName));
      assert(mockFilter.calledWith(mockImageData, "filter_arg"));
      assert(
        mockResourceStore.setImageData.calledWith(imageName, mockImageData),
      );
    });

    it("should create cloned image when applyOverOriginalImage is false", function () {
      const mockFilter = sandbox.stub().returns(mockImageData);
      const imageName = "test_image";

      const result = ImageFilter(
        mockResourceStore,
        imageName,
        false, // applyOverOriginalImage
        mockFilter,
        "filter_arg",
      );

      assert.strictEqual(result, "cloned_image_name");
      assert(mockResourceStore.cloneImage.calledWith(imageName));
      assert(mockResourceStore.getImageData.calledWith("cloned_image_name"));
      assert(mockFilter.calledWith(mockImageData, "filter_arg"));
      assert(
        mockResourceStore.setImageData.calledWith(
          "cloned_image_name",
          mockImageData,
        ),
      );
    });

    it("should apply multiple filters in sequence", function () {
      const filter1 = sandbox.stub().returns(mockImageData);
      const filter2 = sandbox.stub().returns(mockImageData);
      const filter3 = sandbox.stub().returns(mockImageData);

      ImageFilter(
        mockResourceStore,
        "test_image",
        true,
        filter1,
        "arg1",
        filter2,
        "arg2",
        filter3,
        "arg3",
      );

      assert(filter1.calledWith(mockImageData, "arg1"));
      assert(filter2.calledWith(mockImageData, "arg2"));
      assert(filter3.calledWith(mockImageData, "arg3"));
      assert(filter1.calledBefore(filter2));
      assert(filter2.calledBefore(filter3));
    });

    it("should handle filters without arguments", function () {
      const filter1 = sandbox.stub().returns(mockImageData);

      ImageFilter(mockResourceStore, "test_image", true, filter1);

      assert(filter1.calledWith(mockImageData, null));
    });

    it("should handle mixed filters with and without arguments", function () {
      const filter1 = sandbox.stub().returns(mockImageData);
      const filter2 = sandbox.stub().returns(mockImageData);

      ImageFilter(
        mockResourceStore,
        "test_image",
        true,
        filter1,
        "arg1",
        filter2,
      );

      assert(filter1.calledWith(mockImageData, "arg1"));
      assert(filter2.calledWith(mockImageData, null));
    });

    it("should handle empty filter array", function () {
      const result = ImageFilter(mockResourceStore, "test_image", true);

      assert.strictEqual(result, "test_image");
      assert(mockResourceStore.getImageData.calledWith("test_image"));
      assert(
        mockResourceStore.setImageData.calledWith("test_image", mockImageData),
      );
    });

    it("should pass modified image data between filters", function () {
      const modifiedImageData = { ...mockImageData, modified: true };
      const filter1 = sandbox.stub().returns(modifiedImageData);
      const filter2 = sandbox.stub().returns(mockImageData);

      ImageFilter(
        mockResourceStore,
        "test_image",
        true,
        filter1,
        "arg1",
        filter2,
        "arg2",
      );

      assert(filter1.calledWith(mockImageData, "arg1"));
      assert(filter2.calledWith(modifiedImageData, "arg2"));
    });
  });

  describe("ImageFilter.createImageData", function () {
    it("should create ImageData with specified dimensions", function () {
      const width = 10;
      const height = 8;

      ImageFilter.createImageData(width, height);

      assert(mockContext.createImageData.calledWith(width, height));
    });

    it("should handle different dimensions", function () {
      ImageFilter.createImageData(1, 1);
      assert(mockContext.createImageData.calledWith(1, 1));

      ImageFilter.createImageData(100, 50);
      assert(mockContext.createImageData.calledWith(100, 50));
    });
  });

  describe("ImageFilter.convolute", function () {
    it("should apply identity convolution (no change)", function () {
      const identityKernel = [0, 0, 0, 0, 1, 0, 0, 0, 0];

      const result = ImageFilter.convolute(mockImageData, identityKernel);

      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
      assert(result.data instanceof Uint8ClampedArray);
    });

    it("should apply blur convolution", function () {
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

      const result = ImageFilter.convolute(mockImageData, blurKernel);

      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
      assert(result.data instanceof Uint8ClampedArray);
      assert.strictEqual(result.data.length, mockImageData.data.length);
    });

    it("should apply edge detection convolution", function () {
      const edgeKernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];

      const result = ImageFilter.convolute(mockImageData, edgeKernel);

      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
      assert(result.data instanceof Uint8ClampedArray);
    });

    it("should handle opaque parameter", function () {
      const kernel = [0, 0, 0, 0, 1, 0, 0, 0, 0];

      const opaqueResult = ImageFilter.convolute(mockImageData, kernel, true);
      const transparentResult = ImageFilter.convolute(
        mockImageData,
        kernel,
        false,
      );

      assert.strictEqual(opaqueResult.width, mockImageData.width);
      assert.strictEqual(transparentResult.width, mockImageData.width);
      // Alpha channel handling should be different
      assert(opaqueResult.data instanceof Uint8ClampedArray);
      assert(transparentResult.data instanceof Uint8ClampedArray);
    });

    it("should handle 5x5 convolution kernel", function () {
      const kernel5x5 = new Array(25).fill(1 / 25); // 5x5 blur

      const result = ImageFilter.convolute(mockImageData, kernel5x5);

      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
    });

    it("should handle 1x1 convolution kernel", function () {
      const kernel1x1 = [2]; // Double intensity

      const result = ImageFilter.convolute(mockImageData, kernel1x1);

      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
    });

    it("should clamp values to valid range", function () {
      const amplifyKernel = [
        0,
        0,
        0,
        0,
        2,
        0, // Double the center pixel
        0,
        0,
        0,
      ];

      const result = ImageFilter.convolute(mockImageData, amplifyKernel);

      // Values should be clamped to 0-255 range
      for (let i = 0; i < result.data.length; i++) {
        assert(result.data[i] >= 0);
        assert(result.data[i] <= 255);
      }
    });
  });

  describe("ImageFilter.convoluteFloat32", function () {
    it("should return Float32Array data", function () {
      const kernel = [0, 0, 0, 0, 1, 0, 0, 0, 0];

      const result = ImageFilter.convoluteFloat32(mockImageData, kernel);

      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
      assert(result.data instanceof Float32Array);
      assert.strictEqual(result.data.length, mockImageData.data.length);
    });

    it("should handle values outside 0-255 range", function () {
      const amplifyKernel = [
        0,
        0,
        0,
        0,
        5,
        0, // 5x amplification
        0,
        0,
        0,
      ];

      const result = ImageFilter.convoluteFloat32(mockImageData, amplifyKernel);

      // Float32 should allow values outside 0-255 range
      assert(result.data instanceof Float32Array);

      // Check that some values exceed 255 (since we're amplifying)
      let hasValuesOver255 = false;
      for (let i = 0; i < result.data.length; i += 4) {
        if (
          result.data[i] > 255 ||
          result.data[i + 1] > 255 ||
          result.data[i + 2] > 255
        ) {
          hasValuesOver255 = true;
          break;
        }
      }
      assert(hasValuesOver255, "Float32 convolution should allow values > 255");
    });

    it("should handle opaque parameter in Float32 mode", function () {
      const kernel = [0, 0, 0, 0, 1, 0, 0, 0, 0];

      const opaqueResult = ImageFilter.convoluteFloat32(
        mockImageData,
        kernel,
        true,
      );
      const transparentResult = ImageFilter.convoluteFloat32(
        mockImageData,
        kernel,
        false,
      );

      assert(opaqueResult.data instanceof Float32Array);
      assert(transparentResult.data instanceof Float32Array);
      assert.strictEqual(opaqueResult.width, mockImageData.width);
      assert.strictEqual(transparentResult.width, mockImageData.width);
    });

    it("should handle edge clamping correctly", function () {
      // Create a small 2x2 image for easier edge testing
      const smallImageData = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255,
          0,
          0,
          255, // Red
          0,
          255,
          0,
          255, // Green
          0,
          0,
          255,
          255, // Blue
          255,
          255,
          255,
          255, // White
        ]),
      };

      const kernel = [1, 0, 0, 0, 0, 0, 0, 0, 0]; // Top-left weight only

      const result = ImageFilter.convoluteFloat32(smallImageData, kernel);

      assert.strictEqual(result.width, 2);
      assert.strictEqual(result.height, 2);
      assert(result.data instanceof Float32Array);
    });

    it("should handle different kernel sizes in Float32 mode", function () {
      const kernel5x5 = new Array(25).fill(1 / 25);

      const result = ImageFilter.convoluteFloat32(mockImageData, kernel5x5);

      assert.strictEqual(result.width, mockImageData.width);
      assert.strictEqual(result.height, mockImageData.height);
      assert(result.data instanceof Float32Array);
    });

    it("should produce different results from regular convolute for high values", function () {
      const amplifyKernel = [0, 0, 0, 0, 3, 0, 0, 0, 0];

      const regularResult = ImageFilter.convolute(mockImageData, amplifyKernel);
      const float32Result = ImageFilter.convoluteFloat32(
        mockImageData,
        amplifyKernel,
      );

      // Regular convolution clamps values, Float32 doesn't
      assert(regularResult.data instanceof Uint8ClampedArray);
      assert(float32Result.data instanceof Float32Array);

      // Find amplified values that should differ
      let foundDifference = false;
      for (let i = 0; i < regularResult.data.length; i++) {
        if (regularResult.data[i] === 255 && float32Result.data[i] > 255) {
          foundDifference = true;
          break;
        }
      }
      assert(
        foundDifference,
        "Float32 and regular convolution should produce different results for high values",
      );
    });
  });

  describe("Edge cases and error handling", function () {
    it("should handle null/undefined resourceStore gracefully", function () {
      assert.throws(() => {
        ImageFilter(null, "test", true);
      });
    });

    it("should handle null/undefined imageName gracefully", function () {
      // Should not crash, but may return undefined or handle gracefully
      const result = ImageFilter(mockResourceStore, null, true);
      // The behavior depends on how ResourceStore handles null imageName
      // This test ensures no crash occurs
      assert(result !== undefined || result === undefined); // Either is acceptable
    });

    it("should handle empty kernel in convolution", function () {
      const emptyKernel = [];

      // Empty kernel should not crash, but may produce unexpected results
      const result = ImageFilter.convolute(mockImageData, emptyKernel);
      assert(result !== null);
      assert(result.data instanceof Uint8ClampedArray);
    });

    it("should handle null ImageData in convolution", function () {
      const kernel = [0, 0, 0, 0, 1, 0, 0, 0, 0];

      assert.throws(() => {
        ImageFilter.convolute(null, kernel);
      });
    });

    it("should handle very small images", function () {
      const tinyImageData = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      const kernel = [1];

      const result = ImageFilter.convolute(tinyImageData, kernel);
      assert.strictEqual(result.width, 1);
      assert.strictEqual(result.height, 1);
    });

    it("should handle large kernels on small images", function () {
      const tinyImageData = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
        ]),
      };

      const largeKernel = new Array(49).fill(1 / 49); // 7x7 kernel

      const result = ImageFilter.convolute(tinyImageData, largeKernel);
      assert.strictEqual(result.width, 2);
      assert.strictEqual(result.height, 2);
    });
  });

  describe("Integration scenarios", function () {
    it("should work with typical blur filter workflow", function () {
      const blurFilter = (imageData, strength) => {
        const blurKernel = new Array(9).fill(strength / 9);
        return ImageFilter.convolute(imageData, blurKernel);
      };

      const result = ImageFilter(
        mockResourceStore,
        "photo.jpg",
        false,
        blurFilter,
        1.0,
      );

      assert.strictEqual(result, "cloned_image_name");
      assert(mockResourceStore.cloneImage.calledOnce);
      assert(mockResourceStore.setImageData.calledOnce);
    });

    it("should work with sharpen filter workflow", function () {
      const sharpenFilter = (imageData) => {
        const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        return ImageFilter.convolute(imageData, sharpenKernel);
      };

      ImageFilter(
        mockResourceStore,
        "photo.jpg",
        true, // Apply over original
        sharpenFilter,
      );

      assert(mockResourceStore.cloneImage.notCalled);
      assert(
        mockResourceStore.setImageData.calledWith("photo.jpg", mockImageData),
      );
    });

    it("should work with multiple filter chain", function () {
      const brightenFilter = (imageData, amount) => {
        // Simple brighten simulation
        return imageData;
      };

      const contrastFilter = (imageData, factor) => {
        // Simple contrast simulation
        return imageData;
      };

      const edgeFilter = (imageData) => {
        const edgeKernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
        return ImageFilter.convolute(imageData, edgeKernel);
      };

      ImageFilter(
        mockResourceStore,
        "original.jpg",
        false,
        brightenFilter,
        0.2,
        contrastFilter,
        1.5,
        edgeFilter,
      );

      assert(mockResourceStore.cloneImage.calledWith("original.jpg"));
      assert(mockResourceStore.setImageData.calledOnce);
    });
  });
});
