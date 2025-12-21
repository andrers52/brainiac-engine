'use strict';

/**
 * Inverts the colors of image data by subtracting each RGB value from 255
 * Creates a negative effect by inverting all color channels
 * @param {ImageData} imageData - The image data to invert
 * @returns {ImageData} The inverted image data
 */
export function Invert(imageData) {
  let pix = imageData.data;
  for (let i = 0, n = pix.length; i < n; i += 4) {
    pix[i] = 255 - pix[i];
    pix[i + 1] = 255 - pix[i + 1];
    pix[i + 2] = 255 - pix[i + 2];
    // alpha
  }

  return imageData;
}
