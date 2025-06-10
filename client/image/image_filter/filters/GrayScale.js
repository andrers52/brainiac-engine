"use strict";
export function GrayScale(imageData) {
  let pix = imageData.data;
  for (let i = 0, n = pix.length; i < n; i += 4) {
    let grayscale = pix[i] * 0.3 + pix[i + 1] * 0.59 + pix[i + 2] * 0.11;
    pix[i] = grayscale; // red
    pix[i + 1] = grayscale; // green
    pix[i + 2] = grayscale; // blue
    // alpha
  }

  return imageData;
}
