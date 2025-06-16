import { strict as assert } from "assert";
import { ResourceStore } from "./ResourceStore.js";

// Mock arslib and Effect if not running in full app context
global.Assert = {
  assert: (cond, msg) => {
    if (!cond) throw new Error(msg);
  },
};
global.EArray = { last: (arr) => arr[arr.length - 1] };
global.Random = {
  randomInt: (max) => Math.floor(Math.random() * max),
};
global.ImageUtil = {
  createCanvas: (w, h) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return canvas;
  },
};
global.Effect = () => {};

describe("ResourceStore", function () {
  let store;
  let originalCreateElement;

  beforeEach(function () {
    store = new ResourceStore();

    // Ensure we have a proper canvas mock for ResourceStore tests
    originalCreateElement = global.document.createElement;
    global.document.createElement = function (tagName) {
      if (tagName.toLowerCase() === "canvas") {
        const canvas = {
          width: 0,
          height: 0,
          getContext: function (contextType) {
            if (contextType === "2d") {
              return {
                canvas: this,
                getImageData: function (x, y, width, height) {
                  return {
                    data: new Uint8ClampedArray(width * height * 4),
                    width: width,
                    height: height,
                  };
                },
                putImageData: function (imageData, x, y) {
                  // Mock implementation
                },
                fillRect: function () {},
                clearRect: function () {},
                drawImage: function () {},
                // ... other context methods
              };
            }
            return null;
          },
        };
        return canvas;
      }
      return originalCreateElement.call(this, tagName);
    };
  });

  afterEach(function () {
    // Restore original createElement
    global.document.createElement = originalCreateElement;
  });

  it("should initialize with empty resources", function () {
    assert(store.resources);
    assert.strictEqual(Object.keys(store.resources).length, 0);
  });

  it("should add and retrieve a local resource", function () {
    store.addLocalResource("foo", { bar: 42 });
    assert.deepStrictEqual(store.resources["foo"], { bar: 42 });
    assert.deepStrictEqual(store.retrieveResourceObject("foo"), { bar: 42 });
  });

  it("should create a new image name and not collide", function () {
    const name1 = store.createNewImageName();
    const name2 = store.createNewImageName();
    assert.notStrictEqual(name1, name2);
    assert(name1.endsWith(".jpg"));
  });

  it("should clear all resources", function () {
    store.addLocalResource("foo", { bar: 42 });
    store.clearAll();
    assert.strictEqual(Object.keys(store.resources).length, 0);
  });

  it("should clear all but preserved resources", function () {
    store.addLocalResource("foo", 1);
    store.addLocalResource("bar", 2);
    store.clearAllBut(["foo"]);
    assert.strictEqual(store.resources["foo"], 1);
    assert.strictEqual(store.resources["bar"], undefined);
  });

  it("should remove temporary resources", function () {
    store.addLocalResource("temp_img", 1);
    store.addLocalResource("perm_img", 2);
    store.removeTemporaryResources();
    assert.strictEqual(store.resources["temp_img"], undefined);
    assert.strictEqual(store.resources["perm_img"], 2);
  });

  it("should check resource existence", function () {
    assert.strictEqual(store.checkResourceObjectExists("foo"), false);
    store.addLocalResource("foo", 1);
    assert.strictEqual(store.checkResourceObjectExists("foo"), true);
  });

  it("should remove a resource", function () {
    store.addLocalResource("foo", 1);
    store.removeResource("foo");
    assert.strictEqual(store.resources["foo"], undefined);
  });

  it("should report hasResource correctly", function () {
    assert.strictEqual(store.hasResource("foo"), false);
    store.addLocalResource("foo", 1);
    assert.strictEqual(store.hasResource("foo"), 1);
  });

  it("should create and clone a canvas image", function () {
    const name = store.createNewImage(10, 10);
    assert(store.resources[name]);
    const clone = store.cloneImage(name);
    assert.notStrictEqual(clone, name);
    assert(store.resources[clone]);
  });

  it("should get and set image data", function () {
    const name = store.createNewImage(10, 10);
    const data = store.getImageData(name);
    assert(data);
    store.setImageData(name, data);
    // No error means pass
  });

  it("should retrieve all audio names (empty)", function () {
    const audioNames = store.retrieveAllAudioNames();
    assert(Array.isArray(audioNames));
  });

  // Note: addResource, callWhenReady, and async resource loading would require more advanced mocks or integration tests.
});
