'use strict';

import { ImageFilter } from '../ImageFilter.js';
import { GrayScale } from './GrayScale.js';

/**
 * Applies a Sobel edge detection filter to image data
 * Detects edges by computing gradients in horizontal and vertical directions
 * Note: ImageData values are clamped between 0 and 255, so Float32Array is used
 * for gradient values because they range between -255 and 255
 * @param {ImageData} imageData - The image data to apply edge detection to
 * @returns {ImageData} The edge-detected image data with colored gradients
 */
export function Sobel(imageData) {
  var grayscale = GrayScale(imageData);
  // Note that ImageData values are clamped between 0 and 255, so we need
  // to use a Float32Array for the gradient values because they
  // range between -255 and 255.
  var vertical = ImageFilter.convolute(
    grayscale,
    [-1, 0, 1, -2, 0, 2, -1, 0, 1],
  );
  var horizontal = ImageFilter.convolute(
    grayscale,
    [-1, -2, -1, 0, 0, 0, 1, 2, 1],
  );
  var final_image = ImageFilter.createImageData(
    vertical.width,
    vertical.height,
  );
  for (var i = 0; i < final_image.data.length; i += 4) {
    // make the vertical gradient red
    var v = Math.abs(vertical.data[i]);
    final_image.data[i] = v;
    // make the horizontal gradient green
    var h = Math.abs(horizontal.data[i]);
    final_image.data[i + 1] = h;
    // and mix in some blue for aesthetics
    final_image.data[i + 2] = (v + h) / 4;
    final_image.data[i + 3] = 255; // opaque alpha
  }
  return final_image;
}
