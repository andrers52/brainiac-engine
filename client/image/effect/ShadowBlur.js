'use strict';

/**
 * Applies a shadow blur effect to the current image
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {Object} parameters - Shadow configuration object
 * @param {number} parameters.thickness - The blur radius for the shadow
 * @param {string} parameters.color - The color of the shadow
 */
export function ShadowBlur(context, parameters) {
  if (!parameters) {
    return;
  }

  //save image with shadow to tmpCanvas
  let tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = context.canvas.width;
  tmpCanvas.height = context.canvas.height;
  let tmpContext = tmpCanvas.getContext('2d');

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
