import { CoordinatesConversion } from "../../client/CoordinatesConversion.js";
import { Vector } from "../../common/geometry/Vector.js";

import { expect } from "chai";
import { Rectangle } from "../../common/geometry/Rectangle.js";

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
      expect(worldPosition).to.be.an.instanceof(Vector);
      // Add assertions based on expected values
      expect(worldPosition.x).to.be.equal(-200);
      expect(worldPosition.y).to.be.equal(300);
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
      expect(worldRectangle).to.be.an.instanceof(Rectangle);
      // Add assertions based on expected values
      expect(worldRectangle.center.x).to.be.equal(-200);
      expect(worldRectangle.center.y).to.be.equal(300);
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
      expect(canvasPosition).to.be.an.instanceof(Vector);
      // Add assertions based on expected values
      expect(canvasPosition.x).to.be.equal(450);
      expect(canvasPosition.y).to.be.equal(250);
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
      expect(canvasRectangle).to.be.an.instanceof(Rectangle);
      // Add assertions based on expected values
      expect(canvasRectangle.center.x).to.be.equal(400);
      expect(canvasRectangle.center.y).to.be.equal(300);
    });
  });
});
