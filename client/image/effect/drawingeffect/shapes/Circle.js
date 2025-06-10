"use strict";

//receives size and array of effects to use in order to create new image,
//store and return new name.
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
