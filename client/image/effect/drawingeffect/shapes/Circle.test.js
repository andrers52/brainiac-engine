import { strict as assert } from "assert";
import sinon from "sinon";
import { Circle } from "./Circle.js";

describe("Circle", function () {
  let mockContext;
  let mockCanvas;

  beforeEach(function () {
    mockCanvas = {
      width: 100,
      height: 100,
    };

    mockContext = {
      canvas: mockCanvas,
      beginPath: sinon.spy(),
      arc: sinon.spy(),
      closePath: sinon.spy(),
      lineWidth: 0,
    };
  });

  it("should draw a circle centered on the canvas", function () {
    Circle(mockContext);

    assert(mockContext.beginPath.calledOnce);
    assert(mockContext.arc.calledOnce);
    assert(mockContext.closePath.calledOnce);

    // Check arc parameters: x, y, radius, startAngle, endAngle
    const arcCall = mockContext.arc.getCall(0);
    assert.strictEqual(arcCall.args[0], 50); // center x
    assert.strictEqual(arcCall.args[1], 50); // center y
    assert.strictEqual(arcCall.args[2], 48); // radius (50 - 2 lineWidth)
    assert.strictEqual(arcCall.args[3], 0); // start angle
    assert.strictEqual(arcCall.args[4], 2 * Math.PI); // end angle
  });

  it("should set line width to 2", function () {
    Circle(mockContext);
    assert.strictEqual(mockContext.lineWidth, 2);
  });

  it("should adjust radius based on canvas dimensions", function () {
    mockContext.canvas.width = 80;
    mockContext.canvas.height = 120;

    Circle(mockContext);

    const arcCall = mockContext.arc.getCall(0);
    // Should use smaller dimension (80) and subtract lineWidth (2)
    assert.strictEqual(arcCall.args[2], 38); // (80/2) - 2
  });

  it("should center circle on non-square canvas", function () {
    mockContext.canvas.width = 80;
    mockContext.canvas.height = 120;

    Circle(mockContext);

    const arcCall = mockContext.arc.getCall(0);
    assert.strictEqual(arcCall.args[0], 40); // width/2
    assert.strictEqual(arcCall.args[1], 60); // height/2
  });
});
