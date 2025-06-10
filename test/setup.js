import { JSDOM } from "jsdom";

console.log("Setting up JSDOM and global variables");

const jsdom = new JSDOM(`<!DOCTYPE html><body><p id="main">JSDOM</p></body>`);
const { window } = jsdom;

global.window = window;
global.document = window.document;
Object.defineProperty(global, "navigator", {
  value: window.navigator,
  writable: false,
  enumerable: true,
  configurable: true,
});
global.Node = window.Node;

// Export the setup for use in tests
export { jsdom, window };
