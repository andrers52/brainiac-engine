"use strict";

/**
 * Applies a color tint to image data by adding color values to each pixel
 * @param {ImageData} imageData - The image data to colorize
 * @param {Object} color - The color object containing RGB values
 * @param {number} color.red - Red component value to add
 * @param {number} color.green - Green component value to add
 * @param {number} color.blue - Blue component value to add
 * @returns {ImageData} The colorized image data
 * @throws {Error} If color parameter is not provided
 */
export function Colorize(imageData, color) {
  Assert.assert(color, "The colorize effect needs a color. Not found");

  let pix = imageData.data;
  for (let i = 0, n = pix.length; i < n; i += 4) {
    pix[i] = pix[i] + color.red;
    pix[i + 1] = pix[i + 1] + color.green;
    pix[i + 2] = pix[i + 3] + color.blue;
    // alpha
  }

  return imageData;
}
