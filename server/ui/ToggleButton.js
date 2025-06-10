"use strict";

import { EFunction } from "arslib";
import { ChangesImageWithState } from "../agent/mixin/ChangesImageWithState.js";
import { createButton } from "./Button.js";

export function createToggleButton(
  selectedImageName,
  deselectedImageName,
  inputRectangle,
  selectedAction,
  deselectedAction,
  checked,
  selectedAudio,
  deselectedAudio,
) {
  //let timeToReturnToNormalInMillis = 400;

  //initialSelect?
  //initialSelect && flag.changeState("selected");

  //Not setting the button action. Will be set below
  let toggleButton = createButton(
    checked ? selectedImageName : deselectedImageName,
    inputRectangle,
    null,
  );

  let toggleButtonConfiguration = {
    defaultState: checked ? "selected" : "deselected",
    states: [
      {
        stateName: "selected",
        image: selectedImageName,
        audioName: selectedAudio ? selectedAudio : null,
      },
      {
        stateName: "deselected",
        image: deselectedImageName,
        audioName: deselectedAudio ? deselectedAudio : null,
      },
    ],
  };

  ChangesImageWithState.call(toggleButton, toggleButtonConfiguration);

  function onMouseDownHitActionOnlyWhenStateIsDeselected() {
    if (toggleButton.currentState === "deselected") {
      selectedAction && selectedAction.call(this);
      toggleButton.changeState("selected");
      return toggleButton;
    }

    deselectedAction && deselectedAction.call(toggleButton);
    toggleButton.changeState("deselected");
    return toggleButton;
  }

  // ** NOT WORKING (?!) **
  ////disable onMouseUp handler call it after onMouseDownHit time delay
  //let onMouseUpOrig = this.onMouseUp;
  //this.onMouseUp = function() {};
  //let self = this;
  //function mouseUpWithDelay() {
  //  setInterval(function(){onMouseUpOrig.call(self);}, timeToReturnToNormalInMillis);
  //};

  toggleButton.deselect = function () {
    this.changeState("deselected");
  };
  toggleButton.select = function () {
    this.changeState("selected");
  };

  toggleButton.onMouseDownHit = EFunction.sequence(
    toggleButton.onMouseDownHit,
    onMouseDownHitActionOnlyWhenStateIsDeselected,
    this,
  );
  //mouseUpWithDelay]);

  toggleButton.isSelected = function () {
    return this.currentState === "selected";
  };
  return toggleButton;
}
