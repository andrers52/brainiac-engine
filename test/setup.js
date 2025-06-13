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

// Mock canvas functionality for testing
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;

// Make JSDOM constructor available globally for tests
global.JSDOM = JSDOM;

console.log("✅ Test environment setup complete");
