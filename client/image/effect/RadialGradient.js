"use strict";

//parameters are:
//{
//  startColor: <color>,
//  endColor: <color>,
//  fillRect: [true|false]

export function RadialGradient(context, parameters) {
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
