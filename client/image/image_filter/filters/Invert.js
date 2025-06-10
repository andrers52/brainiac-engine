"use strict";
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
