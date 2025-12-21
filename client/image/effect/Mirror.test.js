import { strict as assert } from 'assert';
import sinon from 'sinon';
import { Mirror } from './Mirror.js';

// Mock Assert if not available
global.Assert = global.Assert || {
  assert: (cond, msg) => {
    if (!cond) throw new Error(msg);
  },
};

// Mock document.createElement
global.document = global.document || {
  createElement: sinon.stub(),
};

describe('Mirror', function () {
  let mockContext;
  let mockCanvas;
  let mockTmpCanvas;
  let mockTmpContext;

  beforeEach(function () {
    mockCanvas = {
      width: 100,
      height: 80,
    };

    mockTmpContext = {
      save: sinon.spy(),
      scale: sinon.spy(),
      drawImage: sinon.spy(),
    };

    mockTmpCanvas = {
      width: 0,
      height: 0,
      getContext: sinon.stub().returns(mockTmpContext),
    };

    mockContext = {
      canvas: mockCanvas,
      clearRect: sinon.spy(),
      drawImage: sinon.spy(),
    };

    global.document.createElement = sinon.stub().returns(mockTmpCanvas);
  });

  describe('Parameter validation', function () {
    it('should throw error when no parameters provided', function () {
      assert.throws(() => {
        Mirror(mockContext);
      }, /Mirror Effect error: invalid parameters configuration/);
    });

    it('should throw error when parameters object is undefined', function () {
      assert.throws(() => {
        Mirror(mockContext, undefined);
      }, /Mirror Effect error: invalid parameters configuration/);
    });

    it('should throw error when neither horizontal nor vertical is defined', function () {
      assert.throws(() => {
        Mirror(mockContext, {});
      }, /Mirror Effect error: invalid parameters configuration/);
    });

    it('should accept parameters with horizontal defined', function () {
      assert.doesNotThrow(() => {
        Mirror(mockContext, { horizontal: true });
      });
    });

    it('should accept parameters with vertical defined', function () {
      assert.doesNotThrow(() => {
        Mirror(mockContext, { vertical: true });
      });
    });

    it('should accept parameters with both horizontal and vertical defined', function () {
      assert.doesNotThrow(() => {
        Mirror(mockContext, { horizontal: true, vertical: false });
      });
    });
  });

  describe('Canvas creation and setup', function () {
    it('should create temporary canvas with correct dimensions', function () {
      Mirror(mockContext, { horizontal: true });

      assert(global.document.createElement.calledWith('CANVAS'));
      assert.strictEqual(mockTmpCanvas.width, 100);
      assert.strictEqual(mockTmpCanvas.height, 80);
      assert(mockTmpCanvas.getContext.calledWith('2d'));
    });
  });

  describe('Horizontal mirroring', function () {
    it('should apply horizontal flip transformation', function () {
      Mirror(mockContext, { horizontal: true, vertical: false });

      assert(mockTmpContext.save.calledOnce);
      assert(mockTmpContext.scale.calledWith(-1, 1)); // Horizontal flip, no vertical flip
      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          -100, // -width
          0, // no Y offset
          100, // width
          80, // height
        ),
      );
    });

    it('should handle horizontal flip only', function () {
      Mirror(mockContext, { horizontal: true });

      assert(mockTmpContext.scale.calledWith(-1, 1));
      assert(mockTmpContext.drawImage.calledWith(mockCanvas, -100, 0, 100, 80));
    });
  });

  describe('Vertical mirroring', function () {
    it('should apply vertical flip transformation', function () {
      Mirror(mockContext, { horizontal: false, vertical: true });

      assert(mockTmpContext.save.calledOnce);
      assert(mockTmpContext.scale.calledWith(1, -1)); // No horizontal flip, vertical flip
      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          0, // no X offset
          -80, // -height
          100, // width
          80, // height
        ),
      );
    });

    it('should handle vertical flip only', function () {
      Mirror(mockContext, { vertical: true });

      assert(mockTmpContext.scale.calledWith(1, -1));
      assert(mockTmpContext.drawImage.calledWith(mockCanvas, 0, -80, 100, 80));
    });
  });

  describe('Both horizontal and vertical mirroring', function () {
    it('should apply both transformations', function () {
      Mirror(mockContext, { horizontal: true, vertical: true });

      assert(mockTmpContext.save.calledOnce);
      assert(mockTmpContext.scale.calledWith(-1, -1)); // Both flips
      assert(
        mockTmpContext.drawImage.calledWith(
          mockCanvas,
          -100, // -width
          -80, // -height
          100, // width
          80, // height
        ),
      );
    });
  });

  describe('Canvas manipulation', function () {
    it('should clear original canvas', function () {
      Mirror(mockContext, { horizontal: true });

      assert(mockContext.clearRect.calledWith(0, 0, 100, 80));
    });

    it('should draw flipped image back to original canvas', function () {
      Mirror(mockContext, { horizontal: true });

      assert(mockContext.drawImage.calledWith(mockTmpCanvas, 0, 0));
    });

    it('should perform operations in correct order', function () {
      Mirror(mockContext, { horizontal: true });

      // Should save, scale, draw to temp, clear original, then draw back
      assert(mockTmpContext.save.calledBefore(mockTmpContext.scale));
      assert(mockTmpContext.scale.calledBefore(mockTmpContext.drawImage));
      assert(mockTmpContext.drawImage.calledBefore(mockContext.clearRect));
      assert(mockContext.clearRect.calledBefore(mockContext.drawImage));
    });
  });

  describe('Different canvas sizes', function () {
    it('should handle different canvas dimensions', function () {
      mockCanvas.width = 200;
      mockCanvas.height = 150;

      Mirror(mockContext, { horizontal: true, vertical: true });

      assert.strictEqual(mockTmpCanvas.width, 200);
      assert.strictEqual(mockTmpCanvas.height, 150);
      assert(
        mockTmpContext.drawImage.calledWith(mockCanvas, -200, -150, 200, 150),
      );
      assert(mockContext.clearRect.calledWith(0, 0, 200, 150));
    });

    it('should handle square canvas', function () {
      mockCanvas.width = 100;
      mockCanvas.height = 100;

      Mirror(mockContext, { horizontal: true });

      assert.strictEqual(mockTmpCanvas.width, 100);
      assert.strictEqual(mockTmpCanvas.height, 100);
      assert(
        mockTmpContext.drawImage.calledWith(mockCanvas, -100, 0, 100, 100),
      );
    });
  });

  describe('Edge cases', function () {
    it('should handle false values correctly', function () {
      Mirror(mockContext, { horizontal: false, vertical: false });

      assert(mockTmpContext.scale.calledWith(1, 1)); // No flipping
      assert(mockTmpContext.drawImage.calledWith(mockCanvas, 0, 0, 100, 80));
    });

    it('should handle undefined horizontal with defined vertical', function () {
      Mirror(mockContext, { vertical: true });

      assert(mockTmpContext.scale.calledWith(1, -1));
    });

    it('should handle undefined vertical with defined horizontal', function () {
      Mirror(mockContext, { horizontal: true });

      assert(mockTmpContext.scale.calledWith(-1, 1));
    });

    it('should handle very small canvas', function () {
      mockCanvas.width = 1;
      mockCanvas.height = 1;

      Mirror(mockContext, { horizontal: true, vertical: true });

      assert.strictEqual(mockTmpCanvas.width, 1);
      assert.strictEqual(mockTmpCanvas.height, 1);
      assert(mockTmpContext.drawImage.calledWith(mockCanvas, -1, -1, 1, 1));
    });
  });
});
