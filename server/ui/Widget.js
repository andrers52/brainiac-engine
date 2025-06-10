"use strict";

import { Assert } from "arslib";
import { Vector } from "../../common/geometry/Vector.js";
// import {BECommonDefinitions} from '../../common/BECommonDefinitions.js'
import { createAgent, createAgentWithRectangle } from "../agent/Agent.js";

/**
 * @file Base widget system for UI components in the Brainiac Engine.
 * Provides the foundation for all UI elements like buttons, labels, and controls.
 * @module Widget
 */

/**
 * Initializes widget-specific properties on an agent.
 * Sets the agent as non-solid and marks it as a widget.
 * @private
 * @returns {Object} This widget instance for method chaining
 */
function widgetInitialize() {
  /** @type {boolean} Identifies this agent as a widget */
  this.isWidget = true;
  /** @type {boolean} Widgets are non-solid by default (don't block movement) */
  this.isSolid = false;
  return this;
}

/**
 * Adds camera visibility testing to a widget's checkMove method.
 * Prevents widgets from moving outside the camera's visible area.
 * @private
 * @param {Camera} camera - The camera to test visibility against
 */
function addVisibilityTestToCheckMove(camera) {
  /** @type {Function} Original checkMove method */
  let oldCheckMove = this.checkMove;

  /**
   * Enhanced checkMove that includes camera visibility testing.
   * @param {Vector} distance - Distance vector to test
   * @returns {boolean|Vector} False if move is blocked, or allowed distance vector
   */
  this.checkMove = (distance) => {
    Assert.assert(
      distance instanceof Vector,
      "BEClient.Widget#checkMove: distance is not a Vector",
    );
    let testRectangle = this.rectangle.clone();
    testRectangle.move(distance);

    //hiting camera border or out of camera view?
    if (!camera.canBeSeen(testRectangle)) {
      return false;
    }

    //widget is visible, run default agent check
    return oldCheckMove.call(this, distance);
  };
}

/**
 * Creates a new widget based on an agent with widget-specific properties.
 * Widgets are non-solid UI elements that can display images and handle user interactions.
 *
 * @param {string} imageName - Name of the image resource for the widget
 * @param {Rectangle} [inputRectangle] - Rectangle defining widget position and size
 * @returns {Object} The created widget with UI capabilities
 *
 * @example
 * // Create a simple widget
 * const widget = createWidget("icon.png");
 *
 * @example
 * // Create a widget with specific dimensions
 * const panel = createWidget("panel.png", rect(100, 100, 200, 150));
 *
 * @example
 * // Create a widget without an image (for invisible containers)
 * const container = createWidget(null, rect(0, 0, 300, 200));
 */
export function createWidget(imageName, inputRectangle) {
  let widget = inputRectangle
    ? createAgentWithRectangle(imageName, inputRectangle)
    : createAgent(imageName);

  widgetInitialize.call(widget, imageName, inputRectangle);
  return widget;
}
