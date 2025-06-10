"use strict";

import { EObject } from "arslib";
import { rect } from "../../common/geometry/Rectangle.js";

import { createWidget } from "./Widget.js";

let protoLabel = {
  getText() {
    return this.text;
  },

  toString() {
    return this.getText();
  },
};

//Define font by filling "rectangle" "fontFace".
export function createLabel(
  rectangle,
  text = "",
  fontFace = "GoodDog",
  backgroundColor = "rgba(125, 125, 125, 0)",
  textColor = "black",
) {
  rectangle = rectangle || rect(0, 0, text.length * 5, 15);
  let label = createWidget(null, rectangle);
  EObject.extend(label, protoLabel);
  label.text = text;
  label.fontFace = fontFace;
  label.backgroundColor = backgroundColor;
  label.textColor = textColor;

  return label;
}
