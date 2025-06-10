"use strict";

import { resourceStore } from "../../singleton/ResourceStore.js";

import { RadialGradient } from "./RadialGradient.js";
import { Circle } from "./drawingeffect/shapes/Circle.js";
import { DottedRectangle } from "./drawingeffect/shapes/DottedRectangle.js";
import { Ship } from "./drawingeffect/shapes/Ship.js";
import { Star } from "./drawingeffect/shapes/Star.js";
import { Triangle } from "./drawingeffect/shapes/Triangle.js";

//receives size and array of effects to use in order to create new image,
//store and return new name.

// All called effects will make a change to the created image.

//Args:
//imageName:  optional -> base image onto wich the effects will be applied.
//            If defined it will define the size of the resulting image.
//imageSize: optional -> size of new image.
//newImageName: optional -> name of newly created image. If null a new name will be provided.

//drawingEffectName is the effect name, like "Mirror"
//argsObj are the arguments expected by the effect, packaged as an object.
//combineOption is the composition method
//    [ "source-over" |
//      "source-in" |
//      "source-out" |
//      "source-atop" |
//      "destination-over" |
//      "destination-in" |
//      "destination-out" |
//      "destination-atop" |
//      "lighter" |
//      "copy" |
//      "xor" |
//      "multiply" |
//      "screen" |
//      "overlay" |
//      "darken" |
//      "lighten" |
//      "color-dodge" |
//      "color-burn"  |
//      "hard-light"  |
//      "soft-light"  |
//      "difference"  |
//      "exclusion" |
//      "hue" |
//      "saturation"  |
//      "color" |
//      "luminosity"
//      ]
// }
// combineOption is optional. If not provided the gradient will just be draw
// over the image (source-over)

function Effect(
  imageName,
  imageSize,
  opacity, //0.0 (fully transparent) and 1.0 (no transparency).
  fillColor,
  strokeColor,
  newImageName,
  drawingEffectName,
  argsObj,
  combineOption = "source-over",
) {
  //     Assert.assert(imageName || imageSize, "let Effect error: either imageName or imageSize must be defined.");
  //     Assert.assert(
  //       [ "source-over" ,
  //         "source-in" ,
  //         "source-out" ,
  //         "source-atop" ,
  //         "destination-over" ,
  //         "destination-in" ,
  //         "destination-out" ,
  //         "destination-atop" ,
  //         "lighter" ,
  //         "copy" ,
  //         "xor" ,
  //         "multiply" ,
  //         "screen" ,
  //         "overlay" ,
  //         "darken" ,
  //         "lighten" ,
  //         "color-dodge" ,
  //         "color-burn"  ,
  //         "hard-light"  ,
  //         "soft-light"  ,
  //         "difference"  ,
  //         "exclusion" ,
  //         "hue" ,
  //         "saturation"  ,
  //         "color" ,
  //         "luminosity"
  //         ].includes(combineOption),
  //       "let Effect error: invalid combineOption.");

  var image = imageName && resourceStore.retrieveResourceObject(imageName);

  //create canvas to hold the drawing
  let canvas = document.createElement("canvas");
  canvas.width = imageSize ? imageSize.x : image.width;
  canvas.height = imageSize ? imageSize.y : image.height;

  var context = canvas.getContext("2d");

  imageName && context.drawImage(image, 0, 0);

  //set defaults
  context.save();
  if (context.fillStyle === "#000000") context.fillStyle = "white";
  if (context.strokeStyle === "#000000") context.strokeStyle = "white";

  //apply effect
  if (opacity) context.globalAlpha = opacity;
  if (fillColor) context.fillStyle = fillColor;
  if (strokeColor) context.strokeStyle = strokeColor;
  if (combineOption) context.globalCompositeOperation = combineOption;

  switch (drawingEffectName) {
    case "RadialGradient":
      RadialGradient(context, argsObj);
      break;
    case "Ship":
      Ship(context, argsObj);
      break;
    case "Triangle":
      Triangle(context, argsObj);
      break;
    case "Star":
      Star(context, argsObj);
      break;
    case "Circle":
      Circle(context, argsObj);
      break;
    case "DottedRectangle":
      DottedRectangle(context, argsObj);
      break;
  }

  context.fill();
  context.stroke();
  context.restore();

  if (!imageName) {
    newImageName = newImageName || resourceStore.createNewImageName();
    resourceStore.addLocalResource(newImageName, canvas);
    return newImageName;
  }

  //overwrite old image
  resourceStore.addLocalResource(imageName, canvas);
  return imageName;
}

export { Effect };
