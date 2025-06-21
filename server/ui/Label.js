"use strict";

import { EObject } from "arslib";
import { rect } from "../../common/geometry/Rectangle.js";

import { createWidget } from "./Widget.js";

/**
 * @file Label UI component for displaying text in the Brainiac Engine.
 * Creates text labels with customizable fonts, colors, and backgrounds.
 * @module Label
 */

/**
 * Prototype object containing label-specific methods.
 * @namespace protoLabel
 */
let protoLabel = {
  /**
   * Gets the text content of the label.
   * @memberof protoLabel
   * @returns {string} The label's text content
   */
  getText() {
    return this.text;
  },

  /**
   * Returns the string representation of the label.
   * @memberof protoLabel
   * @returns {string} The label's text content
   */
  toString() {
    return this.getText();
  },
};

/**
 * Creates a text label widget with customizable appearance.
 * Labels are used to display text with specified fonts, colors, and backgrounds.
 * The rectangle size is automatically calculated based on text length if not provided.
 *
 * @param {Rectangle} [rectangle] - Rectangle defining position and size. Auto-calculated if not provided.
 * @param {string} [text=""] - The text content to display
 * @param {string} [fontFace="GoodDog"] - Font family name for the text
 * @param {string} [backgroundColor="rgba(125, 125, 125, 0)"] - Background color (transparent by default)
 * @param {string} [textColor="black"] - Text color
 * @returns {Object} The created label widget with text display capabilities
 *
 * @example
 * // Create a simple label with default styling
 * const label = createLabel(null, "Hello World!");
 *
 * @example
 * // Create a styled label with custom colors and font
 * const styledLabel = createLabel(
 *   rect(100, 50, 200, 30),
 *   "Game Title",
 *   "Arial",
 *   "blue",
 *   "white"
 * );
 *
 * @example
 * // Create a label for UI feedback
 * const statusLabel = createLabel(
 *   null,
 *   "Ready to play!",
 *   "Verdana",
 *   "rgba(0, 255, 0, 0.2)",
 *   "green"
 * );
 */
export function createLabel(
  beServer,
  rectangle,
  text = "",
  fontFace = "GoodDog",
  backgroundColor = "rgba(125, 125, 125, 0)",
  textColor = "black",
) {
  rectangle = rectangle || rect(0, 0, text.length * 5, 15);
  let label = createWidget(beServer, null, rectangle);
  EObject.extend(label, protoLabel);
  /** @type {string} The text content of the label */
  label.text = text;
  /** @type {string} Font family for the text */
  label.fontFace = fontFace;
  /** @type {string} Background color of the label */
  label.backgroundColor = backgroundColor;
  /** @type {string} Color of the text */
  label.textColor = textColor;

  return label;
}
