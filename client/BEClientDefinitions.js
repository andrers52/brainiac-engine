"use strict";

let BEClientDefinitions = {};

BEClientDefinitions.CANVAS_ID = "gameCanvas";

BEClientDefinitions.LOADING_ANIMATION_ID = "loading_animation";
BEClientDefinitions.LOADING_ANIMATION_CLASS_NAME = "centered";

BEClientDefinitions.ANIMATION_INTERVAL = 90;

BEClientDefinitions.MOUSE_MOVE_PROPAGATION_LATENCY = 700;
BEClientDefinitions.MOUSE_DOWN_LATENCY = 500;

//No more changes to definitions outside here
Object.freeze(BEClientDefinitions);

export { BEClientDefinitions };
