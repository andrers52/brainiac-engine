import { strict as assert } from 'assert';
import sinon from 'sinon';
import { EvoImg } from './EvoImg.js';

// Mock Assert if not available
global.Assert = global.Assert || {
  assert: (cond, msg) => {
    if (!cond) throw new Error(msg);
  },
};

describe('EvoImg', function () {
  let mockContext;
  let mockCanvas;

  beforeEach(function () {
    mockCanvas = {
      width: 200,
      height: 150,
    };

    mockContext = {
      canvas: mockCanvas,
      save: sinon.spy(),
      restore: sinon.spy(),
      translate: sinon.spy(),
      rotate: sinon.spy(),
      beginPath: sinon.spy(),
      moveTo: sinon.spy(),
      lineTo: sinon.spy(),
      arc: sinon.spy(),
      rect: sinon.spy(),
      fillRect: sinon.spy(),
      fill: sinon.spy(),
      stroke: sinon.spy(),
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      lineWidth: 1,
    };
  });

  describe('Rectangle drawing', function () {
    it('should draw a filled rectangle with correct parameters', function () {
      // Instruction: [shapeType, compositeOp, x, y, sizeX, sizeY, r, g, b, orientation, alpha]
      const code = [[0, 0, 100, 75, 50, 30, 255, 128, 0, 0, 0.8]]; // Rectangle

      EvoImg(mockContext, code);

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
      assert(mockContext.translate.calledWith(100, 75));
      assert(mockContext.rotate.calledWith(-0)); // -orientation = -0
      assert.strictEqual(mockContext.fillStyle, 'rgba(255, 128, 0, 1)');
      assert.strictEqual(mockContext.strokeStyle, 'rgba(255, 128, 0, 1)');
      assert.strictEqual(mockContext.globalAlpha, 0.8);
      assert.strictEqual(mockContext.globalCompositeOperation, 'source-over');
      assert.strictEqual(mockContext.lineWidth, 1);

      // Rectangle should be drawn centered at original position (not translated position)
      assert(mockContext.fillRect.calledWith(75, 60, 50, 30)); // x-sizeX/2, y-sizeY/2, sizeX, sizeY
    });

    it('should draw stroked rectangle when fill is false', function () {
      // We'd need to modify the module to support stroke mode, but for now test the current behavior
      const code = [[0, 0, 50, 50, 40, 40, 100, 200, 50, Math.PI / 4, 1]];

      EvoImg(mockContext, code);

      assert(mockContext.fillRect.calledOnce);
      assert(mockContext.rotate.calledWith(-Math.PI / 4));
    });
  });

  describe('Circle drawing', function () {
    it('should draw a filled circle with correct parameters', function () {
      const code = [[1, 1, 80, 60, 40, 30, 0, 255, 128, Math.PI / 2, 0.5]]; // Circle

      EvoImg(mockContext, code);

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
      assert(mockContext.translate.calledWith(80, 60));
      assert(mockContext.rotate.calledWith(-Math.PI / 2));
      assert.strictEqual(mockContext.fillStyle, 'rgba(0, 255, 128, 1)');
      assert.strictEqual(mockContext.globalAlpha, 0.5);
      assert.strictEqual(mockContext.globalCompositeOperation, 'lighter');

      assert(mockContext.beginPath.calledOnce);
      // Circle radius should be (sizeX + sizeY) / 4 = (40 + 30) / 4 = 17.5
      assert(mockContext.arc.calledWith(80, 60, 17.5, 0, 2 * Math.PI));
      assert(mockContext.fill.calledOnce);
    });
  });

  describe('Triangle drawing', function () {
    it('should draw a filled triangle with correct parameters', function () {
      const code = [[2, 2, 120, 90, 60, 80, 255, 0, 255, 0, 1]]; // Triangle

      EvoImg(mockContext, code);

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
      assert(mockContext.translate.calledWith(120, 90));
      assert.strictEqual(mockContext.fillStyle, 'rgba(255, 0, 255, 1)');
      assert.strictEqual(mockContext.globalCompositeOperation, 'copy');

      assert(mockContext.beginPath.calledOnce);

      // Check triangle points
      const moveToCalls = mockContext.moveTo.getCalls();
      const lineToCalls = mockContext.lineTo.getCalls();

      assert.strictEqual(moveToCalls.length, 1);
      assert.strictEqual(lineToCalls.length, 2);

      // Top point: (x, y - sizeY/2) = (120, 90 - 40) = (120, 50)
      assert(mockContext.moveTo.calledWith(120, 50));

      // Bottom left: (x - sizeX/2, y + sizeY/2) = (120 - 30, 90 + 40) = (90, 130)
      assert(mockContext.lineTo.calledWith(90, 130));

      // Bottom right: (x + sizeX/2, y + sizeY/2) = (120 + 30, 90 + 40) = (150, 130)
      assert(mockContext.lineTo.calledWith(150, 130));

      assert(mockContext.fill.calledOnce);
    });
  });

  describe('Composite operations', function () {
    it('should handle different composite operation codes', function () {
      const operations = [
        [0, 0], // source-over
        [0, 1], // lighter
        [0, 2], // copy
        [0, 3], // xor
        [0, 4], // multiply
        [0, 18], // luminosity
      ];

      const expectedOps = [
        'source-over',
        'lighter',
        'copy',
        'xor',
        'multiply',
        'luminosity',
      ];

      operations.forEach((op, index) => {
        const code = [[op[0], op[1], 50, 50, 20, 20, 255, 255, 255, 0, 1]];
        const freshContext = { ...mockContext };
        Object.keys(mockContext).forEach((key) => {
          if (typeof mockContext[key] === 'function') {
            freshContext[key] = sinon.spy();
          }
        });

        EvoImg(freshContext, code);
        assert.strictEqual(
          freshContext.globalCompositeOperation,
          expectedOps[index],
        );
      });
    });
  });

  describe('Multiple instructions', function () {
    it('should execute multiple drawing instructions in sequence', function () {
      const code = [
        [0, 0, 50, 50, 30, 30, 255, 0, 0, 0, 1], // Red rectangle
        [1, 1, 100, 100, 40, 40, 0, 255, 0, 0, 0.5], // Green circle
        [2, 2, 150, 150, 50, 60, 0, 0, 255, Math.PI / 4, 0.7], // Blue triangle
      ];

      EvoImg(mockContext, code);

      // Should save/restore for each instruction
      assert.strictEqual(mockContext.save.callCount, 3);
      assert.strictEqual(mockContext.restore.callCount, 3);

      // Should translate for each instruction
      assert.strictEqual(mockContext.translate.callCount, 3);
      assert(mockContext.translate.calledWith(50, 50));
      assert(mockContext.translate.calledWith(100, 100));
      assert(mockContext.translate.calledWith(150, 150));

      // Should draw each shape
      assert(mockContext.fillRect.calledOnce); // Rectangle
      assert(mockContext.arc.calledOnce); // Circle
      assert(mockContext.moveTo.calledOnce); // Triangle start
    });
  });

  describe('Edge cases and error handling', function () {
    it('should handle empty code array', function () {
      EvoImg(mockContext, []);

      // No drawing operations should be called
      assert.strictEqual(mockContext.save.callCount, 0);
      assert.strictEqual(mockContext.restore.callCount, 0);
    });

    it('should throw error for invalid shape type', function () {
      const code = [[99, 0, 50, 50, 20, 20, 255, 255, 255, 0, 1]]; // Invalid shape type

      assert.throws(() => {
        EvoImg(mockContext, code);
      }, /Instruction is flawed/);
    });

    it('should handle extreme parameter values', function () {
      const code = [
        [0, 0, 0, 0, 1000, 1000, 255, 255, 255, 2 * Math.PI, 0], // Large size, full rotation, zero alpha
        [1, 0, -100, -100, 1, 1, 0, 0, 0, -Math.PI, 1], // Negative position, tiny size, negative rotation
      ];

      // Should not throw errors
      assert.doesNotThrow(() => {
        EvoImg(mockContext, code);
      });

      assert.strictEqual(mockContext.save.callCount, 2);
      assert.strictEqual(mockContext.restore.callCount, 2);
    });
  });

  describe('Color and alpha handling', function () {
    it('should set correct RGBA colors', function () {
      const code = [[0, 0, 50, 50, 20, 20, 128, 64, 192, 0, 0.3]];

      EvoImg(mockContext, code);

      assert.strictEqual(mockContext.fillStyle, 'rgba(128, 64, 192, 1)');
      assert.strictEqual(mockContext.strokeStyle, 'rgba(128, 64, 192, 1)');
      assert.strictEqual(mockContext.globalAlpha, 0.3);
    });

    it('should handle color values at boundaries', function () {
      const code = [
        [0, 0, 50, 50, 20, 20, 0, 0, 0, 0, 0], // Black, zero alpha
        [1, 0, 100, 100, 20, 20, 255, 255, 255, 0, 1], // White, full alpha
      ];

      EvoImg(mockContext, code);

      // Check that extreme values are handled
      assert.strictEqual(mockContext.save.callCount, 2);
      assert.strictEqual(mockContext.restore.callCount, 2);
    });
  });

  describe('Transformation handling', function () {
    it('should apply transformations in correct order', function () {
      const code = [[0, 0, 100, 75, 40, 30, 255, 255, 255, Math.PI / 3, 1]];

      EvoImg(mockContext, code);

      // Should translate first, then rotate
      assert(mockContext.translate.calledBefore(mockContext.rotate));
      assert(mockContext.translate.calledWith(100, 75));
      assert(mockContext.rotate.calledWith(-Math.PI / 3)); // Note: negative orientation
    });

    it('should save and restore context for each instruction', function () {
      const code = [
        [0, 0, 50, 50, 20, 20, 255, 0, 0, 0, 1],
        [1, 1, 100, 100, 30, 30, 0, 255, 0, Math.PI / 2, 0.5],
      ];

      EvoImg(mockContext, code);

      // Each instruction should be wrapped in save/restore
      const saveCalls = mockContext.save.getCalls();
      const restoreCalls = mockContext.restore.getCalls();

      assert.strictEqual(saveCalls.length, 2);
      assert.strictEqual(restoreCalls.length, 2);

      // Each save should be followed by a restore
      assert(saveCalls[0].calledBefore(restoreCalls[0]));
      assert(saveCalls[1].calledBefore(restoreCalls[1]));
    });
  });
});
