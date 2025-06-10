"use strict";
export function Color(red, green, blue, alpha) {
  const MIN_VALUE = 0;
  const MAX_VALUE = 255;

  function adjustValue(parameter) {
    return parameter > MAX_VALUE
      ? MAX_VALUE
      : parameter < MIN_VALUE
      ? MIN_VALUE
      : parameter;
  }

  red = (red && adjustValue(red)) || 0;
  green = (green && adjustValue(green)) || 0;
  blue = (blue && adjustValue(blue)) || 0;
  alpha = alpha || alpha === 0 ? alpha : 255;

  Object.defineProperty(this, "red", { value: red, writable: false });
  Object.defineProperty(this, "green", { value: green, writable: false });
  Object.defineProperty(this, "blue", { value: blue, writable: false });
  Object.defineProperty(this, "alpha", { value: alpha, writable: false });
  this.toString = function () {
    return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
  };
}
