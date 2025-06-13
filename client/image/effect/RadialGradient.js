"use strict";

/**
 * Creates a radial gradient effect on the canvas
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {Object} parameters - Gradient configuration object
 * @param {string} parameters.startColor - The color at the center of the gradient
 * @param {string} parameters.endColor - The color at the edge of the gradient
 * @param {boolean} [parameters.fillRect] - Whether to fill the entire rectangle or just a circle
 * @param {string} [parameters.combineOption] - The global composite operation to use
 */
export function RadialGradient(context, parameters) {
  if (!parameters) {
    return;
  }

  var radgrad = context.createRadialGradient(
    context.canvas.width / 2,
    context.canvas.height / 2,
    0,
    context.canvas.width / 2,
    context.canvas.height / 2,
    parameters.fillRect
      ? Math.min(context.canvas.width, context.canvas.height)
      : Math.min(context.canvas.width / 2, context.canvas.height / 2),
  );

  radgrad.addColorStop(0, parameters.startColor);
  radgrad.addColorStop(1, parameters.endColor);

  context.globalCompositeOperation = parameters.combineOption;

  if (parameters.fillRect) {
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  } else {
    context.beginPath();
    context.arc(
      context.canvas.width / 2,
      context.canvas.height / 2,
      Math.min(context.canvas.width / 2, context.canvas.height / 2),
      0,
      Math.PI * 2,
    );
    context.closePath();
    context.fillStyle = radgrad;
    context.strokeStyle = "black";
    context.stroke();
    context.fill();
  }
}
