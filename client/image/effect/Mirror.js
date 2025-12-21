'use strict';

import { Assert } from 'arslib';

/**
 * Flips an image horizontally and/or vertically on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
 * @param {HTMLCanvasElement|HTMLImageElement} image - The image to flip
 * @param {boolean} flipH - Whether to flip horizontally
 * @param {boolean} flipV - Whether to flip vertically
 */
function flipImage(ctx, image, flipH, flipV) {
  var scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
    scaleV = flipV ? -1 : 1, // Set verical scale to -1 if flip vertical
    posX = flipH ? image.width * -1 : 0, // Set x position to -100% if flip horizontal
    posY = flipV ? image.height * -1 : 0; // Set y position to -100% if flip vertical

  // flip image and save to tmpCanvas
  let tmpCanvas = document.createElement('CANVAS');
  tmpCanvas.width = image.width;
  tmpCanvas.height = image.height;
  let tmpContext = tmpCanvas.getContext('2d');
  tmpContext.save(); // Save the current state
  tmpContext.scale(scaleH, scaleV); // Set scale to flip the image
  tmpContext.drawImage(image, posX, posY, image.width, image.height); // draw the image

  //clear original image
  ctx.clearRect(0, 0, image.width, image.height);

  //write flipped image to original canvas
  ctx.drawImage(tmpCanvas, 0, 0);
}

/**
 * Applies mirror effect to flip an image horizontally and/or vertically
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {Object} parameters - Mirror configuration object
 * @param {boolean} [parameters.horizontal] - Whether to flip horizontally
 * @param {boolean} [parameters.vertical] - Whether to flip vertically
 */
export function Mirror(context, parameters) {
  Assert.assert(
    parameters &&
      (parameters.horizontal !== undefined ||
        parameters.vertical !== undefined),
    'Mirror Effect error: invalid parameters configuration.',
  );

  flipImage(
    context,
    context.canvas,
    parameters.horizontal,
    parameters.vertical,
  );
}
