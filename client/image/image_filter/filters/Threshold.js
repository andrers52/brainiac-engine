"use strict";

/**
 * Applies a threshold effect to image data, converting to black and white
 * Pixels above the threshold become white (255), below become black (0)
 * @param {ImageData} imageData - The image data to apply threshold to
 * @param {number} threshold - The threshold value (0-255) for the conversion
 * @returns {ImageData} The thresholded black and white image data
 */
export function Threshold(imageData, threshold) {
  let d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    var r = d[i];
    var g = d[i + 1];
    var b = d[i + 2];
    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  return imageData;
}
