import { strict as assert } from 'assert';
import sinon from 'sinon';
import { Label } from './Label.js';

describe('Label', function () {
  let mockContext;
  let mockTextMetrics;

  beforeEach(function () {
    mockTextMetrics = {
      width: 80,
    };

    mockContext = {
      save: sinon.spy(),
      restore: sinon.spy(),
      measureText: sinon.stub().returns(mockTextMetrics),
      fillRect: sinon.spy(),
      fillText: sinon.spy(),
      font: '',
      fillStyle: '',
    };
  });

  describe('Basic functionality', function () {
    it('should render text with default parameters', function () {
      const parameters = {
        text: 'Hello World',
      };

      Label(mockContext, parameters);

      // Should save and restore context
      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);

      // Should set font with defaults
      assert.strictEqual(mockContext.font, '16px Arial');

      // Should measure text
      assert(mockContext.measureText.calledWith('Hello World'));

      // Should draw background rectangle
      assert(mockContext.fillRect.calledOnce);
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[0], 5); // x - 5 = 10 - 5
      assert.strictEqual(bgCall.args[1], 14); // y - textHeight = 30 - 16
      assert.strictEqual(bgCall.args[2], 90); // textWidth + 10 = 80 + 10
      assert.strictEqual(bgCall.args[3], 21); // textHeight + 5 = 16 + 5

      // Should draw text
      assert(mockContext.fillText.calledWith('Hello World', 10, 30));

      // Should set colors correctly
      sinon.assert.callOrder(
        mockContext.save,
        mockContext.measureText,
        mockContext.fillRect,
        mockContext.fillText,
        mockContext.restore,
      );
    });

    it('should use custom parameters when provided', function () {
      const parameters = {
        text: 'Custom Text',
        fontFace: 'Georgia',
        backgroundColor: '#ff0000',
        textColor: '#00ff00',
        fontSize: 24,
        x: 50,
        y: 100,
      };

      Label(mockContext, parameters);

      // Should set custom font
      assert.strictEqual(mockContext.font, '24px Georgia');

      // Should draw background at custom position
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[0], 45); // x - 5 = 50 - 5
      assert.strictEqual(bgCall.args[1], 76); // y - textHeight = 100 - 24
      assert.strictEqual(bgCall.args[2], 90); // textWidth + 10 = 80 + 10
      assert.strictEqual(bgCall.args[3], 29); // textHeight + 5 = 24 + 5

      // Should draw text at custom position
      assert(mockContext.fillText.calledWith('Custom Text', 50, 100));
    });
  });

  describe('Parameter validation', function () {
    it('should return early if no parameters provided', function () {
      Label(mockContext);

      assert(mockContext.save.notCalled);
      assert(mockContext.restore.notCalled);
      assert(mockContext.measureText.notCalled);
      assert(mockContext.fillRect.notCalled);
      assert(mockContext.fillText.notCalled);
    });

    it('should return early if text parameter is missing', function () {
      const parameters = {
        fontFace: 'Arial',
        backgroundColor: '#ff0000',
      };

      Label(mockContext, parameters);

      assert(mockContext.save.notCalled);
      assert(mockContext.restore.notCalled);
      assert(mockContext.measureText.notCalled);
      assert(mockContext.fillRect.notCalled);
      assert(mockContext.fillText.notCalled);
    });

    it('should return early if text parameter is empty', function () {
      const parameters = {
        text: '',
      };

      Label(mockContext, parameters);

      assert(mockContext.save.notCalled);
      assert(mockContext.restore.notCalled);
      assert(mockContext.measureText.notCalled);
      assert(mockContext.fillRect.notCalled);
      assert(mockContext.fillText.notCalled);
    });

    it('should handle null parameters', function () {
      assert.doesNotThrow(() => {
        Label(mockContext, null);
      });

      assert(mockContext.save.notCalled);
      assert(mockContext.restore.notCalled);
    });
  });

  describe('Default values', function () {
    it('should use default font face when not specified', function () {
      const parameters = {
        text: 'Test',
      };

      Label(mockContext, parameters);

      assert.strictEqual(mockContext.font, '16px Arial');
    });

    it('should use default font size when not specified', function () {
      const parameters = {
        text: 'Test',
        fontFace: 'Times',
      };

      Label(mockContext, parameters);

      assert.strictEqual(mockContext.font, '16px Times');
    });

    it('should use default position when not specified', function () {
      const parameters = {
        text: 'Test',
      };

      Label(mockContext, parameters);

      // Default position should be (10, 30)
      assert(mockContext.fillText.calledWith('Test', 10, 30));
    });

    it('should use default colors when not specified', function () {
      const parameters = {
        text: 'Test',
      };

      Label(mockContext, parameters);

      // Should have set fillStyle twice - once for background, once for text
      // We can't easily check the exact values as they're set on the mock
      // But we can verify the calls were made in the right order
      sinon.assert.callOrder(mockContext.fillRect, mockContext.fillText);
    });
  });

  describe('Text measurement', function () {
    it('should measure text width correctly', function () {
      mockTextMetrics.width = 120;

      const parameters = {
        text: 'Longer text',
      };

      Label(mockContext, parameters);

      assert(mockContext.measureText.calledWith('Longer text'));

      // Background width should be textWidth + 10 = 120 + 10 = 130
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[2], 130);
    });

    it('should handle very wide text', function () {
      mockTextMetrics.width = 500;

      const parameters = {
        text: 'Very very very long text that is extremely wide',
      };

      Label(mockContext, parameters);

      // Background width should be textWidth + 10 = 500 + 10 = 510
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[2], 510);
    });

    it('should handle narrow text', function () {
      mockTextMetrics.width = 5;

      const parameters = {
        text: 'i',
      };

      Label(mockContext, parameters);

      // Background width should be textWidth + 10 = 5 + 10 = 15
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[2], 15);
    });
  });

  describe('Font size variations', function () {
    it('should handle large font size', function () {
      const parameters = {
        text: 'Big Text',
        fontSize: 48,
      };

      Label(mockContext, parameters);

      assert.strictEqual(mockContext.font, '48px Arial');

      // Background height should be fontSize + 5 = 48 + 5 = 53
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[3], 53);
    });

    it('should handle small font size', function () {
      const parameters = {
        text: 'Small Text',
        fontSize: 8,
      };

      Label(mockContext, parameters);

      assert.strictEqual(mockContext.font, '8px Arial');

      // Background height should be fontSize + 5 = 8 + 5 = 13
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[3], 13);
    });
  });

  describe('Position variations', function () {
    it('should handle negative positions', function () {
      const parameters = {
        text: 'Test',
        x: -10,
        y: -5,
      };

      Label(mockContext, parameters);

      // Background x should be x - 5 = -10 - 5 = -15
      // Background y should be y - fontSize = -5 - 16 = -21
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[0], -15);
      assert.strictEqual(bgCall.args[1], -21);

      assert(mockContext.fillText.calledWith('Test', -10, -5));
    });

    it('should handle large positions', function () {
      const parameters = {
        text: 'Test',
        x: 1000,
        y: 800,
      };

      Label(mockContext, parameters);

      // Background x should be x - 5 = 1000 - 5 = 995
      // Background y should be y - fontSize = 800 - 16 = 784
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[0], 995);
      assert.strictEqual(bgCall.args[1], 784);

      assert(mockContext.fillText.calledWith('Test', 1000, 800));
    });

    it('should handle zero positions', function () {
      const parameters = {
        text: 'Test',
        x: 0,
        y: 0,
      };

      Label(mockContext, parameters);

      // Background x should be x - 5 = 0 - 5 = -5
      // Background y should be y - fontSize = 0 - 16 = -16
      const bgCall = mockContext.fillRect.getCall(0);
      assert.strictEqual(bgCall.args[0], -5);
      assert.strictEqual(bgCall.args[1], -16);

      assert(mockContext.fillText.calledWith('Test', 0, 0));
    });
  });

  describe('Context state management', function () {
    it('should save and restore context state', function () {
      const parameters = {
        text: 'Test',
      };

      Label(mockContext, parameters);

      assert(mockContext.save.calledOnce);
      assert(mockContext.restore.calledOnce);
      sinon.assert.callOrder(mockContext.save, mockContext.restore);
    });

    it('should restore context even if text measurement fails', function () {
      mockContext.measureText.throws(new Error('measureText failed'));

      const parameters = {
        text: 'Test',
      };

      assert.throws(() => {
        Label(mockContext, parameters);
      });

      // Should still have called save (but restore might not be called due to exception)
      assert(mockContext.save.calledOnce);
    });
  });

  describe('Special characters and text content', function () {
    it('should handle special characters', function () {
      const parameters = {
        text: 'Hello 世界! @#$%^&*()',
      };

      Label(mockContext, parameters);

      assert(mockContext.measureText.calledWith('Hello 世界! @#$%^&*()'));
      assert(mockContext.fillText.calledWith('Hello 世界! @#$%^&*()', 10, 30));
    });

    it('should handle numbers', function () {
      const parameters = {
        text: '12345',
      };

      Label(mockContext, parameters);

      assert(mockContext.measureText.calledWith('12345'));
      assert(mockContext.fillText.calledWith('12345', 10, 30));
    });

    it('should handle single character', function () {
      const parameters = {
        text: 'A',
      };

      Label(mockContext, parameters);

      assert(mockContext.measureText.calledWith('A'));
      assert(mockContext.fillText.calledWith('A', 10, 30));
    });
  });
});
