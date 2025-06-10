"use strict";

import { ImageFilter } from "../ImageFilter.js";

export function Blur(imageData) {
  return ImageFilter.convolute(imageData, [
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
  ]);
}
