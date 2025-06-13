import { strict as assert } from "assert";
import sinon from "sinon";
import { Ship } from "./Ship.js";

describe("Ship", function () {
  let mockContext;
  let mockCanvas;

  beforeEach(function () {
    mockCanvas = {
      width: 200,
      height: 100,
    };

    mockContext = {
      canvas: mockCanvas,
      beginPath: sinon.spy(),
      moveTo: sinon.spy(),
      lineTo: sinon.spy(),
      fill: sinon.spy(),
      stroke: sinon.spy(),
      lineWidth: 0,
      strokeStyle: "",
    };
  });

  it("should draw a ship shape with correct path", function () {
    Ship(mockContext);

    assert(mockContext.beginPath.calledOnce);
    assert(mockContext.moveTo.calledOnce);
    assert.strictEqual(mockContext.lineTo.callCount, 4);
    assert(mockContext.fill.calledOnce);
    assert(mockContext.stroke.calledOnce);
  });

  it("should set line width to 2", function () {
    Ship(mockContext);
    assert.strictEqual(mockContext.lineWidth, 2);
  });

  it("should set stroke style to yellow", function () {
    Ship(mockContext);
    assert.strictEqual(mockContext.strokeStyle, "yellow");
  });

  it("should create ship shape with correct coordinates", function () {
    Ship(mockContext);

    const padding = 30;

    // Check moveTo (top left)
    const moveToCall = mockContext.moveTo.getCall(0);
    assert.strictEqual(moveToCall.args[0], padding); // x = 30
    assert.strictEqual(moveToCall.args[1], padding); // y = 30

    // Check lineTo calls
    const lineToCalls = mockContext.lineTo.getCalls();

    // First lineTo: right center
    assert.strictEqual(lineToCalls[0].args[0], 200 - padding); // x = 170
    assert.strictEqual(lineToCalls[0].args[1], 50); // y = height/2

    // Second lineTo: bottom left
    assert.strictEqual(lineToCalls[1].args[0], padding); // x = 30
    assert.strictEqual(lineToCalls[1].args[1], 100 - padding); // y = 70

    // Third lineTo: inward center
    assert.strictEqual(lineToCalls[2].args[0], 200 / 4 + padding / 4); // x = 57.5
    assert.strictEqual(lineToCalls[2].args[1], 50); // y = 50

    // Fourth lineTo: back to top left (closing path)
    assert.strictEqual(lineToCalls[3].args[0], padding); // x = 30
    assert.strictEqual(lineToCalls[3].args[1], padding); // y = 30
  });

  it("should adapt to different canvas sizes", function () {
    mockContext.canvas.width = 400;
    mockContext.canvas.height = 200;

    Ship(mockContext);

    const padding = 30;
    const lineToCalls = mockContext.lineTo.getCalls();

    // Right center should adapt to new width
    assert.strictEqual(lineToCalls[0].args[0], 400 - padding); // x = 370
    assert.strictEqual(lineToCalls[0].args[1], 100); // y = height/2 = 100

    // Inward center should adapt
    assert.strictEqual(lineToCalls[2].args[0], 400 / 4 + padding / 4); // x = 107.5
    assert.strictEqual(lineToCalls[2].args[1], 100); // y = 100
  });
});
