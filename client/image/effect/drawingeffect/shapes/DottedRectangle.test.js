import { strict as assert } from "assert";
import sinon from "sinon";
import { DottedRectangle } from "./DottedRectangle.js";

describe("DottedRectangle", function () {
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
      rect: sinon.spy(),
      stroke: sinon.spy(),
      lineWidth: 0,
      fillStyle: "",
      strokeStyle: "",
    };
  });

  it("should draw a rectangle border", function () {
    DottedRectangle(mockContext);

    assert(mockContext.beginPath.calledOnce);
    assert(mockContext.rect.called);
    assert(mockContext.stroke.calledOnce);

    // Check first rect call (the border)
    const firstRectCall = mockContext.rect.getCall(0);
    assert.strictEqual(firstRectCall.args[0], 0); // x
    assert.strictEqual(firstRectCall.args[1], 0); // y
    assert.strictEqual(firstRectCall.args[2], 100); // width
    assert.strictEqual(firstRectCall.args[3], 100); // height
  });

  it("should set correct styles", function () {
    DottedRectangle(mockContext);

    assert.strictEqual(mockContext.fillStyle, "black");
    assert.strictEqual(mockContext.strokeStyle, "grey");
  });

  it("should set line widths correctly", function () {
    DottedRectangle(mockContext);

    // Should end with lineWidth = 1 for dots
    assert.strictEqual(mockContext.lineWidth, 1);
  });

  it("should draw a 20x20 grid of dots", function () {
    DottedRectangle(mockContext);

    // Should have 1 border rect + 400 dot rects (20x20)
    assert.strictEqual(mockContext.rect.callCount, 401);

    // Check some dot positions
    const dotCalls = mockContext.rect.getCalls().slice(1); // Skip border rect

    // First dot should be at (0, 0)
    assert.strictEqual(dotCalls[0].args[0], 0);
    assert.strictEqual(dotCalls[0].args[1], 0);
    assert.strictEqual(dotCalls[0].args[2], 1); // dot width
    assert.strictEqual(dotCalls[0].args[3], 1); // dot height

    // Check dot spacing (canvas width / numDotsPerWidth = 100/20 = 5)
    assert.strictEqual(dotCalls[1].args[0], 0); // x still 0
    assert.strictEqual(dotCalls[1].args[1], 5); // y = 5

    assert.strictEqual(dotCalls[20].args[0], 5); // next column x = 5
    assert.strictEqual(dotCalls[20].args[1], 0); // y back to 0
  });

  it("should adapt to different canvas sizes", function () {
    mockContext.canvas.width = 200;
    mockContext.canvas.height = 150;

    DottedRectangle(mockContext);

    // Border should match canvas size
    const borderRect = mockContext.rect.getCall(0);
    assert.strictEqual(borderRect.args[2], 200); // width
    assert.strictEqual(borderRect.args[3], 150); // height

    // Dot spacing should adapt: 200/20=10 for width, 150/20=7.5 for height
    const dotCalls = mockContext.rect.getCalls().slice(1);
    assert.strictEqual(dotCalls[1].args[1], 7.5); // y spacing
    assert.strictEqual(dotCalls[20].args[0], 10); // x spacing
  });
});
