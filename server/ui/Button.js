"use strict";

import { EFunction } from "arslib";
import { createWidget } from "./Widget.js";
import { ChangeOnMouseDown } from "./mixin/ChangeOnMouseDown.js";

/**
 * @file Button UI component for the Brainiac Engine.
 * Creates interactive button widgets with click handling and visual feedback.
 * @module Button
 */

/**
 * Creates an interactive button widget with click handling and visual feedback.
 * The button automatically shrinks when clicked and executes the provided action.
 *
 * @param {string} imageName - Name of the image resource for the button
 * @param {Rectangle} inputRectangle - Rectangle defining the button's position and size
 * @param {Function} onMouseDownHit - Function to execute when the button is clicked
 * @returns {Object} The created button widget with click handling capabilities
 *
 * @example
 * // Create a simple button
 * const button = createButton("button.png", rect(100, 100, 80, 40), () => {
 *   console.log("Button clicked!");
 * });
 *
 * @example
 * // Create a button with complex action
 * const menuButton = createButton("menu_btn.png", rect(0, 0, 120, 50), function() {
 *   this.gameState.showMenu();
 *   this.playSoundInClient("click.wav");
 * });
 */
export function createButton(imageName, inputRectangle, onMouseDownHit) {
  let button = createWidget(imageName, inputRectangle);

  button.onMouseDownHit = button.onMouseDownHit
    ? EFunction.sequence(button.onMouseDownHit, onMouseDownHit, button)
    : onMouseDownHit;
  ChangeOnMouseDown.call(button, "shrink");
  return button;
}
