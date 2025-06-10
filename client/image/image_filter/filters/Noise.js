"use strict";
export function Noise(imageData, factor) {
  factor = factor || 55; //default value
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
