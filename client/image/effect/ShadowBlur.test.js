import { strict as assert } from "assert";
import sinon from "sinon";
import { ShadowBlur } from "./ShadowBlur.js";

describe("ShadowBlur", function () {
  let mockContext;
  let mockCanvas;
  let mockTmpCanvas;
  let mockTmpContext;
  let originalCreateElement;

  beforeEach(function () {
    mockCanvas = {
      width: 200,
      height: 150,
    };

    mockTmpCanvas = {
      width: 0,
      height: 0,
      getContext: sinon.stub(),
    };

    mockTmpContext = {
      scale: sinon.spy(),
      drawImage: sinon.spy(),
    };

    mockContext = {
      canvas: mockCanvas,
      shadowBlur: 0,
      shadowColor: "",
      clearRect: sinon.spy(),
      drawImage: sinon.spy(),
    };

    // Mock document.createElement
    originalCreateElement = global.document?.createElement;
    global.document = global.document || {};
    global.document.createElement = sinon.stub().returns(mockTmpCanvas);
    mockTmpCanvas.getContext.returns(mockTmpContext);
  });

  afterEach(function () {
    if (originalCreateElement) {
      global.document.createElement = originalCreateElement;
    } else if (global.document) {
      delete global.document.createElement;
    }
  });

  describe("Canvas creation and setup", function () {
    it("should create temporary canvas with correct dimensions", function () {
      const parameters = {
        thickness: 10,
        color: "#ff0000",
      };

      ShadowBlur(mockContext, parameters);

      assert(global.document.createElement.calledWith("canvas"));
      assert.strictEqual(mockTmpCanvas.width, 200);
      assert.strictEqual(mockTmpCanvas.height, 150);
      assert(mockTmpCanvas.getContext.calledWith("2d"));
    });
  });

  describe("Shadow configuration", function () {
    it("should set shadow properties correctly", function () {
      const parameters = {
        thickness: 15,
        color: "#0000ff",
      };

      ShadowBlur(mockContext, parameters);

      assert.strictEqual(mockContext.shadowBlur, 15);
      assert.strictEqual(mockContext.shadowColor, "#0000ff");
    });

    it("should handle zero thickness", function () {
      const parameters = {
        thickness: 0,
        color: "#ff0000",
      };

      ShadowBlur(mockContext, parameters);

      assert.strictEqual(mockContext.shadowBlur, 0);
      assert.strictEqual(mockContext.shadowColor, "#ff0000");
    });

    it("should handle different color formats", function () {
      const parameters = {
        thickness: 5,
        color: "rgba(255, 0, 0, 0.5)",
      };

      ShadowBlur(mockContext, parameters);

      assert.strictEqual(mockContext.shadowColor, "rgba(255, 0, 0, 0.5)");
    });
  });

  describe("Image scaling and positioning", function () {
    it("should scale temporary context by 0.9", function () {
      const parameters = {
        thickness: 10,
        color: "#ff0000",
      };

      ShadowBlur(mockContext, parameters);

      assert(mockTmpContext.scale.calledOnce);
      assert(mockTmpContext.scale.calledWith(0.9, 0.9));
    });

    it("should draw image with correct offset", function () {
      const parameters = {
        thickness: 10,
        color: "#ff0000",
      };

      ShadowBlur(mockContext, parameters);

      // Calculate expected offset: (dimension - dimension * 0.9) / 2
      const expectedOffsetX = (200 - 200 * 0.9) / 2; // 10
      const expectedOffsetY = (150 - 150 * 0.9) / 2; // 7.5

      assert(mockTmpContext.drawImage.calledOnce);
      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          expectedOffsetX,
          expectedOffsetY,
        ),
      );
    });
  });

  describe("Canvas clearing and final drawing", function () {
    it("should clear the original canvas", function () {
      const parameters = {
        thickness: 10,
        color: "#ff0000",
      };

      ShadowBlur(mockContext, parameters);

      assert(mockContext.clearRect.calledOnce);
      assert(mockContext.clearRect.calledWith(0, 0, 200, 150));
    });

    it("should draw the shadowed image back to original canvas", function () {
      const parameters = {
        thickness: 10,
        color: "#ff0000",
      };

      ShadowBlur(mockContext, parameters);

      assert(mockContext.drawImage.calledOnce);
      assert(mockContext.drawImage.calledWith(mockTmpCanvas, 0, 0));
    });

    it("should perform operations in correct order", function () {
      const parameters = {
        thickness: 10,
        color: "#ff0000",
      };

      ShadowBlur(mockContext, parameters);

      // Verify order of operations
      sinon.assert.callOrder(
        mockTmpContext.scale,
        mockTmpContext.drawImage,
        mockContext.clearRect,
        mockContext.drawImage,
      );
    });
  });

  describe("Edge cases", function () {
    it("should handle very small canvas", function () {
      mockCanvas.width = 10;
      mockCanvas.height = 8;

      const parameters = {
        thickness: 2,
        color: "#ff0000",
      };

      ShadowBlur(mockContext, parameters);

      assert.strictEqual(mockTmpCanvas.width, 10);
      assert.strictEqual(mockTmpCanvas.height, 8);

      const expectedOffsetX = (10 - 10 * 0.9) / 2; // 0.5
      const expectedOffsetY = (8 - 8 * 0.9) / 2; // 0.4

      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          expectedOffsetX,
          expectedOffsetY,
        ),
      );
    });

    it("should handle square canvas", function () {
      mockCanvas.width = 100;
      mockCanvas.height = 100;

      const parameters = {
        thickness: 5,
        color: "#00ff00",
      };

      ShadowBlur(mockContext, parameters);

      const expectedOffset = (100 - 100 * 0.9) / 2; // 5

      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          expectedOffset,
          expectedOffset,
        ),
      );
    });

    it("should handle missing parameters gracefully", function () {
      const parameters = {};

      // Should not throw
      assert.doesNotThrow(() => {
        ShadowBlur(mockContext, parameters);
      });

      assert.strictEqual(mockContext.shadowBlur, undefined);
      assert.strictEqual(mockContext.shadowColor, undefined);
    });

    it("should handle null parameters", function () {
      assert.doesNotThrow(() => {
        ShadowBlur(mockContext, null);
      });

      // Should return early without creating canvas or setting properties
      assert(global.document.createElement.notCalled);
      assert.strictEqual(mockContext.shadowBlur, 0); // unchanged
      assert.strictEqual(mockContext.shadowColor, ""); // unchanged
    });
  });

  describe("Different canvas dimensions", function () {
    it("should handle wide canvas correctly", function () {
      mockCanvas.width = 400;
      mockCanvas.height = 100;

      const parameters = {
        thickness: 8,
        color: "#ff00ff",
      };

      ShadowBlur(mockContext, parameters);

      assert.strictEqual(mockTmpCanvas.width, 400);
      assert.strictEqual(mockTmpCanvas.height, 100);

      const expectedOffsetX = (400 - 400 * 0.9) / 2; // 20
      const expectedOffsetY = (100 - 100 * 0.9) / 2; // 5

      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          expectedOffsetX,
          expectedOffsetY,
        ),
      );
    });

    it("should handle tall canvas correctly", function () {
      mockCanvas.width = 100;
      mockCanvas.height = 400;

      const parameters = {
        thickness: 12,
        color: "#00ffff",
      };

      ShadowBlur(mockContext, parameters);

      assert.strictEqual(mockTmpCanvas.width, 100);
      assert.strictEqual(mockTmpCanvas.height, 400);

      const expectedOffsetX = (100 - 100 * 0.9) / 2; // 5
      const expectedOffsetY = (400 - 400 * 0.9) / 2; // 20

      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          expectedOffsetX,
          expectedOffsetY,
        ),
      );
    });
  });

  describe("Scale factor validation", function () {
    it("should always use 0.9 scale factor", function () {
      const parameters = {
        thickness: 20,
        color: "#000000",
      };

      ShadowBlur(mockContext, parameters);

      // Verify the scale is exactly 0.9
      assert(mockTmpContext.scale.calledWith(0.9, 0.9));
    });

    it("should calculate offsets based on 0.9 scale", function () {
      mockCanvas.width = 50;
      mockCanvas.height = 30;

      const parameters = {
        thickness: 3,
        color: "#ffffff",
      };

      ShadowBlur(mockContext, parameters);

      // Manual calculation: (dimension - dimension * 0.9) / 2
      const expectedOffsetX = (50 - 50 * 0.9) / 2; // 2.5
      const expectedOffsetY = (30 - 30 * 0.9) / 2; // 1.5

      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          expectedOffsetX,
          expectedOffsetY,
        ),
      );
    });
  });
});
