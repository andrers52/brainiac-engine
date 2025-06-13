import { strict as assert } from "assert";
import sinon from "sinon";
import { RadialGradient } from "./RadialGradient.js";

describe("RadialGradient", function () {
  let mockContext;
  let mockCanvas;
  let mockGradient;

  beforeEach(function () {
    mockCanvas = {
      width: 200,
      height: 150,
    };

    mockGradient = {
      addColorStop: sinon.spy(),
    };

    mockContext = {
      canvas: mockCanvas,
      createRadialGradient: sinon.stub().returns(mockGradient),
      beginPath: sinon.spy(),
      arc: sinon.spy(),
      closePath: sinon.spy(),
      fillRect: sinon.spy(),
      fill: sinon.spy(),
      stroke: sinon.spy(),
      fillStyle: "",
      strokeStyle: "",
      globalCompositeOperation: "source-over",
    };
  });

  describe("Gradient creation", function () {
    it("should create radial gradient with correct center and radius for fillRect", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: true,
        combineOption: "multiply",
      };

      RadialGradient(mockContext, parameters);

      // Should create gradient from center with radius being minimum of width/height
      assert(mockContext.createRadialGradient.calledOnce);
      const call = mockContext.createRadialGradient.getCall(0);
      assert.strictEqual(call.args[0], 100); // centerX = width / 2
      assert.strictEqual(call.args[1], 75); // centerY = height / 2
      assert.strictEqual(call.args[2], 0); // inner radius
      assert.strictEqual(call.args[3], 100); // outer centerX
      assert.strictEqual(call.args[4], 75); // outer centerY
      assert.strictEqual(call.args[5], 150); // outer radius = min(width, height)
    });

    it("should create radial gradient with correct radius for circle mode", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: false,
        combineOption: "overlay",
      };

      RadialGradient(mockContext, parameters);

      // Should create gradient with radius being min(width/2, height/2)
      assert(mockContext.createRadialGradient.calledOnce);
      const call = mockContext.createRadialGradient.getCall(0);
      assert.strictEqual(call.args[5], 75); // outer radius = min(width/2, height/2)
    });

    it("should add color stops correctly", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: true,
      };

      RadialGradient(mockContext, parameters);

      assert(mockGradient.addColorStop.calledTwice);
      assert(mockGradient.addColorStop.calledWith(0, "#ff0000"));
      assert(mockGradient.addColorStop.calledWith(1, "#0000ff"));
    });
  });

  describe("Composite operation", function () {
    it("should set global composite operation when provided", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        combineOption: "multiply",
        fillRect: true,
      };

      RadialGradient(mockContext, parameters);

      assert.strictEqual(mockContext.globalCompositeOperation, "multiply");
    });

    it("should handle undefined combine option", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: true,
      };

      RadialGradient(mockContext, parameters);

      assert.strictEqual(mockContext.globalCompositeOperation, undefined);
    });
  });

  describe("Fill rectangle mode", function () {
    it("should fill entire rectangle when fillRect is true", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: true,
      };

      RadialGradient(mockContext, parameters);

      assert(mockContext.fillRect.calledOnce);
      assert(mockContext.fillRect.calledWith(0, 0, 200, 150));

      // Should not draw circle
      assert(mockContext.beginPath.notCalled);
      assert(mockContext.arc.notCalled);
      assert(mockContext.fill.notCalled);
      assert(mockContext.stroke.notCalled);
    });
  });

  describe("Circle mode", function () {
    it("should draw circle when fillRect is false", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: false,
      };

      RadialGradient(mockContext, parameters);

      assert(mockContext.beginPath.calledOnce);
      assert(mockContext.arc.calledOnce);
      assert(mockContext.closePath.calledOnce);
      assert(mockContext.fill.calledOnce);
      assert(mockContext.stroke.calledOnce);

      // Should not fill rectangle
      assert(mockContext.fillRect.notCalled);
    });

    it("should draw circle with correct parameters", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: false,
      };

      RadialGradient(mockContext, parameters);

      assert(
        mockContext.arc.calledWith(
          100, // centerX = width / 2
          75, // centerY = height / 2
          75, // radius = min(width/2, height/2)
          0,
          Math.PI * 2,
        ),
      );
    });

    it("should set stroke style to black", function () {
      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: false,
      };

      RadialGradient(mockContext, parameters);

      assert.strictEqual(mockContext.strokeStyle, "black");
      assert.strictEqual(mockContext.fillStyle, mockGradient);
    });
  });

  describe("Edge cases", function () {
    it("should handle square canvas correctly", function () {
      mockCanvas.width = 100;
      mockCanvas.height = 100;

      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: false,
      };

      RadialGradient(mockContext, parameters);

      // For square canvas, both width/2 and height/2 are 50
      const gradientCall = mockContext.createRadialGradient.getCall(0);
      assert.strictEqual(gradientCall.args[5], 50); // radius should be 50

      const arcCall = mockContext.arc.getCall(0);
      assert.strictEqual(arcCall.args[2], 50); // arc radius should be 50
    });

    it("should handle very small canvas", function () {
      mockCanvas.width = 10;
      mockCanvas.height = 5;

      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: true,
      };

      RadialGradient(mockContext, parameters);

      const gradientCall = mockContext.createRadialGradient.getCall(0);
      assert.strictEqual(gradientCall.args[5], 5); // radius should be min(10, 5) = 5
    });

    it("should handle missing parameters gracefully", function () {
      const parameters = {};

      // Should not throw
      assert.doesNotThrow(() => {
        RadialGradient(mockContext, parameters);
      });

      assert(mockContext.createRadialGradient.calledOnce);
      assert(mockGradient.addColorStop.calledTwice);
      assert(mockGradient.addColorStop.calledWith(0, undefined));
      assert(mockGradient.addColorStop.calledWith(1, undefined));
    });

    it("should handle null parameters", function () {
      assert.doesNotThrow(() => {
        RadialGradient(mockContext, null);
      });

      // Should return early without calling any context methods
      assert(mockContext.createRadialGradient.notCalled);
      assert(mockGradient.addColorStop.notCalled);
    });
  });

  describe("Different canvas dimensions", function () {
    it("should handle wide canvas correctly", function () {
      mockCanvas.width = 300;
      mockCanvas.height = 100;

      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: false,
      };

      RadialGradient(mockContext, parameters);

      // Circle mode: radius should be min(width/2, height/2) = min(150, 50) = 50
      const arcCall = mockContext.arc.getCall(0);
      assert.strictEqual(arcCall.args[0], 150); // centerX = 300/2
      assert.strictEqual(arcCall.args[1], 50); // centerY = 100/2
      assert.strictEqual(arcCall.args[2], 50); // radius = min(150, 50)
    });

    it("should handle tall canvas correctly", function () {
      mockCanvas.width = 100;
      mockCanvas.height = 300;

      const parameters = {
        startColor: "#ff0000",
        endColor: "#0000ff",
        fillRect: true,
      };

      RadialGradient(mockContext, parameters);

      // FillRect mode: radius should be min(width, height) = min(100, 300) = 100
      const gradientCall = mockContext.createRadialGradient.getCall(0);
      assert.strictEqual(gradientCall.args[5], 100); // outer radius
    });
  });
});
