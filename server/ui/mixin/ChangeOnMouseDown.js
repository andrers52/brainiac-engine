"use strict";

import { Assert, EFunction } from "arslib";
import { BECommonDefinitions } from "../../../common/BECommonDefinitions.js";

/**
 * @file Mixin that provides visual feedback for mouse interactions.
 * Changes agent size on mouse down and reverts on mouse up.
 * @module ChangeOnMouseDown
 */

/**
 * Mixin that adds visual feedback for mouse down/up interactions.
 * Executes a change action (grow or shrink) on mouse down and reverses it on mouse up.
 * Useful for buttons and interactive UI elements.
 *
 * @param {string} [changeAction="shrink"] - The type of change action ("grow" or "shrink")
 *
 * @example
 * // Button that shrinks when clicked
 * const button = createAgent("button.png", 100, 50);
 * ChangeOnMouseDown.call(button, "shrink");
 *
 * @example
 * // Button that grows when clicked
 * const button = createAgent("button.png", 100, 50);
 * ChangeOnMouseDown.call(button, "grow");
 *
 * @throws {Error} If changeAction is not "grow" or "shrink"
 * @mixin
 */
export function ChangeOnMouseDown(changeAction = "shrink") {
  Assert.assertIsValidString(
    changeAction,
    ["grow", "shrink"],
    "ChangeOnMouseDown. Error: Non valid action",
  );

  /** @type {boolean} Flag indicating this agent can change on mouse down */
  this.isChangeableOnMouseDown = true;
  /** @type {boolean} Whether the agent is currently in selected state */
  let isSelected = false;
  /** @type {Vector} Original size before change action */
  let originalSize;

  /**
   * Executes the change action when mouse is pressed down.
   * @private
   * @returns {Object} This agent instance for method chaining
   */
  function executeChangeActionWhenMouseDown() {
    if (isSelected) {
      return this;
    }

    originalSize = this.getSize().clone();
    this.rectangle[changeAction](BECommonDefinitions.MOUSE_DOWN_CHANGE_FACTOR);
    isSelected = true;
    return this;
  }

  this.onMouseDownHit = this.onMouseDownHit
    ? EFunction.sequence(
        this.onMouseDownHit,
        executeChangeActionWhenMouseDown,
        this,
      )
    : executeChangeActionWhenMouseDown;

  /**
   * Returns the agent to its original form when mouse is released.
   * @private
   * @returns {Object} This agent instance for method chaining
   */
  function returnToOriginalFormWhenMouseUp() {
    if (!isSelected) {
      return this;
    }
    this.setSize(originalSize);
    isSelected = false;
    return this;
  }

  this.onMouseUp = this.onMouseUp
    ? EFunction.sequence(this.onMouseUp, returnToOriginalFormWhenMouseUp, this)
    : returnToOriginalFormWhenMouseUp;

  this.onMouseUpHit = this.onMouseUp;
}
