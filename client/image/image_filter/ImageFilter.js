"use strict";

//http://www.html5rocks.com/en/tutorials/canvas/imagefilters/

/**
 * Applies multiple image filters to an image from the resource store
 * Receives an image name for image in resource store, creates another one, applies effects, stores and returns new name.
 * If applyOverOriginalImage is true no new image is created.
 * ImageFiltersArray is an array of effects and arguments like effect1, arg1, effect2, arg2,...effectN, argN
 * If you need to pass more than one arg to effect, send an object.
 * Each effect receives the image data and the declared argument (if any).
 *
 * @param {ResourceStore} resourceStore - The resource store instance
 * @param {string} imageName - The name of the image in the resource store
 * @param {boolean} applyOverOriginalImage - Whether to modify the original image or create a new one
 * @param {...*} ImageFiltersArray - Variable arguments containing filter functions and their parameters
 * @returns {string} The name of the processed image
 */
export function ImageFilter(
  resourceStore,
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

/** @type {HTMLCanvasElement} Temporary canvas for image operations */
ImageFilter.tmpCanvas = null;
/** @type {CanvasRenderingContext2D} Temporary canvas context for image operations */
ImageFilter.tmpCtx = null;

/**
 * Initializes the temporary canvas and context if not already done
 * @private
 */
function initTempCanvas() {
  if (ImageFilter.tmpCanvas) return;

  // Check if we're in a browser environment
  if (typeof document !== "undefined") {
    ImageFilter.tmpCanvas = document.createElement("canvas");
    ImageFilter.tmpCtx = ImageFilter.tmpCanvas.getContext("2d");
  } else {
    // In Node.js environment, we can't create real canvas elements
    // This is acceptable since image filtering is typically a client-side operation
    console.warn(
      "ImageFilter: Running in Node.js environment, canvas operations will be limited",
    );
    return;
  }
}

/**
 * Creates ImageData with specified dimensions
 * @param {number} w - Width of the image data
 * @param {number} h - Height of the image data
 * @returns {ImageData} New ImageData object
 */
ImageFilter.createImageData = function (w, h) {
  initTempCanvas();
  if (!this.tmpCtx || typeof this.tmpCtx.createImageData !== "function") {
    // Fallback for Node.js environment or when createImageData is not available
    return {
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4),
    };
  }
  return this.tmpCtx.createImageData(w, h);
};

/**
 * Applies convolution filter to image data using a weight matrix
 * Adding support for convolute to be used by effects
 * @param {ImageData} pixels - The source image data
 * @param {number[]} weights - The convolution matrix weights (should be square array)
 * @param {boolean} [opaque] - Whether to treat the image as opaque
 * @returns {ImageData} The convolved image data
 */
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

/** Fallback for browsers without Float32Array support */
if (typeof globalThis !== "undefined" && globalThis.Float32Array) {
  var Float32Array = globalThis.Float32Array;
} else if (typeof window !== "undefined" && window.Float32Array) {
  var Float32Array = window.Float32Array;
} else {
  var Float32Array = Array;
}

/**
 * Applies convolution filter to image data using Float32Array for extended range
 * Similar to convolute but uses Float32Array to handle values outside 0-255 range
 * @param {ImageData} pixels - The source image data
 * @param {number[]} weights - The convolution matrix weights (should be square array)
 * @param {boolean} [opaque] - Whether to treat the image as opaque
 * @returns {Object} Object with width, height, and Float32Array data
 */
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
