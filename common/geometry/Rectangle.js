"use strict";

import { Assert } from "arslib";
import { Vector } from "./Vector.js";

/**
 * Creates a Rectangle with a center point and size.
 * Note: the operations are destructive! Use clone() for protection.
 * @param {Vector} [centerPoint=new Vector()] - The center point of the rectangle
 * @param {Vector} [size=new Vector()] - The size of the rectangle (width, height)
 * @constructor
 */
export function Rectangle(centerPoint = new Vector(), size = new Vector()) {
  this.center = centerPoint || new Vector();
  this.size = (size || new Vector()).abs();
}

/**
 * Gets the width of the rectangle
 * @returns {number} The width of the rectangle
 */
Rectangle.prototype.getWidth = function () {
  return this.size.x;
};

/**
 * Gets the height of the rectangle
 * @returns {number} The height of the rectangle
 */
Rectangle.prototype.getHeight = function () {
  return this.size.y;
};

/**
 * Gets the size vector of the rectangle
 * @returns {Vector} The size vector containing width and height
 */
Rectangle.prototype.getSize = function () {
  return this.size;
};

//Rectangle.prototype.area = function() {
//  //NOTE: THIS IS DONE THIS WAY TO ALLOW FUTURE CALCULATION OF AREA WHEN THE RECTANGLE IS NOT PARALLEL TO THE XY PLANE
//  let coordinates = [this.bottomLeft(), this.bottomRight(), this.topRight(), this.topLeft()];
//  let coordinatesArrayWithFirstPointAtOrigin = BEClient.Polygon.coordinatesArrayWithFirstPointAtOrigin(coordinates);
//  return Vector.parallelogramArea(coordinatesArrayWithFirstPointAtOrigin[1], coordinatesArrayWithFirstPointAtOrigin[3]);
//};

/**
 * Calculates the area of the rectangle
 * @returns {number} The area of the rectangle
 */
Rectangle.prototype.area = function () {
  return this.size.x * this.size.y;
};

/**
 * Calculates the diagonal length of the rectangle
 * @returns {number} The diagonal length
 */
Rectangle.prototype.diagonal = function () {
  return Math.sqrt(Math.pow(this.size.x, 2) + Math.pow(this.size.y, 2));
};

/**
 * Calculates the mean of width and height
 * @returns {number} The average of width and height
 */
Rectangle.prototype.meanSize = function () {
  return (this.size.x + this.size.y) / 2;
};

/**
 * Gets the minimum dimension (width or height)
 * @returns {number} The smaller of width or height
 */
Rectangle.prototype.minSize = function () {
  return Math.min(this.size.x, this.size.y);
};

/**
 * Gets the maximum dimension (width or height)
 * @returns {number} The larger of width or height
 */
Rectangle.prototype.maxSize = function () {
  return Math.max(this.size.x, this.size.y);
};

/**
 * Gets the center point of the rectangle
 * @returns {Vector} The center point
 */
Rectangle.prototype.getCenter = function () {
  return this.center;
};

/**
 * Gets the position (same as center) of the rectangle
 * @returns {Vector} The position/center point
 */
Rectangle.prototype.getPosition = function () {
  return this.center;
};

/**
 * Sets the size of the rectangle
 * @param {Vector} vector - The new size vector
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.setSize = function (vector) {
  this.size = vector;
  return this;
};

/**
 * Sets the center point of the rectangle
 * @param {Vector} vector - The new center point
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.setCenter = function (vector) {
  this.center = vector;
  return this;
};

/**
 * Sets the position (center) of the rectangle
 * @param {Vector} position - The new position
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.setPosition = function (position, pointOfInterest) {
  if (pointOfInterest) {
    return this.setPointOfInterestAtPosition(pointOfInterest, position);
  }
  this.center = position;
  return this;
};

/**
 * Sets the 2D position of the rectangle
 * @param {Vector} position - The new 2D position
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.setPosition2D = function (position) {
  let origCenter = this.center;
  this.center = position;
  return this;
};

/**
 * Sets a specific point of interest of the rectangle at the given position
 * @param {string} pointOfInterest - The point of interest ("topLeft", "topRight", "bottomLeft", "bottomRight", "bottomCenter", "topCenter", "leftCenter", "rightCenter")
 * @param {Vector} position - The target position for the point of interest
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.setPointOfInterestAtPosition = function (
  pointOfInterest,
  position,
) {
  if (!pointOfInterest || pointOfInterest === "center")
    return this.setCenter(position);
  Assert.assertIsValidString(
    pointOfInterest,
    [
      "topLeft",
      "topRight",
      "bottomLeft",
      "bottomRight",
      "bottomCenter",
      "topCenter",
      "leftCenter",
      "rightCenter",
    ],
    "Non valid rectangle point of interest",
  );
  let vectToAdd;
  let halfSize = this.halfSize();
  switch (pointOfInterest) {
    case "topLeft":
      vectToAdd = new Vector(halfSize.x, -halfSize.y);
      break;
    case "topRight":
      vectToAdd = new Vector(-halfSize.x, -halfSize.y);
      break;
    case "bottomLeft":
      vectToAdd = new Vector(halfSize.x, halfSize.y);
      break;
    case "bottomRight":
      vectToAdd = new Vector(-halfSize.x, halfSize.y);
      break;
    case "bottomCenter":
      vectToAdd = new Vector(0, halfSize.y);
      break;
    case "topCenter":
      vectToAdd = new Vector(0, -halfSize.y);
      break;
    case "leftCenter":
      vectToAdd = new Vector(halfSize.x, 0);
      break;
    case "rightCenter":
      vectToAdd = new Vector(-halfSize.x, 0);
      break;
  }
  this.setCenter(position.add(vectToAdd));
  return this;
};

/**
 * Aligns this rectangle to another rectangle
 * @param {Rectangle} otherRect - The rectangle to align to
 * @param {string} alignment - The alignment type ("top", "bottom", "left", "right")
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.allignToRectangle = function (otherRect, alligment) {
  Assert.assertIsValidString(
    alligment,
    ["top", "bottom", "left", "right"],
    `Invalid option ${alligment} for "alligment" parameter.`,
  );

  switch (alligment) {
    case "top":
      this.center.y = otherRect.topLeft().y - this.size.y / 2;
      break;
    case "bottom":
      this.center.y = otherRect.bottomLeft().y + this.size.y / 2;
      break;
    case "left":
      this.center.x = otherRect.bottomLeft().x + this.size.x / 2;
      break;
    case "right":
      this.center.x = otherRect.bottomRight().x - this.size.x / 2;
      break;
  }
};

/**
 * Sets the position of this rectangle relative to another rectangle
 * Note: agents should not call it directly (or the client won't see. Use setPositionRelativeToAgent instead.
 * @param {Rectangle} otherRect - The reference rectangle
 * @param {string} relativePosition - The relative position ("topLeft", "topRight", "randomTop", "bottomLeft", "bottomRight", "randomBottom", "center", "bottomCenter", "topCenter", "leftCenter", "randomLeft", "rightCenter", "randomRight")
 * @param {string} [insideOutside="inside"] - Whether to position inside or outside ("inside", "outside")
 * @param {number} [offset=0] - Additional offset distance
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.setPositionRelativeToRectangle = function (
  otherRect,
  relativePosition,
  insideOutside = "inside",
  offset = 0,
) {
  Assert.assertIsValidString(
    insideOutside,
    ["inside", "outside"],
    `Invalid option ${insideOutside} for "insideOutside" parameter.`,
  );
  Assert.assertIsValidString(
    relativePosition,
    [
      "topLeft",
      "topRight",
      "randomTop",
      "bottomLeft",
      "bottomRight",
      "randomBottom",
      "center",
      "bottomCenter",
      "topCenter",
      "leftCenter",
      "randomLeft",
      "rightCenter",
      "randomRight",
    ],
    "Invalid Rectangle relative position",
  );

  switch (relativePosition) {
    case "topLeft":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "topLeft" : "bottomRight",
        otherRect.topLeft(),
      );
      break;
    case "topRight":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "topRight" : "bottomLeft",
        otherRect.topRight(),
      );
      break;
    case "randomTop":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "topLeft" : "bottomLeft",
        otherRect.topLeft(),
      );
      this.move(
        vect(
          Random.randomFromIntervalInclusive(0, otherRect.size.x - this.size.x),
          0,
        ),
      );
      break;
    case "bottomLeft":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "bottomLeft" : "topRight",
        otherRect.bottomLeft(),
      );
      break;
    case "bottomRight":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "bottomRight" : "topleft",
        otherRect.bottomRight(),
      );
      break;
    case "randomBottom":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "bottomLeft" : "topleft",
        otherRect.bottomLeft(),
      );
      this.move(
        vect(
          Random.randomFromIntervalInclusive(0, otherRect.size.x - this.size.x),
          0,
        ),
      );
      break;
    case "center":
      Assert.assert(
        insideOutside == "inside",
        "Error: cannot position at center and outside at same time.",
      );
      this.setPointOfInterestAtPosition("center", otherRect.center);
      break;
    case "bottomCenter":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "bottomCenter" : "topCenter",
        otherRect.bottomCenter(),
      );
      break;
    case "topCenter":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "topCenter" : "bottomCenter",
        otherRect.topCenter(),
      );
      break;
    case "leftCenter":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "leftCenter" : "rightCenter",
        otherRect.leftCenter(),
      );
      break;
    case "randomLeft":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "bottomLeft" : "topLeft",
        otherRect.bottomLeft(),
      );
      this.move(
        vect(
          0,
          Random.randomFromIntervalInclusive(0, otherRect.size.y - this.size.y),
        ),
      );
      break;
    case "rightCenter":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "rightCenter" : "leftCenter",
        otherRect.rightCenter(),
      );
      break;
    case "randomRight":
      this.setPointOfInterestAtPosition(
        insideOutside == "inside" ? "bottomRight" : "topRight",
        otherRect.bottomRight(),
      );
      this.move(
        vect(
          0,
          Random.randomFromIntervalInclusive(0, otherRect.size.y - this.size.y),
        ),
      );
      break;
  }

  //apply offset
  let direction = this.center.subtract(otherRect.center).normalize();
  this.center.add(direction.multiplyByScalar(offset));

  return this;
};

/**
 * Creates a clone of this rectangle
 * @returns {Rectangle} A new rectangle that is a copy of this one
 */
Rectangle.prototype.clone = function () {
  return new Rectangle(this.getCenter().clone(), this.getSize().clone());
};

/**
 * Checks if a point is inside this rectangle
 * @param {Vector} point - The point to check
 * @returns {boolean} True if the point is inside the rectangle
 */
Rectangle.prototype.checkPointInside = function (point) {
  let insideX = point.x >= this.topLeft().x && point.x <= this.topRight().x;
  if (!insideX) return false;
  let insideY = point.y <= this.topLeft().y && point.y >= this.bottomLeft().y;
  if (!insideY) return false;
  return true;
};

/**
 * Checks if a point is outside this rectangle
 * @param {Vector} point - The point to check
 * @returns {boolean} True if the point is outside the rectangle
 */
Rectangle.prototype.checkPointOutside = function (point) {
  let outsideX = point.x < this.topLeft().x || point.x > this.topRight().x;
  if (outsideX) return true;
  let outsideY = point.y > this.topLeft().y || point.y < this.bottomLeft().y;
  if (outsideY) return true;
  return false;
};

/**
 * Gets half the size of the rectangle
 * @returns {Vector} A vector containing half the width and height
 */
Rectangle.prototype.halfSize = function () {
  return new Vector(this.size.x / 2, this.size.y / 2);
};

/**
 * Gets the maximum X coordinate of the rectangle
 * @returns {number} The rightmost X coordinate
 */
Rectangle.prototype.getMaxX = function () {
  return this.center.x + this.halfSize().x;
};

/**
 * Gets the minimum X coordinate of the rectangle
 * @returns {number} The leftmost X coordinate
 */
Rectangle.prototype.getMinX = function () {
  return this.center.x - this.halfSize().x;
};

/**
 * Gets the maximum Y coordinate of the rectangle
 * @returns {number} The topmost Y coordinate
 */
Rectangle.prototype.getMaxY = function () {
  return this.center.y + this.halfSize().y;
};

/**
 * Gets the minimum Y coordinate of the rectangle
 * @returns {number} The bottommost Y coordinate
 */
Rectangle.prototype.getMinY = function () {
  return this.center.y - this.halfSize().y;
};

/**
 * Gets the top-left corner position
 * @returns {Vector} The top-left corner coordinates
 */
Rectangle.prototype.topLeft = function () {
  return new Vector(this.getMinX(), this.getMaxY());
};

/**
 * Gets the top-right corner position
 * @returns {Vector} The top-right corner coordinates
 */
Rectangle.prototype.topRight = function () {
  return new Vector(this.getMaxX(), this.getMaxY());
};

/**
 * Gets the bottom-left corner position
 * @returns {Vector} The bottom-left corner coordinates
 */
Rectangle.prototype.bottomLeft = function () {
  return new Vector(this.getMinX(), this.getMinY());
};

/**
 * Gets the bottom-right corner position
 * @returns {Vector} The bottom-right corner coordinates
 */
Rectangle.prototype.bottomRight = function () {
  return new Vector(this.getMaxX(), this.getMinY());
};

/**
 * Gets the bottom center position
 * @returns {Vector} The bottom center coordinates
 */
Rectangle.prototype.bottomCenter = function () {
  return new Vector(this.center.x, this.getMinY());
};

/**
 * Gets the top center position
 * @returns {Vector} The top center coordinates
 */
Rectangle.prototype.topCenter = function () {
  return new Vector(this.center.x, this.getMaxY());
};

/**
 * Gets the left center position
 * @returns {Vector} The left center coordinates
 */
Rectangle.prototype.leftCenter = function () {
  return new Vector(this.getMinX(), this.center.y);
};

/**
 * Gets the right center position
 * @returns {Vector} The right center coordinates
 */
Rectangle.prototype.rightCenter = function () {
  return new Vector(this.getMaxX(), this.center.y);
};

/**
 * Converts the rectangle from one coordinate system to another
 * @param {Vector} fromBaseSize - The original base size
 * @param {Vector} toBaseSize - The target base size
 * @returns {Rectangle} A new rectangle converted to the new coordinate system
 */
Rectangle.prototype.convert = function (fromBaseSize, toBaseSize) {
  return new Rectangle(
    this.center.convert(fromBaseSize, toBaseSize),
    this.size.convert(fromBaseSize, toBaseSize),
  );
};

/**
 * Moves the rectangle by a given distance
 * @param {Vector} distance - The distance to move
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.move = function (distance) {
  this.center.add(distance);
  return this;
};

/**
 * Checks if moving by the given vector would move this rectangle closer to another rectangle
 * @param {Vector} movimentVector - The movement vector
 * @param {Rectangle} otherRectangle - The target rectangle
 * @returns {boolean} True if the movement brings rectangles closer
 */
Rectangle.prototype.isMovingToInsideOfOtherRectangle = function (
  movimentVector,
  otherRectangle,
) {
  let newPosition = this.center.clone().add(movimentVector);
  let currentPositionDistanceToOtherCenter = this.center.distance(
    otherRectangle.center,
  );
  let newPositionDistanceToOtherCenter = newPosition.distance(
    otherRectangle.center,
  );

  return (
    newPositionDistanceToOtherCenter < currentPositionDistanceToOtherCenter
  );
};

/**
 * Makes the rectangle square by using the smaller dimension
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.reduceToSquare = function () {
  let minimumSize = Math.min(this.size.x, this.size.y);
  this.size = new Vector(minimumSize, minimumSize);
  return this;
};

/**
 * Makes the rectangle square by using the larger dimension
 * @returns {Rectangle} This rectangle for chaining
 */
Rectangle.prototype.enlargeToSquare = function () {
  let maximumSize = Math.max(this.size.x, this.size.y);
  this.size = new Vector(maximumSize, maximumSize);
  return this;
};

/**
 * Returns the percentage position of a point within the rectangle
 * @param {Vector} position - The position to check
 * @returns {Vector|null} The percentage position vector, or null if outside
 */
Rectangle.prototype.positionPercentage = function (position) {
  if (!this.checkPointInside(position)) return null;
  let rectBottomLeft = this.bottomLeft();
  let distanceFromBottomLeft = position.vectorDistance(rectBottomLeft).abs();
  let percentagePositionX = (distanceFromBottomLeft.x * 100) / this.size.x;
  let percentagePositionY = (distanceFromBottomLeft.y * 100) / this.size.y;
  return new Vector(percentagePositionX, percentagePositionY);
};

/**
 * Converts a percentage position to an actual position within the rectangle
 * @param {Vector} percentage - The percentage vector
 * @returns {Vector} The actual position within the rectangle
 */
Rectangle.prototype.sizePercentageToPosition = function (percentage) {
  return new Vector(
    (this.size.x * percentage.x) / 100,
    (this.size.y * percentage.y) / 100,
  ).subtract(this.size.clone().divideByScalar(2));
};

/**
 * Checks if another rectangle is completely inside this rectangle
 * @param {Rectangle} rectangle - The rectangle to check
 * @returns {boolean} True if the other rectangle is completely inside
 */
Rectangle.prototype.checkInside = function (rectangle) {
  return (
    this.checkPointInside(rectangle.topLeft()) &&
    this.checkPointInside(rectangle.bottomRight()) &&
    this.checkPointInside(rectangle.topRight()) &&
    this.checkPointInside(rectangle.bottomLeft())
  );
};

/**
 * Checks if another rectangle has at least one corner inside this rectangle
 * @param {Rectangle} rectangle - The rectangle to check
 * @returns {boolean} True if at least one corner is inside
 */
Rectangle.prototype.checkHasCornerInside = function (rectangle) {
  return (
    this.checkPointInside(rectangle.topLeft()) ||
    this.checkPointInside(rectangle.bottomRight()) ||
    this.checkPointInside(rectangle.topRight()) ||
    this.checkPointInside(rectangle.bottomLeft())
  );
};

/**
 * Checks if another rectangle has at least one corner outside this rectangle
 * @param {Rectangle} rectangle - The rectangle to check
 * @returns {boolean} True if at least one corner is outside
 */
Rectangle.prototype.checkHasCornerOutside = function (rectangle) {
  return (
    this.checkPointOutside(rectangle.topLeft()) ||
    this.checkPointOutside(rectangle.bottomRight()) ||
    this.checkPointOutside(rectangle.topRight()) ||
    this.checkPointOutside(rectangle.bottomLeft())
  );
};

/**
 * Helper function to check intersection when one rectangle has corners inside another
 * @param {Rectangle} rectangle1 - First rectangle
 * @param {Rectangle} rectangle2 - Second rectangle
 * @returns {boolean} True if there's intersection with corner inside
 */
function intersectionWithCornerInside(rectangle1, rectangle2) {
  return (
    rectangle1.checkHasCornerInside(rectangle2) &&
    rectangle1.checkHasCornerOutside(rectangle2)
  );
}

/**
 * Helper function to check intersection when rectangles don't have corners inside each other
 * @param {Rectangle} rectangle1 - First rectangle
 * @param {Rectangle} rectangle2 - Second rectangle
 * @returns {boolean} True if there's intersection without corner inside
 */
function intersectionWithoutCornerInside(rectangle1, rectangle2) {
  if (Rectangle.sameSize(rectangle1, rectangle2)) {
    return false;
  }
  // Only possibility:
  //        +++++++++++++
  //       +            +
  //   ----------------------
  //  |                      |
  //   ---------------------
  //      +             +
  //      ++++++++++++++

  let greaterX = Rectangle.pickGreaterX(rectangle1, rectangle2);
  let greaterY = Rectangle.pickGreaterY(rectangle1, rectangle2);
  let smallerX = Rectangle.pickSmallerX(rectangle1, rectangle2);
  let smallerY = Rectangle.pickSmallerY(rectangle1, rectangle2);

  return (
    smallerX.bottomLeft().x >= greaterX.bottomLeft().x &&
    smallerX.bottomLeft().x <= greaterX.bottomRight().x &&
    smallerX.bottomRight().x >= greaterX.bottomLeft().x &&
    smallerX.bottomRight().x <= greaterX.bottomRight().x &&
    smallerY.bottomLeft().y >= greaterY.bottomLeft().y &&
    smallerY.bottomLeft().y <= greaterY.topLeft().y &&
    smallerY.topLeft().y >= greaterY.bottomLeft().y &&
    smallerY.topLeft().y <= greaterY.topLeft().y
  );

  /* return smallerX.bottomLeft().x.between(greaterX.bottomLeft().x, greaterX.bottomRight().x) &&
     smallerX.bottomRight().x.between(greaterX.bottomLeft().x, greaterX.bottomRight().x) &&
     smallerY.bottomLeft().y.between(greaterY.bottomLeft().y, greaterY.topLeft().y) &&
     smallerY.topLeft().y.between(greaterY.bottomLeft().y, greaterY.topLeft().y); */
}

Rectangle.prototype.checkIntersection = function (rectangle) {
  return (
    this.checkInside(rectangle) ||
    rectangle.checkInside(this) ||
    intersectionWithCornerInside(this, rectangle) ||
    intersectionWithoutCornerInside(this, rectangle)
  );
};

Rectangle.prototype.toString = function () {
  return `Rect(center -> ${this.center.toString()},  size -> ${this.size.toString()})`;
};

Rectangle.prototype.grow = function (factor) {
  this.size = this.size.multiplyByScalar(factor || 1);
  return this;
};

Rectangle.prototype.shrink = function (factor) {
  this.size = this.size.multiplyByScalar(1 / (factor || 1));
  return this;
};

Rectangle.prototype.growByValue = function (sizeToAdd) {
  this.size = this.size.add(sizeToAdd);
  return this;
};

Rectangle.prototype.shrinkByValue = function (sizeToSubtract) {
  this.size = this.size.add(-sizeToSubtract);
  return this;
};

Rectangle.makeFromCorners = function (corner1, corner2) {
  let bottomLeft = new Vector(
    Math.min(corner1.x, corner2.x),
    Math.min(corner1.y, corner2.y),
  );
  let topRight = new Vector(
    Math.max(corner1.x, corner2.x),
    Math.max(corner1.y, corner2.y),
  );
  return new Rectangle(
    Vector.makeMean(bottomLeft, topRight),
    topRight.subtract(bottomLeft),
  );
};

//create a new rectangle wich encloses all given rectangles
Rectangle.makeFromCollectionOfRectangles = function (rectangles) {
  Assert.assert(
    rectangles.length >= 1,
    "Rectangle.makeFromCollectionOfRectanglesToBeEnclosed error: less than two rectangles given",
  );

  if (rectangles.length === 1) return rectangles[0].clone();

  return rectangles.reduce(function (previousRectangle, currentRectangle) {
    //get bottom left of the bottom left rectangle and top right of the top right rectangle
    return Rectangle.makeFromCorners(
      Rectangle.makeFromCorners(
        previousRectangle.bottomLeft(),
        currentRectangle.bottomLeft(),
      ).bottomLeft(),
      Rectangle.makeFromCorners(
        previousRectangle.topRight(),
        currentRectangle.topRight(),
      ).topRight(),
    );
  });
};

Rectangle.pickGreaterX = function (rectangle1, rectangle2) {
  return rectangle1.getSize().x >= rectangle2.getSize().x
    ? rectangle1
    : rectangle2;
};

Rectangle.pickGreaterY = function (rectangle1, rectangle2) {
  return rectangle1.getSize().y >= rectangle2.getSize().y
    ? rectangle1
    : rectangle2;
};

Rectangle.pickSmallerX = function (rectangle1, rectangle2) {
  return rectangle1.getSize().x <= rectangle2.getSize().x
    ? rectangle1
    : rectangle2;
};

Rectangle.pickSmallerY = function (rectangle1, rectangle2) {
  return rectangle1.getSize().y <= rectangle2.getSize().y
    ? rectangle1
    : rectangle2;
};

Rectangle.sameSize = function (rectangle1, rectangle2) {
  return rectangle1.getSize().equal(rectangle2.getSize());
};

Rectangle.checkSeparated = function (rectangle1, rectangle2) {
  return !(
    rectangle1.checkInside(rectangle2) ||
    rectangle2.checkInside(rectangle1) ||
    rectangle2.checkIntersection(rectangle1)
  );
};

//alias to simplify rectangle creation
export function rect(centerX, centerY, sizeX, sizeY) {
  return new Rectangle(new Vector(centerX, centerY), new Vector(sizeX, sizeY));
}
