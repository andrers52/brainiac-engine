'use strict';

/**
 * Adds random noise to image data by applying random variations to RGB channels
 * @param {ImageData} imageData - The image data to add noise to
 * @param {number} [factor=55] - The intensity factor for the noise effect
 * @returns {ImageData} The image data with added noise
 */
export function Noise(imageData, factor) {
  factor = factor !== undefined ? factor : 55; //default value
  let pix = imageData.data;
  for (let i = 0, n = pix.length; i < n; i += 4) {
    let rand = (0.5 - Math.random()) * factor;
    pix[i] += rand;
    pix[i + 1] += rand;
    pix[i + 2] += rand;
    // alpha
  }

  return imageData;
}
