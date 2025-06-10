"use strict";

/**
 * Applies a text label to the current image
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {Object} parameters - Label configuration object
 * @param {string} parameters.text - The text to display
 * @param {string} [parameters.fontFace] - The font family to use
 * @param {string} [parameters.backgroundColor] - Background color for the label
 * @param {string} [parameters.textColor] - Color of the text
 */
export function Label(context, parameters) {
  let tmpCanvas = document.createElement("CANVAS");
  let rectangle = rect();
  tmpCanvas.width = context.canvas.width;
  tmpCanvas.height = context.canvas.height;
  let tmpContext = tmpCanvas.getContext("2d");
}
