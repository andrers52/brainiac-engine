'use strict';

/**
 * Draws a circle shape on the canvas context
 * Receives canvas context and draws a circle centered on the canvas
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 */
export function Circle(context) {
  let lineWidth = 2;
  let radius =
    Math.min(context.canvas.width, context.canvas.height) / 2 - lineWidth; //-lineWidth to avoid being cut at the sides

  context.beginPath();
  context.arc(
    context.canvas.width / 2,
    context.canvas.height / 2,
    radius,
    0,
    2 * Math.PI,
  );
  context.closePath();

  context.lineWidth = lineWidth;
}
