"use strict";

import { Assert } from "arslib";
import { Rectangle, rect } from "../common/geometry/Rectangle.js";
import { Vector } from "../common/geometry/Vector.js";
import { resourceStore } from "./singleton/ResourceStore.js";

var textImageCache = {};

let TextToImage = {};

function getFontToFitTextOnRectangle(text, fontface, rectangle) {
  let context = screen.getContext("2d");

  // start with a large font size
  let fontsize = 300;
  let resultFont;

  // lower the font size until the text fits the rectangle
  do {
    fontsize--;
    resultFont = `${fontsize}px ${fontface}`;
    context.font = resultFont;
  } while (
    context.measureText(text).width >= rectangle.size.x ||
    fontsize >= rectangle.size.y
  );

  return resultFont;
}

TextToImage.fontToFontFace = function (font = "14px GoodDog") {
  return font.substring(font.indexOf(" "), font.lenght);
};

//draw text on created canvas
TextToImage.drawText = function (
  imageName,
  text,
  font,
  backgroundColor,
  textColor,
) {
  if (text === "") backgroundColor = "rgba(125, 125, 125, 0)";

  let context = resourceStore
    .retrieveResourceObject(imageName)
    .getContext("2d");
  //clear canvas
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  if (backgroundColor) {
    context.beginPath();
    context.rect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = backgroundColor;
    context.fill();
  }
  //draw from center (canvas translation)
  context.fillStyle = textColor;
  context.font = font;
  context.textBaseline = "bottom";
  context.textAlign = "center";
  context.fillText(text, context.canvas.width / 2, context.canvas.height);
};

TextToImage.createRectangleFromTextAndFont = function (font, text) {
  //text size area measuring (returns rectangle)
  Assert.assert(
    font,
    "TextToImage#createRectangleFromTextAndFont Error: expecting font parameter to measure",
  );
  Assert.assertIsLiteralString(
    font,
    "TextToImage#createRectangleFromTextAndFont Error: font is not a string literal",
  );
  let context = screen.getContext("2d");
  context.font = font;
  //look for number inside font string. since the world and canvas have the same resolution we should be fine.
  let height = parseInt(font.match(/\d+/)[0]);

  let width = context.measureText(text).width || 1; //1 is minimum
  return new Rectangle(null, new Vector(width, height));
};

TextToImage.createImageFromText = function (
  rectangle = rect(0, 0, 100, 100),
  text = "",
  fontface = "GoodDog",
  backgroundColor = "rgba(125, 125, 125, 0)",
  textColor = "black",
) {
  Assert.assertIsLiteralString(
    text,
    "BEClient.textToImagel Error: text is not a string literal",
  );

  if (text === "") return { imageName: null, font: null };

  //return cached image and font
  if (textImageCache[text]) return textImageCache[text];

  //duplicate size of the image that will contain the text.
  //This way it will be rescaled at draw and look smooth.
  let grownRectangle = rect(
    rectangle.center.x,
    rectangle.center.y,
    rectangle.size.x,
    rectangle.size.y,
  );
  grownRectangle.size.x *= 2;
  grownRectangle.size.y *= 2;

  let imageName = resourceStore.createNewImage(
    grownRectangle.size.x,
    grownRectangle.size.y,
    true,
  );
  let font = getFontToFitTextOnRectangle(text, fontface, grownRectangle);

  TextToImage.drawText(imageName, text, font, backgroundColor, textColor);

  let objToReturn = { imageName: imageName, font: font };
  //store image and font in cached
  textImageCache[text] = objToReturn;
  return objToReturn;
};

export { TextToImage };
