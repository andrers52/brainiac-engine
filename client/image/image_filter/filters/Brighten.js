'use strict';

import { Assert } from 'arslib';

/**
 * Brightens image data by adding a specified value to RGB channels
 * @param {ImageData} imageData - The image data to brighten
 * @param {number} BrightenAdjustment - The brightness adjustment value (0-255)
 * @returns {ImageData} The brightened image data
 * @throws {Error} If BrightenAdjustment parameter is not provided
 */
export function Brighten(imageData, BrightenAdjustment) {
  Assert.assert(
    BrightenAdjustment !== null && BrightenAdjustment !== undefined,
    'The Brighten effect needs a BrightenAdjustment property (0-255) argument. Not found',
  );

  let d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] += BrightenAdjustment;
    d[i + 1] += BrightenAdjustment;
    d[i + 2] += BrightenAdjustment;
  }

  return imageData;
}
