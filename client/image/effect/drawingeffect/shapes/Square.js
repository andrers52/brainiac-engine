'use strict';

import { vect } from '../../../../../common/geometry/Vector.js';

/**
 * Draws a square shape on the canvas context
 * Creates a square with specified line width and dimensions
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 */
export function Square(context) {
  let lineWidth = 2;
  let size = (context.canvas.width + context.canvas.height) / 2;
  //needed due to y inversion on world/canvas
  let canvasRectTopLeft = vect(0, 0);

  context.beginPath();
  context.rect(
    canvasRectTopLeft.x + lineWidth,
    canvasRectTopLeft.y + lineWidth,
    size - lineWidth * 2,
    size - lineWidth * 2,
  );

  context.lineWidth = lineWidth;
}
