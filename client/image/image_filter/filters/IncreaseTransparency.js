"use strict";
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
