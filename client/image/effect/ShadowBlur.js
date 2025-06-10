"use strict";

//Apply shadowBlur to current image
//parameters is: {thickness: <value>, color: <value>}

export function ShadowBlur(context, parameters) {
  //save image with shadow to tmpCanvas
  let tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = context.canvas.width;
  tmpCanvas.height = context.canvas.height;
  let tmpContext = tmpCanvas.getContext("2d");

  //apply shadow
  context.shadowBlur = parameters.thickness;
  context.shadowColor = parameters.color;
  let scale = 0.9;
  let drawOffsetX = (context.canvas.width - context.canvas.width * scale) / 2;
  let drawOffsetY = (context.canvas.height - context.canvas.height * scale) / 2;
  tmpContext.scale(scale, scale); // shrink image a bit
  tmpContext.drawImage(context.canvas, drawOffsetX, drawOffsetY);

  //clear original image
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  //write shadowed image to original canvas
  context.drawImage(tmpCanvas, 0, 0);
}
