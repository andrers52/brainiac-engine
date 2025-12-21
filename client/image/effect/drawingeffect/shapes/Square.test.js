import { strict as assert } from 'assert';
import sinon from 'sinon';
import { Square } from './Square.js';

describe('Square', function () {
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
      lineWidth: 0,
    };
  });

  it('should draw a square', function () {
    Square(mockContext);

    assert(mockContext.beginPath.calledOnce);
    assert(mockContext.rect.calledOnce);
  });

  it('should set line width to 2', function () {
    Square(mockContext);
    assert.strictEqual(mockContext.lineWidth, 2);
  });

  it('should draw square with correct dimensions', function () {
    Square(mockContext);

    const rectCall = mockContext.rect.getCall(0);
    const lineWidth = 2;
    const size = (100 + 100) / 2; // average of width and height = 100

    assert.strictEqual(rectCall.args[0], lineWidth); // x = 2
    assert.strictEqual(rectCall.args[1], lineWidth); // y = 2
    assert.strictEqual(rectCall.args[2], size - lineWidth * 2); // width = 96
    assert.strictEqual(rectCall.args[3], size - lineWidth * 2); // height = 96
  });

  it('should calculate size as average of canvas dimensions', function () {
    mockContext.canvas.width = 120;
    mockContext.canvas.height = 80;

    Square(mockContext);

    const rectCall = mockContext.rect.getCall(0);
    const lineWidth = 2;
    const size = (120 + 80) / 2; // = 100

    assert.strictEqual(rectCall.args[2], size - lineWidth * 2); // width = 96
    assert.strictEqual(rectCall.args[3], size - lineWidth * 2); // height = 96
  });

  it('should account for line width in positioning', function () {
    Square(mockContext);

    const rectCall = mockContext.rect.getCall(0);
    const lineWidth = 2;

    // Should be offset by lineWidth to avoid clipping
    assert.strictEqual(rectCall.args[0], lineWidth);
    assert.strictEqual(rectCall.args[1], lineWidth);
  });

  it('should handle very small canvas', function () {
    mockContext.canvas.width = 10;
    mockContext.canvas.height = 10;

    Square(mockContext);

    const rectCall = mockContext.rect.getCall(0);
    const lineWidth = 2;
    const size = (10 + 10) / 2; // = 10

    assert.strictEqual(rectCall.args[2], size - lineWidth * 2); // width = 6
    assert.strictEqual(rectCall.args[3], size - lineWidth * 2); // height = 6
  });
});
