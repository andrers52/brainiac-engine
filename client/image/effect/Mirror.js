"use strict";

import { Assert } from "arslib";

function flipImage(ctx, image, flipH, flipV) {
  var scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
    scaleV = flipV ? -1 : 1, // Set verical scale to -1 if flip vertical
    posX = flipH ? image.width * -1 : 0, // Set x position to -100% if flip horizontal
    posY = flipV ? image.height * -1 : 0; // Set y position to -100% if flip vertical

  // flip image and save to tmpCanvas
  let tmpCanvas = document.createElement("CANVAS");
  tmpCanvas.width = image.width;
  tmpCanvas.height = image.height;
  let tmpContext = tmpCanvas.getContext("2d");
  tmpContext.save(); // Save the current state
  tmpContext.scale(scaleH, scaleV); // Set scale to flip the image
  tmpContext.drawImage(image, posX, posY, image.width, image.height); // draw the image

  //clear original image
  ctx.clearRect(0, 0, image.width, image.height);

  //write flipped image to original canvas
  ctx.drawImage(tmpCanvas, 0, 0);
}

//flip an image horizontally and/or vertically
//parameters is: {horizontal: [true|false], vertical: [true|false]}
export function Mirror(context, parameters) {
  Assert.assert(
    parameters &&
      (parameters.horizontal !== undefined ||
        parameters.vertical !== undefined),
    "Mirror Effect error: invalid parameters configuration.",
  );

  flipImage(
    context,
    context.canvas,
    parameters.horizontal,
    parameters.vertical,
  );
}
