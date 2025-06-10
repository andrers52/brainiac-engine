"use strict";

import { Assert, EFunction } from "arslib";
import { BECommonDefinitions } from "../../../common/BECommonDefinitions.js";

//executes action on mouse down and reverses on mouse up
export function ChangeOnMouseDown(changeAction = "shrink") {
  Assert.assertIsValidString(
    changeAction,
    ["grow", "shrink"],
    "ChangeOnMouseDown. Error: Non valid action",
  );

  this.isChangeableOnMouseDown = true;
  let isSelected = false;
  let originalSize;

  function executeChangeActionWhenMouseDown() {
    if (isSelected) {
      return this;
    }

    originalSize = this.getSize().clone();
    this.rectangle[changeAction](BECommonDefinitions.MOUSE_DOWN_CHANGE_FACTOR);
    isSelected = true;
    return this;
  }

  this.onMouseDownHit = EFunction.sequence(
    this.onMouseDownHit,
    executeChangeActionWhenMouseDown,
    this,
  );

  function returnToOriginalFormWhenMouseUp() {
    if (!isSelected) {
      return this;
    }
    this.setSize(originalSize);
    isSelected = false;
    return this;
  }

  this.onMouseUp = this.onMouseUp
    ? EFunction.sequence(this.onMouseUp, returnToOriginalFormWhenMouseUp, this)
    : returnToOriginalFormWhenMouseUp;

  this.onMouseUpHit = this.onMouseUp;
}
