'use strict';

/**
 * Increases transparency of image data by gradually reducing alpha values
 * Decreases the alpha channel by 1 for each non-transparent pixel
 * @param {ImageData} imageData - The image data to make more transparent
 * @returns {ImageData} The image data with increased transparency
 */
export function IncreaseTransparency(imageData) {
  let pix = imageData.data;
  for (let i = 0, n = pix.length; i < n; i += 4) {
    //just decrease alpha a bit
    if (pix[i + 3] > 0) {
      pix[i + 3] -= 1;
    }
  }

  return imageData;
}
