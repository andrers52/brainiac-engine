'use strict';

/**
 * @file Camera system for the Brainiac Engine.
 * Provides viewport functionality for tracking and viewing agents in the game world.
 * @module Camera
 */

/**
 * External attributes set on camera agents:
 * - isCamera: Identifies the agent as a camera
 * - isVisible: Controls camera visibility (usually false)
 * - owner: Reference to the agent that owns this camera
 */

import { Rectangle } from '../../common/geometry/Rectangle.js';
import { Vector } from '../../common/geometry/Vector.js';
import { createAgent } from './Agent.js';

/**
 * Creates a camera agent for viewing and tracking other agents.
 * Cameras are special non-solid, invisible agents that define viewports.
 *
 * @param {Object} owner - The agent that owns this camera
 * @returns {Object} The created camera agent with camera-specific methods
 *
 * @example
 * const player = createAgent("player.png", 50, 50);
 * const playerCamera = Camera(player);
 * playerCamera.start(new Vector(800, 600), player.getPosition());
 */
export function Camera(beServer, owner) {
  let camera = createAgent(beServer, null, 100, 100, false);

  /** @type {boolean} Identifies this agent as a camera */
  camera.isCamera = true;
  /** @type {boolean} Cameras are typically invisible */
  camera.isVisible = false;
  /** @type {Object} Reference to the agent that owns this camera */
  camera.owner = owner;

  /**
   * Handles canvas resize events.
   * @memberof Camera
   */
  camera.onResizeCanvas = function () {
    // Camera resize handling - this is handled on the client side
  };

  /**
   * Initializes the camera with size and position.
   * @memberof Camera
   * @param {Vector} cameraSize - Size of the camera viewport
   * @param {Vector} [position] - Initial position of the camera. Defaults to (0,0)
   */
  camera.start = function (cameraSize, position) {
    camera.isSolid = false; //override agent definition
    camera.setPosition(position || new Vector(0, 0), true);
    camera.rectangle = new Rectangle(camera.getPosition(), cameraSize);
  };

  /**
   * Checks if a rectangle can be seen by this camera.
   * Uses corner intersection to determine visibility.
   * @memberof Camera
   * @param {Rectangle} rectangle - The rectangle to test for visibility
   * @returns {boolean} True if the rectangle has at least one corner inside camera view
   */
  camera.canBeSeen = function (rectangle) {
    return camera.rectangle.checkHasCornerInside(rectangle);
  };

  return camera;
}
