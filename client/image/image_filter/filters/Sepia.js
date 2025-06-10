"use strict";
export function Sepia(imageData) {
  let pix = imageData.data;
  for (let i = 0, n = pix.length; i < n; i += 4) {
    let avg = 0.3 * pix[i] + 0.59 * pix[i + 1] + 0.11 * pix[i + 2];
    pix[i] = avg + 100;
    pix[i + 1] = avg + 50;
    pix[i + 2] = avg;
    // alpha
  }

  return imageData;
}
