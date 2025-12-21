'use strict';

import { Assert } from 'arslib';
import { Vector, vect } from '../common/geometry/Vector.js';
import { CoordinatesConversion } from './CoordinatesConversion.js';

//generated events to be called on agents:
// Note: Hit events will be created by the
// environment and passed to the agents
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

/**
 * Handles user input events and converts them to game events
 * Manages mouse, keyboard, and touch events for the game engine
 * @constructor
 */
function UserEvents() {
  let self = this;
  let propagate = () => {}; // to be defined at start
  let camera = null; // to be defined at start
  let screen = null; // to be defined at start

  let mouseCanvasPosition = null;
  let mousePositionChanged = false;
  let lastPropagatedPosition = null; // Track last position we sent to avoid duplicate events
  let isMouseDown = false; // Track if mouse is currently down

  /**
   * Gets the current mouse position in world coordinates
   * @returns {Vector} The mouse position in world coordinates
   */
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

  /**
   * Gets the mouse position relative to the canvas from a mouse event
   * @param {MouseEvent|TouchEvent} event - The mouse or touch event
   * @returns {Vector} The mouse position in canvas coordinates
   */
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

  /**
   * Handles keyboard key down events
   * @param {KeyboardEvent} event - The keyboard event
   */
  function onKeyDown(event) {
    propagate('onKeyDown', event.key.replace(/\"/g, '')); //remove starting and trailling '"'
  }

  /**
   * Handles canvas resize events
   * @param {Event} event - The resize event
   */
  function onResizeCanvas(event) {
    if (!screen.getCanvas()) return;
    propagate(
      'onResizeCanvas',
      vect(screen.getCanvas().width, screen.getCanvas().height),
    );
  }

  /**
   * Handles mouse down events
   * @param {MouseEvent} event - The mouse event
   */
  function onMouseDown(event) {
    //if (navigator.userAgent.match(/Android/i)) {
    //event.preventDefault();
    //}
    isMouseDown = true; // Track that mouse is down
    propagate('onMouseDown', self.mouseWorldPosition());
    event.stopPropagation();
  }

  /**
   * Handles mouse up events
   * @param {MouseEvent} event - The mouse event
   */
  function onMouseUp(event) {
    mouseCanvasPosition = getMouseCanvasPosition(event);
    isMouseDown = false; // Track that mouse is up
    mousePositionChanged = false; // Stop any pending mouse moves
    propagate('onMouseUp', self.mouseWorldPosition());
  }

  /**
   * Handles mouse move events
   * @param {MouseEvent} event - The mouse event
   */
  function onMouseMove(event) {
    event.preventDefault();
    const newPosition = getMouseCanvasPosition(event);

    // Only set changed flag if position actually changed
    if (
      !mouseCanvasPosition ||
      newPosition.x !== mouseCanvasPosition.x ||
      newPosition.y !== mouseCanvasPosition.y
    ) {
      mouseCanvasPosition = newPosition;
      // Only mark as changed if mouse is down (for dragging) or if this is general movement tracking
      mousePositionChanged = true;
    }
  }

  /* enable/disable events */

  //map handlers to native events
  let eventsMapping = {
    // *** TODO: ADD EVENT SUBSCRIPTION PARAMETERS IN APP AND UNCOMMENT BELOW ***
    //"onKeyDown": ["window.onkeydown"],
    onResizeCanvas: ['window.onresize', 'window.onresize'],
    onMouseDown: ['window.onmousedown'], // Temporarily removed touchstart
    onMouseMove: ['window.onmousemove'], // Temporarily removed touchmove
    onMouseUp: ['window.onmouseup'], // Temporarily removed touchend and touchleave
  };

  /**
   * Enables a specific event handler
   * @param {string} handler - The name of the event handler to enable
   * @throws {Error} If handler is not a valid event handler name
   */
  this.enableEvent = function (handler) {
    Assert.assertIsValidString(
      handler,
      Object.keys(eventsMapping),
      'Non valid event handler',
    );

    eventsMapping[handler].forEach((event) => {
      eval(event + ' = ' + handler + ';');
    });
  };

  /**
   * Disables a specific event handler
   * @param {string} handler - The name of the event handler to disable
   * @throws {Error} If handler is not a valid event handler name
   */
  this.disableEvent = function (handler) {
    Assert.assertIsValidString(
      handler,
      Object.keys(eventsMapping),
      'Non valid event handler',
    );

    eventsMapping[handler].forEach((event) => eval(event + ' = null;'));
  };

  /**
   * Propagates mouse move events at regular intervals to avoid flooding
   */
  function propagateMouseMoveOnInterval() {
    if (mousePositionChanged) {
      const currentPosition = self.mouseWorldPosition();

      // Only propagate if the position actually changed from last propagated position
      if (
        !lastPropagatedPosition ||
        !currentPosition.equal(lastPropagatedPosition)
      ) {
        propagate('onMouseMove', currentPosition);
        lastPropagatedPosition = currentPosition.clone();
      }

      mousePositionChanged = false;
    }
  }

  /**
   * Starts the user events system
   * @param {number} mouseMovePropagationLatency - Interval for mouse move event propagation
   * @param {Function} propagateInput - Callback function to receive generated events
   * @param {Object} cameraInput - The camera object for coordinate conversion
   * @param {Screen} screenInput - The screen instance for canvas access
   */
  this.start = function (
    mouseMovePropagationLatency,
    propagateInput,
    cameraInput,
    screenInput,
  ) {
    camera = cameraInput;
    screen = screenInput;
    propagate = propagateInput;
    Object.keys(eventsMapping).forEach((handler) => this.enableEvent(handler));
    setInterval(propagateMouseMoveOnInterval, mouseMovePropagationLatency);
  };

  /**
   * Stops the user events system by disabling all event handlers
   */
  this.stop = function () {
    Object.keys(eventsMapping).forEach((handler) => this.disableEvent(handler));
  };

  // *** MOBILE SUPPORT ***
  window.addEventListener('scroll', preventMotion, false);
  window.addEventListener('touchmove', treatTouchMove, false);

  /**
   * Handles touch move events for mobile support
   * @param {TouchEvent} event - The touch event
   */
  function treatTouchMove(event) {
    event.preventDefault();
    mouseCanvasPosition = getMouseCanvasPosition(event);
    propagate('onMouseMove', self.mouseWorldPosition());
    preventMotion(event);
  }

  /**
   * Prevents unwanted scrolling and motion on mobile devices
   * @param {Event} event - The event to prevent
   */
  function preventMotion(event) {
    window.scrollTo(0, 0);
    event.preventDefault();
    event.stopPropagation();
  }
}

export { UserEvents };
