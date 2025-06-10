"use strict";

import { BECommonDefinitions } from "../../common/BECommonDefinitions.js";
import { Vector } from "../../common/geometry/Vector.js";
import { createLabel } from "./Label.js";

/**
 * @file Score UI component for displaying and managing numeric scores.
 * Provides a specialized label for game scores with increment/decrement functionality.
 * @module Score
 */

/**
 * Creates a score display widget that manages numeric values.
 * The score automatically updates its text representation and position when the value changes.
 * Positioned in the top-left corner of the screen by default.
 *
 * @param {number} [initial_value=0] - The starting score value
 * @returns {Object} The created score widget with value management methods
 *
 * @example
 * // Create a score starting at 0
 * const playerScore = createScore();
 * playerScore.increase(10); // Score becomes 10
 *
 * @example
 * // Create a score with initial value
 * const highScore = createScore(1000);
 * highScore.decrease(50); // Score becomes 950
 *
 * @example
 * // Create and manage a game score
 * const gameScore = createScore(0);
 * gameScore.increase(); // Increment by 1
 * gameScore.increase(5); // Increment by 5
 * console.log(gameScore.getCurrentValue()); // Get current value
 */
export function createScore(initial_value) {
  initial_value = initial_value || 0;
  /** @type {number} Current score value */
  let value = initial_value;
  /** @type {Object} The label widget that displays the score */
  let score = createLabel(initial_value.toString());

  /**
   * Positions the score label in the top-left corner of the screen.
   * @memberof Score
   */
  score.setPositionAccordingToText = function () {
    this.setPosition(
      new Vector(),
      "topLeft",
      BECommonDefinitions.FOREGROUND_AGENT_Z_POSITION,
    );
  };

  score.setPositionAccordingToText();

  /**
   * Increases the score by the specified amount.
   * @memberof Score
   * @param {number} [incValue=1] - Amount to increase the score. Defaults to 1 if not provided.
   * @returns {Object} This score instance for method chaining
   */
  score.increase = function (incValue) {
    !incValue ? value++ : (value += incValue);
    this.setText(value.toString());
    this.setPositionAccordingToText();
    return this;
  };

  /**
   * Decreases the score by the specified amount.
   * Will not go below 0.
   * @memberof Score
   * @param {number} [decValue=1] - Amount to decrease the score. Defaults to 1 if not provided.
   * @returns {Object} This score instance for method chaining
   */
  score.decrease = function (decValue) {
    if (value === 0) return;
    !decValue ? value-- : (value -= decValue);
    this.setText(value.toString());
    this.setPositionAccordingToText();
    return this;
  };

  /**
   * Gets the current score value.
   * @memberof Score
   * @returns {number} The current score value
   */
  score.getCurrentValue = function () {
    return value;
  };

  /**
   * Resets the score to 0.
   * @memberof Score
   * @returns {Object} This score instance for method chaining
   */
  score.reset = function () {
    value = 0;
    this.setText(value.toString());
    this.setPositionAccordingToText();
    return this;
  };

  return score;
}
