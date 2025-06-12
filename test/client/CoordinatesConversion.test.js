import { strict as assert } from "assert";
import { CoordinatesConversion } from "../../client/CoordinatesConversion.js";
import { Rectangle } from "../../common/geometry/Rectangle.js";
import { Vector } from "../../common/geometry/Vector.js";

describe("CoordinatesConversion", () => {
  let canvasPosition, cameraRectangle, screenSize;

  beforeEach(() => {
    canvasPosition = new Vector(100, 100);
    cameraRectangle = new Rectangle(new Vector(100, 100), new Vector(800, 600));
    screenSize = new Vector(800, 600);
  });

  describe("canvasToWorld", () => {
    it("should convert canvas coordinates to world coordinates", () => {
      const worldPosition = CoordinatesConversion.canvasToWorld(
        canvasPosition,
        cameraRectangle,
        screenSize,
      );
      assert.ok(worldPosition instanceof Vector);
      // Add assertions based on expected values
      assert.strictEqual(worldPosition.x, -200);
      assert.strictEqual(worldPosition.y, 300);
    });
  });

  describe("rectangleCanvasToWorld", () => {
    it("should convert canvas rectangle to world rectangle", () => {
      const rectangle = new Rectangle(
        new Vector(100, 100),
        new Vector(200, 200),
      );
      const worldRectangle = CoordinatesConversion.rectangleCanvasToWorld(
        rectangle,
        cameraRectangle,
        screenSize,
      );
      assert.ok(worldRectangle instanceof Rectangle);
      // Add assertions based on expected values
      assert.strictEqual(worldRectangle.center.x, -200);
      assert.strictEqual(worldRectangle.center.y, 300);
    });
  });

  describe("worldToCanvas", () => {
    it("should convert world coordinates to canvas coordinates", () => {
      const worldPosition = new Vector(150, 150);
      const canvasPosition = CoordinatesConversion.worldToCanvas(
        worldPosition,
        cameraRectangle,
        screenSize,
      );
      assert.ok(canvasPosition instanceof Vector);
      // Add assertions based on expected values
      assert.strictEqual(canvasPosition.x, 450);
      assert.strictEqual(canvasPosition.y, 250);
    });
  });

  describe("rectangleWorldToCanvas", () => {
    it("should convert world rectangle to canvas rectangle", () => {
      const rectangle = new Rectangle(
        new Vector(100, 100),
        new Vector(200, 200),
      );
      const canvasRectangle = CoordinatesConversion.rectangleWorldToCanvas(
        rectangle,
        cameraRectangle,
        screenSize,
      );
      assert.ok(canvasRectangle instanceof Rectangle);
      // Add assertions based on expected values
      assert.strictEqual(canvasRectangle.center.x, 400);
      assert.strictEqual(canvasRectangle.center.y, 300);
    });
  });
});
