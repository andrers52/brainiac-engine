"use strict";
export function Colorize(imageData, color) {
  Assert.assert(color, "The colorize effect needs a color. Not found");

  let pix = imageData.data;
  for (let i = 0, n = pix.length; i < n; i += 4) {
    pix[i] = pix[i] + color.red;
    pix[i + 1] = pix[i + 1] + color.green;
    pix[i + 2] = pix[i + 3] + color.blue;
    // alpha
  }

  return imageData;
}
