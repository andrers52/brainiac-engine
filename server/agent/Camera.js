"use strict";

//external attributes:
//isCamera
//isvisible
//owner

import { Rectangle } from "../../common/geometry/Rectangle.js";
import { Vector } from "../../common/geometry/Vector.js";
import { createAgent } from "./Agent.js";

export function Camera(owner) {
  let camera = createAgent(null, 100, 100, false);

  camera.isCamera = true;
  camera.isVisible = false;
  camera.owner = owner;

  camera.onResizeCanvas = function () {
    screen.onResizeCanvas(); //let the screen change its size
  };

  camera.start = function (cameraSize, position) {
    camera.isSolid = false; //override agent definition
    camera.setPosition(position || new Vector(0, 0), true);
    camera.rectangle = new Rectangle(camera.getPosition(), cameraSize);
  };

  //a rectangle can be visible or invisible
  camera.canBeSeen = function (rectangle) {
    return camera.rectangle.checkHasCornerInside(rectangle);
  };

  return camera;
}
