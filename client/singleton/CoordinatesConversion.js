'use strict'
//TODO: THE WORLD, CAMERA AND CANVAS ARE THE SAME SIZE IN THIS VERSION.
//      FOR GAMES WHERE THE CAMERA MOVES IN THE WORLD WE NEED TO CHANGE THIS BY
//      CREATING THE WORLD SIZE, THE CAMERA SIZE AND APROPRIATE CONVERSIONS
//      http://stackoverflow.com/questions/8625208/working-with-canvas-in-different-screen-sizes
//      http://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
//      http://www.binarytides.com/make-html5-game-box2d-javascript-tutorial/

import EObject from '../../../arslib/enhancements/e-object.js'
import Vector from '../../common/geometry/Vector.js'
import Rectangle from '../../common/geometry/Rectangle.js'

// *** TODO *** REMOVE THIS DEPENDENCY AND ADD SCREENSIZE AS A "setScreenSize(screenSize)"
import screen from './Screen.js'

function CoordinatesConversion() {
  let camera
  this.start = function(cameraInput) {
    camera = cameraInput
  }

  this.canvasToWorld = function(canvasPosition) {
    let worldPosition = canvasPosition.clone()
    let cameraRectangle = camera.rectangle

    let screenSize = screen.getSize()
    let cameraSize = cameraRectangle.size


    // *** CONVERT FROM CANVAS **
    //adjust from canvas orientation
    worldPosition.x -= screenSize.x/2
    worldPosition.y -= screenSize.y/2
    worldPosition.y *= -1

    //convert from screen size to camera
    worldPosition =
    worldPosition.convert(screenSize, cameraSize)   


    // *** CONVERT FROM CAMERA **
    worldPosition.x += cameraRectangle.center.x
    worldPosition.y += cameraRectangle.center.y

    return worldPosition
  }

  this.rectangleCanvasToWorld = function(rectangle) {
    return Rectangle.makeFromCorners(
      this.canvasToWorld(rectangle.bottomLeft()),
      this.canvasToWorld(rectangle.topRight()))
  }

  //destructive!
  this.sizeFromWorldToCanvas = function(worldSize) {
    let cameraRectangle = camera.rectangle
    let canvasSize = worldSize
    let screenSize = screen.getSize()
    let cameraSize = cameraRectangle.size
    canvasSize =
    canvasSize.convert(cameraSize, screenSize)
    return canvasSize
  }

  //destructive!
  this.worldToCanvas = function(worldPosition, noCamera = false) {
    let cameraRectangle = 
      camera.rectangle

    let canvasPosition = worldPosition

    // *** CONVERT TO CAMERA **
    if(!noCamera) {  
      canvasPosition.x -= cameraRectangle.center.x
      canvasPosition.y -= cameraRectangle.center.y
    }

    //convert from camera to screen size
    let screenSize = screen.getSize()
    let cameraSize = cameraRectangle.size
    canvasPosition =
    canvasPosition.convert(cameraSize, screenSize)  

    // *** CONVERT TO CANVAS **
    //adjust to canvas orientation and positioning
    canvasPosition.y *= -1
    canvasPosition.x += screenSize.x/2
    canvasPosition.y += screenSize.y/2

    return canvasPosition
  }

  this.rectangleWorldToCanvas = function(rectangle, noCamera = false) {
  //*** TODO: SET/UNSET Z ON CONFIG FILE ***
  //NOTE: THIS IS THE ALTERNATIVE CODE NOT TAKING Z INTO ACCOUNT TO
  //      IMPROVE PERFORMANCE OF Z32. TO Z BE ACTIVATED THERE SHOULD BE
  //      A CONFIGURATION OPTION TO SELECT BETWEEN THE CODE RIGHT BELOW AND
  //      THE OTHER (COMMENTED) ALTERNATIVE.


    EObject.extend(rectangle, Rectangle.prototype)
    EObject.extend(rectangle.center, Vector.prototype)
    EObject.extend(rectangle.size, Vector.prototype)
  
    let canvasRectangle = rectangle.clone()
    canvasRectangle.center = 
    this.worldToCanvas(canvasRectangle.center)
    return canvasRectangle

  }

}

let coordinatesConversion = new CoordinatesConversion()
export default coordinatesConversion