"use strict";

import { BECommonDefinitions } from "../../common/BECommonDefinitions.js";
import { Vector } from "../../common/geometry/Vector.js";
import { createLabel } from "./Label.js";

export function createScore(initial_value) {
  initial_value = initial_value || 0;
  let value = initial_value;
  let score = createLabel(initial_value.toString());

  score.setPositionAccordingToText = function () {
    this.setPosition(
      new Vector(),
      "topLeft",
      BECommonDefinitions.FOREGROUND_AGENT_Z_POSITION,
    );
  };

  score.setPositionAccordingToText();

  score.increase = function (incValue) {
    !incValue ? value++ : (value += incValue);
    this.setText(value.toString());
    this.setPositionAccordingToText();
    return this;
  };

  score.decrease = function (decValue) {
    if (value === 0) return;
    !decValue ? value-- : (value -= decValue);
    this.setText(value.toString());
    this.setPositionAccordingToText();
    return this;
  };

  score.getCurrentValue = function () {
    return value;
  };

  score.reset = function () {
    value = 0;
    this.setText(value.toString());
    this.setPositionAccordingToText();
    return this;
  };

  return score;
}
