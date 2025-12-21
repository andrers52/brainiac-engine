'use strict';

import { vect } from '../../../../../common/geometry/Vector.js';

/**
 * Draws a ship shape on the canvas context
 * Creates a triangular ship-like shape with yellow stroke
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 */
export function Ship(context) {
  //points in canvas orientation (inverted y)
  let padding = 30;
  let canvasTopLeft = vect(padding, padding);
  let inwardCenter = vect(
    context.canvas.width / 4 + padding / 4,
    context.canvas.height / 2,
  );
  let canvasBottomLeft = vect(padding, context.canvas.height - padding);
  let canvasRightCenter = vect(
    context.canvas.width - padding,
    context.canvas.height / 2,
  );

  context.beginPath();

  context.lineWidth = 2;
  // *** change to effect chain with shadowblur
  //context.lineJoin = context.lineCap = 'round';
  //context.shadowBlur = padding/4;
  //context.shadowColor = 'yellow';//'rgb(0, 0, 0)';
  //context.strokeStyle = context.strokeStyle || 'yellow';
  context.strokeStyle = 'yellow';

  context.moveTo(canvasTopLeft.x, canvasTopLeft.y);
  context.lineTo(canvasRightCenter.x, canvasRightCenter.y);
  context.lineTo(canvasBottomLeft.x, canvasBottomLeft.y);
  context.lineTo(inwardCenter.x, inwardCenter.y);
  context.lineTo(canvasTopLeft.x, canvasTopLeft.y);

  context.fill();
  context.stroke();
}
