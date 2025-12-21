'use strict';

/**
 * Common definitions and constants for the Brainiac Engine
 * Contains configuration values, dimensions, and shared resources
 * @namespace
 */
let BECommonDefinitions = {};

/** @type {number} Minimum screen dimension in pixels */
BECommonDefinitions.MIN_SCREEN_DIMENSION = 900;

//left hand rule
/** @type {number} Camera Z position in 3D space */
BECommonDefinitions.CAMERA_Z_POSITION = 0;
/** @type {number} Mouse cursor Z position in 3D space */
BECommonDefinitions.MOUSE_Z_POSITION = 1;
/** @type {number} Top layer agent Z position in 3D space */
BECommonDefinitions.TOP_AGENT_Z_POSITION = 2;
/** @type {number} Foreground agent Z position in 3D space */
BECommonDefinitions.FOREGROUND_AGENT_Z_POSITION = 3;
/** @type {number} Intermediary agent Z position in 3D space */
BECommonDefinitions.INTERMEDIARY_AGENT_Z_POSITION = 4;
/** @type {number} Background agent Z position in 3D space */
BECommonDefinitions.BACKGROUND_AGENT_Z_POSITION = 5;

/** @type {number} World width in units */
BECommonDefinitions.WORLD_WIDTH = 12000;
/** @type {number} World height in units (same as width) */
BECommonDefinitions.WORLD_HEIGHT = BECommonDefinitions.WORLD_WIDTH;

/** @type {number} Camera viewport width */
BECommonDefinitions.CAMERA_WIDTH = 500;
/** @type {number} Camera viewport height (same as width) */
BECommonDefinitions.CAMERA_HEIGHT = BECommonDefinitions.CAMERA_WIDTH;

/** @type {string} Path to back button image resource */
BECommonDefinitions.BACK_BUTTON_IMAGE = './be/media/images/button_close.png';
/** @type {string} Path to mouse pointer image resource */
BECommonDefinitions.MOUSE_POINTER_IMAGE = './be/media/images/mouse_pointer.png';
/** @type {string} Path to configuration JSON file */
BECommonDefinitions.CONFIG_JSON = './config/config.json';
/** @type {string[]} Array of common resource paths */
BECommonDefinitions.COMMON_RESOURCES = [BECommonDefinitions.CONFIG_JSON];
// [BECommonDefinitions.BACK_BUTTON_IMAGE,
// BECommonDefinitions.MOUSE_POINTER_IMAGE,
//  BECommonDefinitions.CONFIG_JSON];

/**
 * Configuration object for common visual effects
 * Defines particle effects, shapes, and background patterns
 * @type {Object}
 */
BECommonDefinitions.COMMON_EFFECTS_DESCRIPTION = {
  images: [
    {
      newImageName: 'whiteParticle.jpg',
      size: {
        x: 30,
        y: 30,
      },
      effectsToApply: [
        {
          name: 'RadialGradient',
          parameters: {
            startColor: 'white',
            endColor: 'black',
          },
        },
      ],
    },
    {
      newImageName: 'redParticle.jpg',
      size: {
        x: 30,
        y: 30,
      },
      effectsToApply: [
        {
          name: 'RadialGradient',
          parameters: {
            startColor: 'red',
            endColor: 'black',
          },
        },
      ],
    },
    {
      newImageName: 'greenParticle.jpg',
      size: {
        x: 30,
        y: 30,
      },
      effectsToApply: [
        {
          name: 'RadialGradient',
          parameters: {
            startColor: 'green',
            endColor: 'black',
          },
        },
      ],
    },
    {
      newImageName: 'blueParticle.jpg',
      size: {
        x: 30,
        y: 30,
      },
      effectsToApply: [
        {
          name: 'RadialGradient',
          parameters: {
            startColor: 'blue',
            endColor: 'black',
          },
        },
      ],
    },
    {
      newImageName: 'triangle.jpg',
      size: {
        x: 100,
        y: 100,
      },
      opacity: 0.6,
      fillColor: 'red',
      strokeColor: 'yellow',
      effectsToApply: [
        {
          name: 'Triangle',
          parameters: {},
        },
      ],
    },
    {
      newImageName: 'star.jpg',
      size: {
        x: 100,
        y: 100,
      },
      fillColor: 'grey',
      strokeColor: 'grey',
      effectsToApply: [
        {
          name: 'Star',
          parameters: {},
        },
      ],
    },
    {
      newImageName: 'circle.jpg',
      size: {
        x: 100,
        y: 100,
      },
      fillColor: 'red',
      strokeColor: 'red',
      effectsToApply: [
        {
          name: 'Circle',
          parameters: {},
        },
      ],
    },

    {
      newImageName: 'dotted_black_background.jpg',
      size: {
        x: 1000,
        y: 1000,
      },
      fillColor: 'grey',
      strokeColor: 'white',
      effectsToApply: [
        {
          name: 'DottedRectangle',
          parameters: {},
        },
      ],
    },
  ],
};

/** @type {number} Mouse down visual change factor */
BECommonDefinitions.MOUSE_DOWN_CHANGE_FACTOR = 1.5;

/** @type {number} Agent selectable size change factor */
BECommonDefinitions.AGENT_SELECTABLE_SIZE_CHANGE_FACTOR = 1.5;
/** @type {number} Agent pressable size change factor */
BECommonDefinitions.AGENT_PRESSABLE_SIZE_CHANGE_FACTOR =
  BECommonDefinitions.AGENT_SELECTABLE_SIZE_CHANGE_FACTOR;

/**
 * Initializes the BECommonDefinitions with configuration settings
 * Call this to configure ports according to build type
 * @param {Object} config - Configuration object containing build settings
 * @param {string} config.buildType - The build type ("deploy" or "dev")
 */
BECommonDefinitions.start = function (config) {
  BECommonDefinitions.config = config;
  if (config.buildType === 'deploy') {
    /** @type {number} Web server port for deployment */
    BECommonDefinitions.WEB_PORT = 80;
    //vultr
    /** @type {string} Web socket server IP address for deployment */
    BECommonDefinitions.WEB_SOCKET_ADDRESS_IP = '45.63.87.109';
    //BECommonDefinitions.WEB_SOCKET_ADDRESS_IP = 'z32.space'; // <- don't use this.
  } else {
    //'dev' -> working on the couch... :)
    /** @type {number} Web server port for development */
    BECommonDefinitions.WEB_PORT = 4000;
    /** @type {string} Web socket server IP address for development */
    BECommonDefinitions.WEB_SOCKET_ADDRESS_IP = 'localhost';
  }

  /** @type {string} Complete web socket address URL */
  BECommonDefinitions.WEB_SOCKET_ADDRESS = `http://${BECommonDefinitions.WEB_SOCKET_ADDRESS_IP}:${BECommonDefinitions.WEB_PORT}`;
};
//No more changes to definitions outside here
//Object.freeze(BECommonDefinitions);

export { BECommonDefinitions };
