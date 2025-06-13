"use strict";

/**
 * Applies a text label to the current image
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {Object} parameters - Label configuration object
 * @param {string} parameters.text - The text to display
 * @param {string} [parameters.fontFace="Arial"] - The font family to use
 * @param {string} [parameters.backgroundColor="rgba(0,0,0,0.5)"] - Background color for the label
 * @param {string} [parameters.textColor="white"] - Color of the text
 * @param {number} [parameters.fontSize=16] - Font size in pixels
 * @param {number} [parameters.x=10] - X position of the label
 * @param {number} [parameters.y=30] - Y position of the label
 */
export function Label(context, parameters) {
  if (!parameters || !parameters.text) {
    return;
  }

  // Set default values
  const fontFace = parameters.fontFace || "Arial";
  const backgroundColor = parameters.backgroundColor || "rgba(0,0,0,0.5)";
  const textColor = parameters.textColor || "white";
  const fontSize = parameters.fontSize || 16;
  const x = parameters.x !== undefined ? parameters.x : 10;
  const y = parameters.y !== undefined ? parameters.y : 30;

  // Save current context state
  context.save();

  // Set font
  context.font = `${fontSize}px ${fontFace}`;

  // Measure text
  const textMetrics = context.measureText(parameters.text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize; // Approximate height

  // Draw background rectangle
  context.fillStyle = backgroundColor;
  context.fillRect(x - 5, y - textHeight, textWidth + 10, textHeight + 5);

  // Draw text
  context.fillStyle = textColor;
  context.fillText(parameters.text, x, y);

  // Restore context state
  context.restore();
}
