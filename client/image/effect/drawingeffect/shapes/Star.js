"use strict";

import { vect } from "../../../../../common/geometry/Vector.js";

/**
 * Creates a star shape effect on the canvas
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {number} center_x - X coordinate of the star center
 * @param {number} center_y - Y coordinate of the star center
 * @param {number} radius - Outer radius of the star
 * @param {number} points - Number of star points
 * @param {number} inset_radius_ratio - Fraction of radius for inset points [0,1)
 */
function starEffect(
  context,
  center_x,
  center_y,
  radius,
  points,
  inset_radius_ratio,
) {
  let lineWidth = 2;
  radius -= lineWidth;

  context.save();
  context.beginPath();
  context.translate(center_x, center_y);
  context.moveTo(0, 0 - radius);
  for (let i = 0; i < points; i++) {
    context.rotate(Math.PI / points);
    context.lineTo(0, 0 - radius * inset_radius_ratio);
    context.rotate(Math.PI / points);
    context.lineTo(0, 0 - radius);
  }

  context.lineWidth = lineWidth;
  context.restore();
}

/**
 * Draws a star shape on the canvas context
 * Creates a 5-pointed star centered on the canvas
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 */
export function Star(context) {
  let position = vect(context.canvas.width / 2, context.canvas.height / 2);
  let radius = Math.min(context.canvas.width, context.canvas.height) / 2;
  starEffect(context, position.x, position.y, radius, 5, 0.5);
}
