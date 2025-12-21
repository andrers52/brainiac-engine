'use strict';

import { vect } from '../../../../../common/geometry/Vector.js';

/**
 * Draws a triangle shape on the canvas context
 * Creates a right-pointing triangle using canvas coordinates
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 */
export function Triangle(context) {
  let lineWidth = 2;
  //points in canvas orientation (inverted y)
  let canvasTopLeft = vect(0, 0);
  let canvasBottomLeft = vect(0, context.canvas.height);
  let canvasRightCenter = vect(context.canvas.width, context.canvas.height / 2);

  context.beginPath();
  context.moveTo(canvasTopLeft.x, canvasTopLeft.y);
  context.lineTo(canvasBottomLeft.x, canvasBottomLeft.y);
  context.lineTo(canvasRightCenter.x, canvasRightCenter.y);
  context.lineTo(canvasTopLeft.x, canvasTopLeft.y);

  context.lineWidth = lineWidth;
}
