import { JSDOM } from 'jsdom';

console.log('Setting up JSDOM and global variables for ES modules');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

// Set up globals properly with the real JSDOM window
global.window = dom.window;
global.document = dom.window.document;

// Add missing window properties that Screen tests need
global.window.innerWidth = 1024;
global.window.innerHeight = 768;
global.window.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 16); // ~60fps
};
global.window.cancelAnimationFrame = function (id) {
  return clearTimeout(id);
};

// Track active timers and intervals for cleanup
const activeTimers = new Set();
const activeIntervals = new Set();

// Override setTimeout to track timers
const originalSetTimeout = global.window.setTimeout;
global.window.setTimeout = function (callback, delay, ...args) {
  const id = originalSetTimeout.call(
    this,
    (...callbackArgs) => {
      activeTimers.delete(id);
      return callback(...callbackArgs);
    },
    delay,
    ...args,
  );
  activeTimers.add(id);
  return id;
};

// Override setInterval to track intervals
const originalSetInterval = global.window.setInterval;
global.window.setInterval = function (callback, delay, ...args) {
  const id = originalSetInterval.call(this, callback, delay, ...args);
  activeIntervals.add(id);
  return id;
};

// Override clearTimeout
const originalClearTimeout = global.window.clearTimeout;
global.window.clearTimeout = function (id) {
  activeTimers.delete(id);
  return originalClearTimeout.call(this, id);
};

// Override clearInterval
const originalClearInterval = global.window.clearInterval;
global.window.clearInterval = function (id) {
  activeIntervals.delete(id);
  return originalClearInterval.call(this, id);
};

// Global cleanup function
global.cleanupAllTimers = function () {
  // Clear all active timers
  activeTimers.forEach((id) => {
    try {
      originalClearTimeout.call(global.window, id);
    } catch (e) {
      // Ignore errors for already cleared timers
    }
  });
  activeTimers.clear();

  // Clear all active intervals
  activeIntervals.forEach((id) => {
    try {
      originalClearInterval.call(global.window, id);
    } catch (e) {
      // Ignore errors for already cleared intervals
    }
  });
  activeIntervals.clear();
};

// Set up process exit handler to ensure cleanup
process.on('exit', () => {
  global.cleanupAllTimers();
  // Close JSDOM if possible
  if (dom && typeof dom.window.close === 'function') {
    try {
      dom.window.close();
    } catch (e) {
      // Ignore errors
    }
  }
});

// Also handle other termination signals
process.on('SIGINT', () => {
  global.cleanupAllTimers();
  if (dom && typeof dom.window.close === 'function') {
    try {
      dom.window.close();
    } catch (e) {
      // Ignore errors
    }
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  global.cleanupAllTimers();
  if (dom && typeof dom.window.close === 'function') {
    try {
      dom.window.close();
    } catch (e) {
      // Ignore errors
    }
  }
  process.exit(0);
});

// Use JSDOM's native canvas support but override getContext to avoid "not implemented" errors
// This approach preserves proper DOM node behavior while providing canvas functionality

// Override HTMLCanvasElement.prototype.getContext globally
if (dom.window.HTMLCanvasElement && dom.window.HTMLCanvasElement.prototype) {
  // Store the original getContext if it exists
  const originalGetContext = dom.window.HTMLCanvasElement.prototype.getContext;

  dom.window.HTMLCanvasElement.prototype.getContext = function (type) {
    if (type === '2d') {
      return {
        canvas: this,
        fillRect: function () {},
        clearRect: function () {},
        save: function () {},
        restore: function () {},
        translate: function () {},
        rotate: function () {},
        scale: function () {},
        drawImage: function () {},
        fillText: function () {},
        strokeText: function () {},
        measureText: function () {
          return { width: 0 };
        },
        getImageData: function (x, y, width, height) {
          return {
            data: new Uint8ClampedArray(width * height * 4),
            width: width,
            height: height,
          };
        },
        putImageData: function (imageData, x, y) {
          // Mock implementation - just return
        },
        createImageData: function (width, height) {
          return {
            data: new Uint8ClampedArray(width * height * 4),
            width: width,
            height: height,
          };
        },
        beginPath: function () {},
        closePath: function () {},
        moveTo: function () {},
        lineTo: function () {},
        arc: function () {},
        rect: function () {},
        fill: function () {},
        stroke: function () {},
        createRadialGradient: function () {
          return {
            addColorStop: function () {},
          };
        },
        globalAlpha: 1,
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1,
        font: '10px sans-serif',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        shadowBlur: 0,
        shadowColor: '',
        globalCompositeOperation: 'source-over',
      };
    }
    return null;
  };

  // Ensure focus method exists on canvas elements
  if (!dom.window.HTMLCanvasElement.prototype.focus) {
    dom.window.HTMLCanvasElement.prototype.focus = function () {
      // Mock focus - do nothing
    };
  }
}

// Let JSDOM handle createElement natively without any overrides

// Let JSDOM handle appendChild natively - no custom overrides needed

// Use JSDOM's native document directly
global.document = dom.window.document;

// Handle navigator properly - don't overwrite if it's read-only
if (!global.navigator) {
  global.navigator = dom.window.navigator;
} else {
  // If navigator already exists, merge properties
  Object.assign(global.navigator, dom.window.navigator);
}

// Add other common browser globals that might be needed
global.HTMLElement = dom.window.HTMLElement;
global.XMLHttpRequest = dom.window.XMLHttpRequest;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.Image = dom.window.Image;

// Add typed array support
global.Float32Array = Float32Array;
global.Uint8ClampedArray = Uint8ClampedArray;
global.Uint8Array = Uint8Array;

// Make JSDOM constructor available globally for tests
global.JSDOM = JSDOM;

console.log('✅ Test environment setup complete');
