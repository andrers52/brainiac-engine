"use strict";

/**
 * Client-side definitions and constants for the Brainiac Engine
 * Contains configuration values for canvas, animations, and user interaction
 * @namespace
 */
let BEClientDefinitions = {};

/** @type {string} The ID for the main game canvas element */
BEClientDefinitions.CANVAS_ID = "gameCanvas";

/** @type {string} The ID for the loading animation element */
BEClientDefinitions.LOADING_ANIMATION_ID = "loading_animation";
/** @type {string} The CSS class name for centered loading animation */
BEClientDefinitions.LOADING_ANIMATION_CLASS_NAME = "centered";

/** @type {number} Animation interval in milliseconds */
BEClientDefinitions.ANIMATION_INTERVAL = 90;

/** @type {number} Mouse move event propagation latency in milliseconds */
BEClientDefinitions.MOUSE_MOVE_PROPAGATION_LATENCY = 16; // ~60 FPS for smooth dragging
/** @type {number} Mouse down event latency in milliseconds */
BEClientDefinitions.MOUSE_DOWN_LATENCY = 500;

//No more changes to definitions outside here
Object.freeze(BEClientDefinitions);

export { BEClientDefinitions };
