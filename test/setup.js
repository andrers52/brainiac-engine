import { JSDOM } from "jsdom";

console.log("Setting up JSDOM and global variables for ES modules");

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
  resources: "usable",
});

// Set up globals properly with the real JSDOM window
global.window = dom.window;
global.document = dom.window.document;

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
process.on("exit", () => {
  global.cleanupAllTimers();
  // Close JSDOM if possible
  if (dom && typeof dom.window.close === "function") {
    try {
      dom.window.close();
    } catch (e) {
      // Ignore errors
    }
  }
});

// Also handle other termination signals
process.on("SIGINT", () => {
  global.cleanupAllTimers();
  if (dom && typeof dom.window.close === "function") {
    try {
      dom.window.close();
    } catch (e) {
      // Ignore errors
    }
  }
  process.exit(0);
});

process.on("SIGTERM", () => {
  global.cleanupAllTimers();
  if (dom && typeof dom.window.close === "function") {
    try {
      dom.window.close();
    } catch (e) {
      // Ignore errors
    }
  }
  process.exit(0);
});

// Mock canvas functionality for testing
const originalCreateElement = dom.window.document.createElement.bind(
  dom.window.document,
);
dom.window.document.createElement = function (tagName) {
  const element = originalCreateElement(tagName);

  if (tagName === "canvas") {
    // Mock basic canvas properties and methods
    element.width = 800;
    element.height = 600;
    element.getContext = function (type) {
      if (type === "2d") {
        return {
          canvas: element,
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
          fillStyle: "#000000",
          strokeStyle: "#000000",
          lineWidth: 1,
          font: "10px sans-serif",
          textAlign: "start",
          textBaseline: "alphabetic",
          shadowBlur: 0,
          shadowColor: "",
          globalCompositeOperation: "source-over",
        };
      }
      return null;
    };
  }

  return element;
};

// Also mock the global document.createElement to point to the same function
global.document.createElement = dom.window.document.createElement;

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

// Add typed array support
global.Float32Array = Float32Array;
global.Uint8ClampedArray = Uint8ClampedArray;
global.Uint8Array = Uint8Array;

console.log("✅ Test environment setup complete");
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;

// Make JSDOM constructor available globally for tests
global.JSDOM = JSDOM;

console.log("✅ Test environment setup complete");
