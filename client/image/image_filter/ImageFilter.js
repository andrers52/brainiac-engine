"use strict";

import { resourceStore } from "../../singleton/ResourceStore.js";

//http://www.html5rocks.com/en/tutorials/canvas/imagefilters/

//Receives an image name for image in resource store,
//creates another one, apply effects, store and return new name.
//If  applyOverOriginalImage is true no new image is created.
//ImageFiltersArray is and array of effects and arguments like effect1, arg1, effect2, arg2,...effectN, argN
//    If you need to pass more than one arg to effect, send an object.
//Each effect receives the image data and the declared argument (if any).
export function ImageFilter(
  imageName,
  applyOverOriginalImage,
  ...ImageFiltersArray
) {
  let newImageName = applyOverOriginalImage
    ? imageName
    : resourceStore.cloneImage(imageName);

  let imgd = resourceStore.getImageData(newImageName);

  //apply all effects
  //apply all drawings
  for (let i = 0; i < ImageFiltersArray.length; i = i + 2) {
    let arg =
      i + 1 < ImageFiltersArray.length ? ImageFiltersArray[i + 1] : null;
    imgd = ImageFiltersArray[i](imgd, arg);
  }

  resourceStore.setImageData(newImageName, imgd);

  return newImageName;
}

ImageFilter.tmpCanvas = document.createElement("canvas");
ImageFilter.tmpCtx = ImageFilter.tmpCanvas.getContext("2d");

ImageFilter.createImageData = function (w, h) {
  return this.tmpCtx.createImageData(w, h);
};

//adding support for convolute to be used by effects
ImageFilter.convolute = function (pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);
  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;
  // pad output by the convolution matrix
  var w = sw;
  var h = sh;
  var output = ImageFilter.createImageData(w, h);
  var dst = output.data;
  // go through the destination image pixels
  var alphaFac = opaque ? 1 : 0;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y * w + x) * 4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      var r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy * sw + scx) * 4;
            var wt = weights[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
            a += src[srcOff + 3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = a + alphaFac * (255 - a);
    }
  }
  return output;
};

if (!window.Float32Array) var Float32Array = Array;

ImageFilter.convoluteFloat32 = function (pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);

  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;

  var w = sw;
  var h = sh;
  var output = {
    width: w,
    height: h,
    data: new Float32Array(w * h * 4),
  };
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y * w + x) * 4;
      var r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
          var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
          var srcOff = (scy * sw + scx) * 4;
          var wt = weights[cy * side + cx];
          r += src[srcOff] * wt;
          g += src[srcOff + 1] * wt;
          b += src[srcOff + 2] * wt;
          a += src[srcOff + 3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = a + alphaFac * (255 - a);
    }
  }
  return output;
};
