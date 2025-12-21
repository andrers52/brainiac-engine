'use strict';
//TODO: THE WORLD, CAMERA AND CANVAS ARE THE SAME SIZE IN THIS VERSION.
//      FOR GAMES WHERE THE CAMERA MOVES IN THE WORLD WE NEED TO CHANGE THIS BY
//      CREATING THE WORLD SIZE, THE CAMERA SIZE AND APROPRIATE CONVERSIONS
//      http://stackoverflow.com/questions/8625208/working-with-canvas-in-different-screen-sizes
//      http://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
//      http://www.binarytides.com/make-html5-game-box2d-javascript-tutorial/

import { EObject } from 'arslib';
import { Rectangle } from '../common/geometry/Rectangle.js';
import { Vector } from '../common/geometry/Vector.js';

// *** TODO *** REMOVE THIS DEPENDENCY AND ADD SCREENSIZE AS A "setScreenSize(screenSize)"

/**
 * Utility for converting coordinates between canvas and world coordinate systems
 * Handles the transformation between different coordinate spaces in the game engine
 * @namespace
 */
let CoordinatesConversion = {};

/**
 * Converts canvas coordinates to world coordinates
 * @param {Vector} canvasPosition - Position in canvas coordinates
 * @param {Rectangle} cameraRectangle - The camera's rectangle in world space
 * @param {Vector} screenSize - The screen/canvas size
 * @returns {Vector} Position in world coordinates
 */
CoordinatesConversion.canvasToWorld = function (
  canvasPosition,
  cameraRectangle,
  screenSize,
) {
  let worldPosition = canvasPosition.clone();

  // *** CONVERT FROM CANVAS **
  //adjust from canvas orientation
  worldPosition.x -= screenSize.x / 2;
  worldPosition.y -= screenSize.y / 2;
  worldPosition.y *= -1;

  //convert from screen size to camera
  worldPosition = worldPosition.convert(screenSize, cameraRectangle.size);

  // *** CONVERT FROM CAMERA **
  worldPosition.x += cameraRectangle.center.x;
  worldPosition.y += cameraRectangle.center.y;

  return worldPosition;
};

/**
 * Converts a rectangle from canvas to world coordinates
 * @param {Rectangle} rectangle - The rectangle to be converted
 * @param {Rectangle} cameraRectangle - The camera's rectangle in world space
 * @param {Vector} screenSize - The screen/canvas size
 * @returns {Rectangle} The rectangle in world coordinates
 */
CoordinatesConversion.rectangleCanvasToWorld = function (
  rectangle,
  cameraRectangle,
  screenSize,
) {
  return Rectangle.makeFromCorners(
    CoordinatesConversion.canvasToWorld(
      rectangle.bottomLeft(),
      cameraRectangle,
      screenSize,
    ),
    CoordinatesConversion.canvasToWorld(
      rectangle.topRight(),
      cameraRectangle,
      screenSize,
    ),
  );
};

//destructive!
//   CoordinatesConversion.sizeFromWorldToCanvas = function (worldSize) {
//     return canvasSize.convert(worldSize, camera.rectangle.size);
//   };

/**
 * Converts world coordinates to canvas coordinates (destructive operation)
 * @param {Vector} worldPosition - Position in world coordinates
 * @param {Rectangle} cameraRectangle - The camera's rectangle in world space
 * @param {Vector} screenSize - The screen/canvas size
 * @param {boolean} [noCamera=false] - Whether to skip camera transformation
 * @returns {Vector} Position in canvas coordinates
 */
CoordinatesConversion.worldToCanvas = function (
  worldPosition,
  cameraRectangle,
  screenSize,
  noCamera = false,
) {
  let canvasPosition = worldPosition;

  // *** CONVERT TO CAMERA **
  if (!noCamera) {
    canvasPosition.x -= cameraRectangle.center.x;
    canvasPosition.y -= cameraRectangle.center.y;
  }

  //convert from camera to screen size
  let cameraSize = cameraRectangle.size;
  canvasPosition = canvasPosition.convert(cameraSize, screenSize);

  // *** CONVERT TO CANVAS **
  //adjust to canvas orientation and positioning
  canvasPosition.y *= -1;
  canvasPosition.x += screenSize.x / 2;
  canvasPosition.y += screenSize.y / 2;

  return canvasPosition;
};

/**
 * Converts a rectangle from world to canvas coordinates
 * @param {Rectangle} rectangle - The rectangle to convert
 * @param {Rectangle} cameraRectangle - The camera's rectangle in world space
 * @param {Vector} screenSize - The screen/canvas size
 * @param {boolean} [noCamera=false] - Whether to skip camera transformation
 * @returns {Rectangle} The rectangle in canvas coordinates
 */
CoordinatesConversion.rectangleWorldToCanvas = function (
  rectangle,
  cameraRectangle,
  screenSize,
  noCamera = false,
) {
  //*** TODO: SET/UNSET Z ON CONFIG FILE ***
  //NOTE: THIS IS THE ALTERNATIVE CODE NOT TAKING Z INTO ACCOUNT TO
  //      IMPROVE PERFORMANCE OF Z32. TO Z BE ACTIVATED THERE SHOULD BE
  //      A CONFIGURATION OPTION TO SELECT BETWEEN THE CODE RIGHT BELOW AND
  //      THE OTHER (COMMENTED) ALTERNATIVE.

  EObject.extend(rectangle, Rectangle.prototype);
  EObject.extend(rectangle.center, Vector.prototype);
  EObject.extend(rectangle.size, Vector.prototype);

  let canvasRectangle = rectangle.clone();
  canvasRectangle.center = CoordinatesConversion.worldToCanvas(
    canvasRectangle.center,
    cameraRectangle,
    screenSize,
    noCamera,
  );
  return canvasRectangle;
};

export { CoordinatesConversion };
