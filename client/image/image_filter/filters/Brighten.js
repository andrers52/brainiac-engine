"use strict";
export function Brighten(imageData, BrightenAdjustment) {
  Assert.assert(
    BrightenAdjustment,
    "The Brighten effect needs a BrightenAdjustment property (0-255) argument. Not found",
  );

  let d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] += BrightenAdjustment;
    d[i + 1] += BrightenAdjustment;
    d[i + 2] += BrightenAdjustment;
  }

  return imageData;
}
