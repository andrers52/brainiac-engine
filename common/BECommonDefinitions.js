"use strict";
let BECommonDefinitions = {};

BECommonDefinitions.MIN_SCREEN_DIMENSION = 900;
//left hand rule
BECommonDefinitions.CAMERA_Z_POSITION = 0;
BECommonDefinitions.MOUSE_Z_POSITION = 1;
BECommonDefinitions.TOP_AGENT_Z_POSITION = 2;
BECommonDefinitions.FOREGROUND_AGENT_Z_POSITION = 3;
BECommonDefinitions.INTERMEDIARY_AGENT_Z_POSITION = 4;
BECommonDefinitions.BACKGROUND_AGENT_Z_POSITION = 5;

BECommonDefinitions.WORLD_WIDTH = 12000;
BECommonDefinitions.WORLD_HEIGHT = BECommonDefinitions.WORLD_WIDTH;

BECommonDefinitions.CAMERA_WIDTH = 500;
BECommonDefinitions.CAMERA_HEIGHT = BECommonDefinitions.CAMERA_WIDTH;

BECommonDefinitions.BACK_BUTTON_IMAGE = "./be/media/images/button_close.png";
BECommonDefinitions.MOUSE_POINTER_IMAGE = "./be/media/images/mouse_pointer.png";
BECommonDefinitions.CONFIG_JSON = "./config/config.json";
BECommonDefinitions.COMMON_RESOURCES = [BECommonDefinitions.CONFIG_JSON];
// [BECommonDefinitions.BACK_BUTTON_IMAGE,
// BECommonDefinitions.MOUSE_POINTER_IMAGE,
//  BECommonDefinitions.CONFIG_JSON];

BECommonDefinitions.COMMON_EFFECTS_DESCRIPTION = {
  images: [
    {
      newImageName: "whiteParticle.jpg",
      size: {
        x: 30,
        y: 30,
      },
      effectsToApply: [
        {
          name: "RadialGradient",
          parameters: {
            startColor: "white",
            endColor: "black",
          },
        },
      ],
    },
    {
      newImageName: "redParticle.jpg",
      size: {
        x: 30,
        y: 30,
      },
      effectsToApply: [
        {
          name: "RadialGradient",
          parameters: {
            startColor: "red",
            endColor: "black",
          },
        },
      ],
    },
    {
      newImageName: "greenParticle.jpg",
      size: {
        x: 30,
        y: 30,
      },
      effectsToApply: [
        {
          name: "RadialGradient",
          parameters: {
            startColor: "green",
            endColor: "black",
          },
        },
      ],
    },
    {
      newImageName: "blueParticle.jpg",
      size: {
        x: 30,
        y: 30,
      },
      effectsToApply: [
        {
          name: "RadialGradient",
          parameters: {
            startColor: "blue",
            endColor: "black",
          },
        },
      ],
    },
    {
      newImageName: "triangle.jpg",
      size: {
        x: 100,
        y: 100,
      },
      opacity: 0.6,
      fillColor: "red",
      strokeColor: "yellow",
      effectsToApply: [
        {
          name: "Triangle",
          parameters: {},
        },
      ],
    },
    {
      newImageName: "star.jpg",
      size: {
        x: 100,
        y: 100,
      },
      fillColor: "grey",
      strokeColor: "grey",
      effectsToApply: [
        {
          name: "Star",
          parameters: {},
        },
      ],
    },
    {
      newImageName: "circle.jpg",
      size: {
        x: 100,
        y: 100,
      },
      fillColor: "red",
      strokeColor: "red",
      effectsToApply: [
        {
          name: "Circle",
          parameters: {},
        },
      ],
    },

    {
      newImageName: "dotted_black_background.jpg",
      size: {
        x: 1000,
        y: 1000,
      },
      fillColor: "grey",
      strokeColor: "white",
      effectsToApply: [
        {
          name: "DottedRectangle",
          parameters: {},
        },
      ],
    },
  ],
};

BECommonDefinitions.MOUSE_DOWN_CHANGE_FACTOR = 1.5;

BECommonDefinitions.AGENT_SELECTABLE_SIZE_CHANGE_FACTOR = 1.5;
BECommonDefinitions.AGENT_PRESSABLE_SIZE_CHANGE_FACTOR =
  BECommonDefinitions.AGENT_SELECTABLE_SIZE_CHANGE_FACTOR;

//need to call this to configure ports according to build type
BECommonDefinitions.start = function (config) {
  BECommonDefinitions.config = config;
  if (config.buildType === "deploy") {
    BECommonDefinitions.WEB_PORT = 80;
    //vultr
    BECommonDefinitions.WEB_SOCKET_ADDRESS_IP = "45.63.87.109";
    //BECommonDefinitions.WEB_SOCKET_ADDRESS_IP = 'z32.space'; // <- don't use this.
  } else {
    //'dev' -> working on the couch... :)
    BECommonDefinitions.WEB_PORT = 4000;
    BECommonDefinitions.WEB_SOCKET_ADDRESS_IP = "localhost";
  }

  BECommonDefinitions.WEB_SOCKET_ADDRESS = `http://${BECommonDefinitions.WEB_SOCKET_ADDRESS_IP}:${BECommonDefinitions.WEB_PORT}`;
};
//No more changes to definitions outside here
//Object.freeze(BECommonDefinitions);

export { BECommonDefinitions };
