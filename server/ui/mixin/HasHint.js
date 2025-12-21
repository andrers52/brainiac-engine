'use strict';

import { EFunction } from 'arslib';
import { createLabel } from '../Label.js';

/**
 * @file Mixin that provides tooltip/hint functionality for UI widgets.
 * Creates floating text labels that follow the widget and provide contextual information.
 * @module HasHint
 */

/**
 * Mixin that adds hint/tooltip functionality to widgets.
 * Creates a text label that follows the widget and provides contextual information.
 * The hint is positioned above and to the right of the widget by default.
 *
 * @param {string} text - The hint text to display
 * @param {string} [font="GoodDog"] - The font family for the hint text
 *
 * @example
 * // Button with a hint
 * const button = createAgent("button.png", 100, 50);
 * HasHint.call(button, "Click me to continue", "Arial");
 *
 * @example
 * // Widget with default font hint
 * const widget = createWidget();
 * HasHint.call(widget, "This is a helpful hint");
 *
 * @requires The widget must have aggregateBehavior() and die() methods
 * @mixin
 */
export function HasHint(text, font = 'GoodDog') {
  /** @type {string} Font used for hint creation */
  let creationFont = font;

  /**
   * Behavior function that positions the hint relative to the widget.
   * Called continuously to keep the hint positioned correctly.
   * @private
   */
  function hintBehavior() {
    this.hint.moveRelativeToAgent(this, 'aboveRight', 10, true);
  }

  this.aggregateBehavior(hintBehavior);

  // function hintDie() {
  //   this.hint.die(true);
  // }
  //
  // this.die =
  //   EFunction.sequence(this.die, hintDie, this);

  /**
   * Sets or updates the hint text and font.
   * Creates a new hint label or updates the existing one if text has changed.
   * @memberof HasHint
   * @param {string} text - The new hint text
   * @param {string} [font=creationFont] - The font family for the hint. Uses creation font if not specified.
   */
  this.setHintText = function (text, font = creationFont) {
    if (this.hint && text === this.hint.getText()) return;
    if (this.hint) this.hint.die();
    this.hint = createLabel(this.beServer, null, text, font, 'white', 'Black');
    hintBehavior.bind(this)(); //call first time to avoid appearing at the center of screen
  };

  /**
   * Gets the current hint text.
   * @memberof HasHint
   * @returns {string} The current hint text
   */
  this.getHintText = function () {
    return this.hint.getText();
  };

  /** @type {Object} Reference to this widget */
  let self = this;

  /**
   * Cleans up the hint when the widget dies.
   * @private
   */
  function hintDie() {
    self.hint.die();
  }

  this.die = EFunction.sequence(this.die, hintDie, this);

  //initialization
  this.setHintText(text, font);
}
