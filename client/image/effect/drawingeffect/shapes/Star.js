"use strict";

import { vect } from "../../../../../common/geometry/Vector.js";

//(context.canvas context, x of center, y of center, radius, number of points, fraction of radius for inset [0,1))
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

//receives size and array of effects to use in order to create new image,
//store and return new name.
export function Star(context) {
  let position = vect(context.canvas.width / 2, context.canvas.height / 2);
  let radius = Math.min(context.canvas.width, context.canvas.height) / 2;
  starEffect(context, position.x, position.y, radius, 5, 0.5);
}
