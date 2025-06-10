"use strict";
import { Assert, Random } from "arslib";
import { Vector, vect } from "./Vector.js";

//Note: the operations are destructive! Use clone() for protection.
export function Rectangle(centerPoint = new Vector(), size = new Vector()) {
  this.center = centerPoint;
  this.size = size.abs();
}

Rectangle.prototype.getWidth = function () {
  return this.size.x;
};

Rectangle.prototype.getHeight = function () {
  return this.size.y;
};

Rectangle.prototype.getSize = function () {
  return this.size;
};

//Rectangle.prototype.area = function() {
//  //NOTE: THIS IS DONE THIS WAY TO ALLOW FUTURE CALCULATION OF AREA WHEN THE RECTANGLE IS NOT PARALLEL TO THE XY PLANE
//  let coordinates = [this.bottomLeft(), this.bottomRight(), this.topRight(), this.topLeft()];
//  let coordinatesArrayWithFirstPointAtOrigin = BEClient.Polygon.coordinatesArrayWithFirstPointAtOrigin(coordinates);
//  return Vector.parallelogramArea(coordinatesArrayWithFirstPointAtOrigin[1], coordinatesArrayWithFirstPointAtOrigin[3]);
//};

Rectangle.prototype.area = function () {
  return this.size.x * this.size.y;
};

Rectangle.prototype.diagonal = function () {
  return Math.sqrt(Math.pow(this.size.x, 2) + Math.pow(this.size.y, 2));
};

Rectangle.prototype.meanSize = function () {
  return (this.size.x + this.size.y) / 2;
};

Rectangle.prototype.minSize = function () {
  return Math.min(this.size.x, this.size.y);
};

Rectangle.prototype.maxSize = function () {
  return Math.max(this.size.x, this.size.y);
};

Rectangle.prototype.getCenter = function () {
  return this.center;
};

Rectangle.prototype.getPosition = function () {
  return this.center;
};

Rectangle.prototype.setSize = function (vector) {
  this.size = vector;
  return this;
};

Rectangle.prototype.setCenter = function (vector) {
  this.center = vector;
  return this;
};

Rectangle.prototype.setPosition = function (position) {
  this.center = position;
  return this;
};

Rectangle.prototype.setPosition2D = function (position) {
  let origCenter = this.center;
  this.center = position;
  return this;
};

//set rectangle's point of interest at position
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
      vectToAdd = vect(halfSize.x, -halfSize.y);
      break;
    case "topRight":
      vectToAdd = vect(-halfSize.x, -halfSize.y);
      break;
    case "bottomLeft":
      vectToAdd = vect(halfSize.x, halfSize.y);
      break;
    case "bottomRight":
      vectToAdd = vect(-halfSize.x, halfSize.y);
      break;
    case "bottomCenter":
      vectToAdd = vect(0, halfSize.y);
      break;
    case "topCenter":
      vectToAdd = vect(0, -halfSize.y);
      break;
    case "leftCenter":
      vectToAdd = vect(halfSize.x, 0);
      break;
    case "rightCenter":
      vectToAdd = vect(-halfSize.x, 0);
      break;
  }
  this.setCenter(position.add(vectToAdd));
  return this;
};

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

//Note: agents should not call it directly (or the client won't see. Use setPositionRelativeToAgent instead.
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

Rectangle.prototype.clone = function () {
  return new Rectangle(this.getCenter().clone(), this.getSize().clone());
};

Rectangle.prototype.checkPointInside = function (point) {
  let insideX = point.x >= this.topLeft().x && point.x <= this.topRight().x;
  if (!insideX) return false;
  let insideY = point.y <= this.topLeft().y && point.y >= this.bottomLeft().y;
  if (!insideY) return false;
  return true;
};

Rectangle.prototype.checkPointOutside = function (point) {
  let outsideX = point.x < this.topLeft().x || point.x > this.topRight().x;
  if (outsideX) return true;
  let outsideY = point.y > this.topLeft().y || point.y < this.bottomLeft().y;
  if (outsideY) return true;
  return false;
};

Rectangle.prototype.halfSize = function () {
  return new Vector(this.size.x / 2, this.size.y / 2);
};

Rectangle.prototype.getMaxX = function () {
  return this.center.x + this.halfSize().x;
};

Rectangle.prototype.getMinX = function () {
  return this.center.x - this.halfSize().x;
};

Rectangle.prototype.getMaxY = function () {
  return this.center.y + this.halfSize().y;
};

Rectangle.prototype.getMinY = function () {
  return this.center.y - this.halfSize().y;
};

Rectangle.prototype.topLeft = function () {
  return new Vector(this.getMinX(), this.getMaxY());
};

Rectangle.prototype.topRight = function () {
  return new Vector(this.getMaxX(), this.getMaxY());
};

Rectangle.prototype.bottomLeft = function () {
  return new Vector(this.getMinX(), this.getMinY());
};

Rectangle.prototype.bottomRight = function () {
  return new Vector(this.getMaxX(), this.getMinY());
};

Rectangle.prototype.bottomCenter = function () {
  return new Vector(this.center.x, this.getMinY());
};

Rectangle.prototype.topCenter = function () {
  return new Vector(this.center.x, this.getMaxY());
};

Rectangle.prototype.leftCenter = function () {
  return new Vector(this.getMinX(), this.center.y);
};

Rectangle.prototype.rightCenter = function () {
  return new Vector(this.getMaxX(), this.center.y);
};

Rectangle.prototype.convert = function (fromBaseSize, toBaseSize) {
  return new Rectangle(
    this.center.convert(fromBaseSize, toBaseSize),
    this.size.convert(fromBaseSize, toBaseSize),
  );
};

Rectangle.prototype.move = function (distance) {
  this.center.add(distance);
  return this;
};

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

//make rectangle square by making both dimensions equal to the lesser of them
Rectangle.prototype.reduceToSquare = function () {
  let minimumSize = Math.min(this.size.x, this.size.y);
  this.size = new Vector(minimumSize, minimumSize);
  return this;
};

//make rectangle square by making both dimensions equal to the greater of them
Rectangle.prototype.enlargeToSquare = function () {
  let maximumSize = Math.max(this.size.x, this.size.y);
  this.size = new Vector(maximumSize, maximumSize);
  return this;
};

//return vector with percentage of position inside rectangle, or null if outside
//input:
//(-rectangle.size.x/2,rectangle.size.y/2)    (rectangle.size.x/2,rectangle.size.y/2)
//
//(-rectangle.size.x/2,-rectangle.size.y/2)   (rectangle.size.x/2,-rectangle.size.y/2)
//output:
//(-100,100)    (100,100)
//
//(-100,-100)   (100,-100)
Rectangle.prototype.positionPercentage = function (position) {
  if (!this.checkPointInside(position)) return null;
  let rectBottomLeft = this.bottomLeft();
  let distanceFromBottomLeft = position.vectorDistance(rectBottomLeft).abs();
  let percentagePositionX = (distanceFromBottomLeft.x * 100) / this.size.x;
  let percentagePositionY = (distanceFromBottomLeft.y * 100) / this.size.y;
  return new Vector(percentagePositionX, percentagePositionY);
};

//return the position inside rectangle given the percentage vector from center
//input:
//(-100,100)    (100,100)
//
//(-100,-100)   (100,-100)
//output:
//(-rectangle.size.x/2,rectangle.size.y/2)    (rectangle.size.x/2,rectangle.size.y/2)
//
//(-rectangle.size.x/2,-rectangle.size.y/2)   (rectangle.size.x/2,-rectangle.size.y/2)
Rectangle.prototype.sizePercentageToPosition = function (percentage) {
  return new Vector(
    (this.size.x * percentage.x) / 100,
    (this.size.y * percentage.y) / 100,
  ).subtract(this.size.clone().divideByScalar(2));
};

Rectangle.prototype.checkInside = function (rectangle) {
  return (
    this.checkPointInside(rectangle.topLeft()) &&
    this.checkPointInside(rectangle.bottomRight()) &&
    this.checkPointInside(rectangle.topRight()) &&
    this.checkPointInside(rectangle.bottomLeft())
  );
};

Rectangle.prototype.checkHasCornerInside = function (rectangle) {
  return (
    this.checkPointInside(rectangle.topLeft()) ||
    this.checkPointInside(rectangle.bottomRight()) ||
    this.checkPointInside(rectangle.topRight()) ||
    this.checkPointInside(rectangle.bottomLeft())
  );
};

Rectangle.prototype.checkHasCornerOutside = function (rectangle) {
  return (
    this.checkPointOutside(rectangle.topLeft()) ||
    this.checkPointOutside(rectangle.bottomRight()) ||
    this.checkPointOutside(rectangle.topRight()) ||
    this.checkPointOutside(rectangle.bottomLeft())
  );
};

function intersectionWithCornerInside(rectangle1, rectangle2) {
  return (
    rectangle1.checkHasCornerInside(rectangle2) &&
    rectangle1.checkHasCornerOutside(rectangle2)
  );
}

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
