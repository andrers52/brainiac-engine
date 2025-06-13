import { strict as assert } from "assert";
import sinon from "sinon";
import { Star } from "./Star.js";

describe("Star", function () {
  let mockContext;
  let mockCanvas;

  beforeEach(function () {
    mockCanvas = {
      width: 100,
      height: 100,
    };

    mockContext = {
      canvas: mockCanvas,
      save: sinon.spy(),
      restore: sinon.spy(),
      beginPath: sinon.spy(),
      translate: sinon.spy(),
      moveTo: sinon.spy(),
      lineTo: sinon.spy(),
      rotate: sinon.spy(),
      lineWidth: 0,
    };
  });

  it("should save and restore context", function () {
    Star(mockContext);

    assert(mockContext.save.calledOnce);
    assert(mockContext.restore.calledOnce);
  });

  it("should begin path and set line width", function () {
    Star(mockContext);

    assert(mockContext.beginPath.calledOnce);
    assert.strictEqual(mockContext.lineWidth, 2);
  });

  it("should translate to center of canvas", function () {
    Star(mockContext);

    assert(mockContext.translate.calledOnce);
    const translateCall = mockContext.translate.getCall(0);
    assert.strictEqual(translateCall.args[0], 50); // width/2
    assert.strictEqual(translateCall.args[1], 50); // height/2
  });

  it("should create a 5-pointed star", function () {
    Star(mockContext);

    // Should have 1 moveTo + 10 lineTo calls (2 per point for 5 points)
    assert(mockContext.moveTo.calledOnce);
    assert.strictEqual(mockContext.lineTo.callCount, 10);

    // Should have 10 rotate calls (2 per point for 5 points)
    assert.strictEqual(mockContext.rotate.callCount, 10);
  });

  it("should start at top point", function () {
    Star(mockContext);

    const moveToCall = mockContext.moveTo.getCall(0);
    assert.strictEqual(moveToCall.args[0], 0); // x = 0 (relative to center)
    assert.strictEqual(moveToCall.args[1], -48); // y = -(radius - lineWidth) = -(50-2)
  });

  it("should rotate by PI/5 for each step", function () {
    Star(mockContext);

    const rotateCalls = mockContext.rotate.getCalls();
    rotateCalls.forEach((call) => {
      assert.strictEqual(call.args[0], Math.PI / 5);
    });
  });

  it("should draw inward and outward points alternately", function () {
    Star(mockContext);

    const lineToCalls = mockContext.lineTo.getCalls();
    const radius = 48; // 50 - 2 (lineWidth)
    const insetRadius = radius * 0.5; // 24

    // Check pattern: inward point, outward point, inward point, etc.
    for (let i = 0; i < 10; i += 2) {
      // Inward points (odd indices in the drawing logic)
      assert.strictEqual(lineToCalls[i].args[0], 0);
      assert.strictEqual(lineToCalls[i].args[1], -insetRadius);

      // Outward points (even indices in the drawing logic)
      assert.strictEqual(lineToCalls[i + 1].args[0], 0);
      assert.strictEqual(lineToCalls[i + 1].args[1], -radius);
    }
  });

  it("should adapt to different canvas sizes", function () {
    mockContext.canvas.width = 200;
    mockContext.canvas.height = 150;

    Star(mockContext);

    // Should translate to new center
    const translateCall = mockContext.translate.getCall(0);
    assert.strictEqual(translateCall.args[0], 100); // width/2
    assert.strictEqual(translateCall.args[1], 75); // height/2

    // Should use smaller dimension for radius
    const radius = Math.min(200, 150) / 2 - 2; // 73
    const moveToCall = mockContext.moveTo.getCall(0);
    assert.strictEqual(moveToCall.args[1], -radius);
  });

  it("should handle square canvas", function () {
    mockContext.canvas.width = 80;
    mockContext.canvas.height = 80;

    Star(mockContext);

    const radius = 80 / 2 - 2; // 38
    const moveToCall = mockContext.moveTo.getCall(0);
    assert.strictEqual(moveToCall.args[1], -radius);
  });
});
