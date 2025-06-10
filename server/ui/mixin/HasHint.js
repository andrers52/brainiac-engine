"use strict";

import { EFunction } from "arslib";
import { createLabel } from "../Label.js";

//Represents the widget's property of showing a text that is attached to it

export function HasHint(text, font = "GoodDog") {
  let creationFont = font;

  function hintBehavior() {
    this.hint.moveRelativeToAgent(this, "aboveRight", 10, true);
  }

  this.aggregateBehavior(hintBehavior);

  // function hintDie() {
  //   this.hint.die(true);
  // }
  //
  // this.die =
  //   EFunction.sequence(this.die, hintDie, this);

  this.setHintText = function (text, font = creationFont) {
    if (this.hint && text === this.hint.getText()) return;
    if (this.hint) this.hint.die();
    this.hint = createLabel(null, text, font, "white", "Black");
    hintBehavior.bind(this)(); //call first time to avoid appearing at the center of screen
  };

  this.getHintText = function () {
    return this.hint.getText();
  };

  //kills hint when dying
  let self = this;
  function hintDie() {
    self.hint.die();
  }
  this.die = EFunction.sequence(this.die, hintDie, this);

  //initialization
  this.setHintText(text, font);
}
