"use strict";

//Apply label to current image
//parameters is: {text: <value>, fontFace: <value>, backgroundColor: <value>, textColor: <value>}

export function Label(context, parameters) {
  let tmpCanvas = document.createElement("CANVAS");
  let rectangle = rect();
  tmpCanvas.width = context.canvas.width;
  tmpCanvas.height = context.canvas.height;
  let tmpContext = tmpCanvas.getContext("2d");
}
