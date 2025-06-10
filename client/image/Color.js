"use strict";

/**
 * Represents a color with RGBA components
 * Creates a color object with validated RGB values and optional alpha
 * @param {number} [red=0] - Red component (0-255)
 * @param {number} [green=0] - Green component (0-255)
 * @param {number} [blue=0] - Blue component (0-255)
 * @param {number} [alpha=255] - Alpha component (0-255)
 * @constructor
 */
export function Color(red, green, blue, alpha) {
  const MIN_VALUE = 0;
  const MAX_VALUE = 255;

  /**
   * Adjusts a color component value to be within valid range (0-255)
   * @param {number} parameter - The value to adjust
   * @returns {number} The adjusted value within range
   */
  function adjustValue(parameter) {
    return parameter > MAX_VALUE
      ? MAX_VALUE
      : parameter < MIN_VALUE
      ? MIN_VALUE
      : parameter;
  }

  red = (red && adjustValue(red)) || 0;
  green = (green && adjustValue(green)) || 0;
  blue = (blue && adjustValue(blue)) || 0;
  alpha = alpha || alpha === 0 ? alpha : 255;

  /** @type {number} Red component (0-255) - read-only */
  Object.defineProperty(this, "red", { value: red, writable: false });
  /** @type {number} Green component (0-255) - read-only */
  Object.defineProperty(this, "green", { value: green, writable: false });
  /** @type {number} Blue component (0-255) - read-only */
  Object.defineProperty(this, "blue", { value: blue, writable: false });
  /** @type {number} Alpha component (0-255) - read-only */
  Object.defineProperty(this, "alpha", { value: alpha, writable: false });

  /**
   * Returns the RGB string representation of the color
   * @returns {string} RGB color string in format "rgb(r,g,b)"
   */
  this.toString = function () {
    return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
  };
}
