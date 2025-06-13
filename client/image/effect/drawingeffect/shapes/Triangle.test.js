import { strict as assert } from "assert";
import sinon from "sinon";
import { Triangle } from "./Triangle.js";

describe("Triangle", function () {
  let mockContext;
  let mockCanvas;

  beforeEach(function () {
    mockCanvas = {
      width: 100,
      height: 80,
    };

    mockContext = {
      canvas: mockCanvas,
      beginPath: sinon.spy(),
      moveTo: sinon.spy(),
      lineTo: sinon.spy(),
      lineWidth: 0,
    };
  });

  it("should draw a triangle path", function () {
    Triangle(mockContext);

    assert(mockContext.beginPath.calledOnce);
    assert(mockContext.moveTo.calledOnce);
    assert.strictEqual(mockContext.lineTo.callCount, 3);
  });

  it("should set line width to 2", function () {
    Triangle(mockContext);
    assert.strictEqual(mockContext.lineWidth, 2);
  });

  it("should create right-pointing triangle", function () {
    Triangle(mockContext);

    // Check moveTo (top left)
    const moveToCall = mockContext.moveTo.getCall(0);
    assert.strictEqual(moveToCall.args[0], 0); // x = 0
    assert.strictEqual(moveToCall.args[1], 0); // y = 0

    const lineToCalls = mockContext.lineTo.getCalls();

    // First lineTo: bottom left
    assert.strictEqual(lineToCalls[0].args[0], 0); // x = 0
    assert.strictEqual(lineToCalls[0].args[1], 80); // y = height

    // Second lineTo: right center
    assert.strictEqual(lineToCalls[1].args[0], 100); // x = width
    assert.strictEqual(lineToCalls[1].args[1], 40); // y = height/2

    // Third lineTo: back to top left (closing path)
    assert.strictEqual(lineToCalls[2].args[0], 0); // x = 0
    assert.strictEqual(lineToCalls[2].args[1], 0); // y = 0
  });

  it("should adapt to different canvas sizes", function () {
    mockContext.canvas.width = 200;
    mockContext.canvas.height = 150;

    Triangle(mockContext);

    const lineToCalls = mockContext.lineTo.getCalls();

    // Bottom left should use new height
    assert.strictEqual(lineToCalls[0].args[1], 150); // y = height

    // Right center should use new dimensions
    assert.strictEqual(lineToCalls[1].args[0], 200); // x = width
    assert.strictEqual(lineToCalls[1].args[1], 75); // y = height/2
  });

  it("should create a proper triangle shape", function () {
    Triangle(mockContext);

    const moveToCall = mockContext.moveTo.getCall(0);
    const lineToCalls = mockContext.lineTo.getCalls();

    // Verify the triangle has three distinct points
    const topLeft = [moveToCall.args[0], moveToCall.args[1]];
    const bottomLeft = [lineToCalls[0].args[0], lineToCalls[0].args[1]];
    const rightCenter = [lineToCalls[1].args[0], lineToCalls[1].args[1]];
    const backToStart = [lineToCalls[2].args[0], lineToCalls[2].args[1]];

    // Top left and bottom left share same x coordinate (left edge)
    assert.strictEqual(topLeft[0], bottomLeft[0]);

    // Bottom left and right center share same y level difference
    assert.strictEqual(rightCenter[1], (topLeft[1] + bottomLeft[1]) / 2);

    // Path should close back to start
    assert.strictEqual(backToStart[0], topLeft[0]);
    assert.strictEqual(backToStart[1], topLeft[1]);
  });

  it("should handle square canvas", function () {
    mockContext.canvas.width = 100;
    mockContext.canvas.height = 100;

    Triangle(mockContext);

    const lineToCalls = mockContext.lineTo.getCalls();

    // Right center should be at middle of square
    assert.strictEqual(lineToCalls[1].args[0], 100); // x = width
    assert.strictEqual(lineToCalls[1].args[1], 50); // y = height/2
  });
});
