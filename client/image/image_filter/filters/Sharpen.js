import { ImageFilter } from '../ImageFilter.js';

('use strict');

/**
 * Applies a sharpen effect to image data using a 3x3 convolution matrix
 * Enhances edges and details in the image
 * @param {ImageData} imageData - The image data to sharpen
 * @returns {ImageData} The sharpened image data
 */
export function Sharpen(imageData) {
  return ImageFilter.convolute(imageData, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
}
