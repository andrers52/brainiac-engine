"use strict";

/**
 * Draws a dotted rectangle pattern on the canvas context
 * Creates a rectangle border with a grid of dots inside
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 */
export function DottedRectangle(context) {
  let lineWidth = 2;
  let numDotsPerWidth = 20;
  let numDotsPerHeight = 20;

  context.beginPath();
  context.lineWidth = lineWidth;
  context.rect(0, 0, context.canvas.width, context.canvas.height);
  context.fillStyle = "black";
  context.strokeStyle = "grey";

  //draw dots
  context.lineWidth = 1;
  for (
    var x = 0;
    x < context.canvas.width;
    x = x + context.canvas.width / numDotsPerWidth
  ) {
    for (
      var y = 0;
      y < context.canvas.height;
      y = y + context.canvas.height / numDotsPerHeight
    ) {
      context.rect(x, y, 1, 1);
    }
  }
  context.stroke();
}
