"use strict";

import { Assert } from "arslib";
import { Vector, vect } from "../common/geometry/Vector.js";
import { CoordinatesConversion } from "./CoordinatesConversion.js";
import { screen } from "./singleton/Screen.js";

//generated events to be called on agents:
//onMouseDown(mouseWorldPosition)
//onMouseDownHit
//onMouseDownNoAgentHit
//onMouseUpNoAgentHit
//onMouseUp(mouseWorldPosition)
//onMouseUpHit
//onMouseMove(mouseWorldPosition)
//onMouseMoveHit
//onMouseMoveNoAgentHit
//onkeyDown(pressedkey);
//onResizeCanvas

function UserEvents() {
  let self = this;
  let propagate = () => {}; // to be defined at start
  let camera = null; // to be defined at start

  let mouseCanvasPosition = null;
  let mousePositionChanged = false;

  this.mouseWorldPosition = function () {
    // try {
    return CoordinatesConversion.canvasToWorld(
      mouseCanvasPosition,
      camera.rectangle,
      screen.getSize(),
    );
    // } catch (e) {
    //   return new Vector() //mouse out of canvas, canvas not ready... etc...
    // }
  };

  function getMouseCanvasPosition(event) {
    if (event.touches) {
      event.clientX = event.touches.item(0).clientX;
      event.clientY = event.touches.item(0).clientY;
    }

    // try {
    let rect = screen.getCanvas().getBoundingClientRect();
    //alert(event.touches.item(0));
    let resultVector = new Vector(
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
    // console.log(resultVector)
    return resultVector;
    // } catch (e) {
    //   console.log(`couldn't get mouse position. return 0`)
    //   return new Vector()
    // }
  }

  function onKeyDown(event) {
    propagate("onKeyDown", event.key.replace(/\"/g, "")); //remove starting and trailling '"'
  }

  function onResizeCanvas(event) {
    if (!screen.getCanvas()) return;
    propagate(
      "onResizeCanvas",
      vect(screen.getCanvas().width, screen.getCanvas().height),
    );
  }

  function onMouseDown(event) {
    //if (navigator.userAgent.match(/Android/i)) {
    //event.preventDefault();
    //}
    //onMouseMove(event); //needed for z32, review for other games...
    propagate("onMouseDown", self.mouseWorldPosition());
    event.stopPropagation();
  }

  function onMouseUp(event) {
    mouseCanvasPosition = getMouseCanvasPosition(event);
    propagate("onMouseUp", self.mouseWorldPosition());
  }

  function onMouseMove(event) {
    //if (navigator.userAgent.match(/Android/i)) {
    event.preventDefault();
    //}

    mouseCanvasPosition = getMouseCanvasPosition(event);
    mousePositionChanged = true;
  }

  /* enable/disable events */

  //map handlers to native events
  let eventsMapping = {
    // *** TODO: ADD EVENT SUBSCRIPTION PARAMETERS IN APP AND UNCOMMENT BELOW ***
    //"onKeyDown": ["window.onkeydown"],
    onResizeCanvas: ["window.onresize", "window.onresize"],
    onMouseDown: ["window.onmousedown", "window.touchstart"],
    onMouseMove: ["window.onmousemove", "window.touchmove"],
    onMouseUp: ["window.onmouseup", "window.touchend", "window.touchleave"],
  };

  this.enableEvent = function (handler) {
    Assert.assertIsValidString(
      handler,
      Object.keys(eventsMapping),
      "Non valid event handler",
    );

    eventsMapping[handler].forEach((event) =>
      eval(event + " = " + handler + ";"),
    );
  };

  this.disableEvent = function (handler) {
    Assert.assertIsValidString(
      handler,
      Object.keys(eventsMapping),
      "Non valid event handler",
    );

    eventsMapping[handler].forEach((event) => eval(event + " = null;"));
  };

  function propagateMouseMoveOnInterval() {
    if (mousePositionChanged) {
      propagate("onMouseMove", self.mouseWorldPosition());
      mousePositionChanged = false;
    }
  }

  // propagateInput is the callback function that will receive
  // the generated events. It's signature is: propagateInput(event, arg)
  this.start = function (
    mouseMovePropagationLatency,
    propagateInput,
    cameraInput,
  ) {
    camera = cameraInput;
    propagate = propagateInput;
    Object.keys(eventsMapping).forEach((handler) => this.enableEvent(handler));
    setInterval(propagateMouseMoveOnInterval, mouseMovePropagationLatency);
  };

  this.stop = function () {
    Object.keys(eventsMapping).forEach((handler) => this.disableEvent(handler));
  };

  // *** MOBILE SUPPORT ***
  window.addEventListener("scroll", preventMotion, false);
  window.addEventListener("touchmove", treatTouchMove, false);

  function treatTouchMove(event) {
    event.preventDefault();
    mouseCanvasPosition = getMouseCanvasPosition(event);
    propagate("onMouseMove", self.mouseWorldPosition());
    preventMotion(event);
  }

  function preventMotion(event) {
    window.scrollTo(0, 0);
    event.preventDefault();
    event.stopPropagation();
  }
}

export { UserEvents };
