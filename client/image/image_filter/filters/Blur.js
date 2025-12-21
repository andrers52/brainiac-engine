'use strict';

import { ImageFilter } from '../ImageFilter.js';

/**
 * Applies a blur effect to image data using a 3x3 convolution matrix
 * @param {ImageData} imageData - The image data to apply the blur effect to
 * @returns {ImageData} The blurred image data
 */
export function Blur(imageData) {
  return ImageFilter.convolute(imageData, [
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
  ]);
}
