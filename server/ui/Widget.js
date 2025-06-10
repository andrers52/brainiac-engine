"use strict";

import { Assert } from "arslib";
import { Vector } from "../../common/geometry/Vector.js";
// import {BECommonDefinitions} from '../../common/BECommonDefinitions.js'
import { createAgent, createAgentWithRectangle } from "../agent/Agent.js";

/* Base widget functionality */

function widgetInitialize() {
  this.isWidget = true;
  this.isSolid = false;
  return this;
}

function addVisibilityTestToCheckMove(camera) {
  let oldCheckMove = this.checkMove;
  this.checkMove = (distance) => {
    Assert.assert(
      distance instanceof Vector,
      "BEClient.Widget#checkMove: distance is not a Vector",
    );
    let testRectangle = this.rectangle.clone();
    testRectangle.move(distance);

    //hiting camera border or out of camera view?
    if (!camera.canBeSeen(testRectangle)) {
      return false;
    }

    //widget is visible, run default agent check
    return oldCheckMove.call(this, distance);
  };
}

//use this to create a new widget
export function createWidget(imageName, inputRectangle) {
  let widget = inputRectangle
    ? createAgentWithRectangle(imageName, inputRectangle)
    : createAgent(imageName);

  widgetInitialize.call(widget, imageName, inputRectangle);
  return widget;
}
