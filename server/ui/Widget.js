'use strict';

// import {BECommonDefinitions} from '../../common/BECommonDefinitions.js'
import { createAgent, createAgentWithRectangle } from '../agent/Agent.js';

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
 * Creates a new widget based on an agent with widget-specific properties.
 * Widgets are non-solid UI elements that can display images and handle user interactions.
 *
 * @param {Object} beServer - The BEServer instance
 * @param {string} imageName - Name of the image resource for the widget
 * @param {Rectangle} [inputRectangle] - Rectangle defining widget position and size
 * @returns {Object} The created widget with UI capabilities
 *
 * @example
 * // Create a simple widget
 * const widget = createWidget(beServer, "icon.png");
 *
 * @example
 * // Create a widget with specific dimensions
 * const panel = createWidget(beServer, "panel.png", rect(100, 100, 200, 150));
 *
 * @example
 * // Create a widget without an image (for invisible containers)
 * const container = createWidget(beServer, null, rect(0, 0, 300, 200));
 */
export function createWidget(beServer, imageName, inputRectangle) {
  let widget = inputRectangle
    ? createAgentWithRectangle(beServer, imageName, inputRectangle)
    : createAgent(beServer, imageName);

  widgetInitialize.call(widget, imageName, inputRectangle);
  return widget;
}
