"use strict";

import { Assert } from "arslib";
import { rect } from "../../common/geometry/Rectangle.js";
import { Vector, vect } from "../../common/geometry/Vector.js";
import { BEClientDefinitions } from "../BEClientDefinitions.js";
import { CoordinatesConversion } from "../CoordinatesConversion.js";
import { TextToImage } from "../TextToImage.js";

/**
 * @fileoverview Screen management system for canvas rendering and game presentation.
 * Handles canvas creation, resizing, agent rendering, background drawing, and animation loops.
 */

/**
 * Screen constructor - Manages the game canvas and rendering operations.
 * Provides functionality for drawing agents, backgrounds, and managing the game presentation loop.
 * @constructor
 */
function Screen() {
  let canvas;
  let context;
  let backgroundImage;
  let presentationLoopId;
  let worldRectangle;
  let canvasId;
  let camera;
  let minScreenDimension;
  let resourceStore;
  let particlesContainer;

  /**
   * @memberof Screen
   * @type {number}
   * @description Zoom out factor for scaling display elements.
   */
  this.zoomOutFactor = 1;

  let onBeforeDrawAgent;
  let onAfterDrawAgent;
  let onAfterDrawScreen;
  let getVisibleAgents;

  /**
   * Creates and adds the canvas element to the DOM.
   */
  function addCanvas() {
    if (document.getElementById(canvasId)) return;

    canvas = document.createElement("canvas");
    canvas.id = canvasId;
    document.body.appendChild(canvas);
    canvas.focus();
  }

  /**
   * Hides the canvas from view.
   * @memberof Screen
   */
  this.hideCanvas = function () {
    canvas.style.visibility = "hidden";
  };

  /**
   * Shows the canvas.
   * @memberof Screen
   */
  this.showCanvas = function () {
    canvas.style.visibility = "visible";
  };

  /**
   * Gets the 2D rendering context of the canvas.
   * @memberof Screen
   * @returns {CanvasRenderingContext2D} The canvas 2D context.
   */
  this.getContext = function () {
    return context;
  };

  /**
   * Sets the background image for the screen.
   * @memberof Screen
   * @param {string} imageName - Name of the background image resource.
   */
  this.setBackgroundImageName = function (imageName) {
    backgroundImage =
      !!imageName && resourceStore.retrieveResourceObject(imageName);
  };

  /**
   * Calculates the zoom out factor based on minimum screen dimension requirements.
   * @returns {number} The calculated zoom out factor.
   */
  function defineZoomOutFactor() {
    let resultFactor;
    let screenSize = screen.getSize();

    Assert.assert(screenSize.x, "screen not ready!");

    if (
      screenSize.x >= minScreenDimension &&
      screenSize.y >= minScreenDimension
    ) {
      resultFactor = 1;
      return resultFactor;
    }
    let minScreenSize = Math.min(screenSize.x, screenSize.y);
    resultFactor = minScreenDimension / minScreenSize;
    return resultFactor;
  }

  /**
   * Initializes the screen with configuration parameters and sets up the canvas.
   * @memberof Screen
   * @param {Object} config - Screen configuration object.
   * @param {Function} config.onBeforeDrawAgentInput - Callback before drawing each agent.
   * @param {Function} config.onAfterDrawAgentInput - Callback after drawing each agent.
   * @param {Function} config.onAfterDrawScreenInput - Callback after drawing the screen.
   * @param {number} config.minScreenDimensionInput - Minimum screen dimension requirement.
   * @param {Function} config.getVisibleAgentsInput - Function to get visible agents.
   * @param {Object} config.cameraInput - Camera object reference.
   * @param {string} config.canvasIdInput - ID for the canvas element.
   * @param {number} config.worldWidth - Width of the game world.
   * @param {number} config.worldHeight - Height of the game world.
   * @param {ResourceStore} config.resourceStoreInput - Resource store instance.
   * @param {ParticlesContainer} config.particlesContainerInput - Particles container instance.
   */
  this.start = function ({
    onBeforeDrawAgentInput,
    onAfterDrawAgentInput,
    onAfterDrawScreenInput,
    minScreenDimensionInput,
    getVisibleAgentsInput,
    cameraInput, // pointer! Same object will be used by BEClient
    canvasIdInput,
    worldWidth,
    worldHeight,
    resourceStoreInput,
    particlesContainerInput,
  }) {
    getVisibleAgents = getVisibleAgentsInput;
    onBeforeDrawAgent = onBeforeDrawAgentInput;
    onAfterDrawAgent = onAfterDrawAgentInput;
    onAfterDrawScreen = onAfterDrawScreenInput;
    minScreenDimension = minScreenDimensionInput;
    camera = cameraInput;
    canvasId = canvasIdInput;
    resourceStore = resourceStoreInput;
    particlesContainer = particlesContainerInput;
    worldRectangle = rect(0, 0, worldWidth, worldHeight);

    addCanvas();

    this.adjustCanvasToWindowSize();

    //attempt orientation lock
    //this.lockOrientation()

    context = canvas.getContext("2d");

    camera.rectangle.size = this.setCameraSizeToCanvas();
    particlesContainer.start(camera, resourceStore);
  };

  /**
   * Sets the world size to match the camera size.
   * @memberof Screen
   */
  this.setWorldToCameraSize = function () {
    worldRectangle.size = camera.rectangle.size.clone();
  };

  /**
   * Sets the camera size to match the canvas size with zoom factor.
   * @memberof Screen
   * @returns {Vector} The camera rectangle size.
   */
  this.setCameraSizeToCanvas = function () {
    camera.rectangle.size = this.getSize().multiplyByScalar(this.zoomOutFactor);
    return camera.rectangle.size;
  };

  /**
   * Gets the canvas element.
   * @memberof Screen
   * @returns {HTMLCanvasElement} The canvas element.
   */
  this.getCanvas = function () {
    return canvas;
  };

  /**
   * Adjusts canvas dimensions to match window size and updates zoom factor.
   * @memberof Screen
   */
  this.adjustCanvasToWindowSize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    screen.zoomOutFactor = defineZoomOutFactor();
  };

  /**
   * Gets the canvas element (duplicate method for compatibility).
   * @memberof Screen
   * @returns {HTMLCanvasElement} The canvas element.
   */
  this.getCanvas = function () {
    return canvas;
  };

  /**
   * Gets the size of the canvas as a Vector.
   * @memberof Screen
   * @returns {Vector} Canvas dimensions.
   */
  this.getSize = function () {
    return new Vector(canvas.width, canvas.height);
  };

  /**
   * Gets the canvas as a rectangle starting at origin.
   * @memberof Screen
   * @returns {Rectangle} Canvas rectangle.
   */
  this.getRectangle = function () {
    return rect(0, 0, canvas.width, canvas.height);
  };

  /**
   * Clears the canvas with a black background.
   */
  function clear() {
    context.save();
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }

  /**
   * Draws an agent's image on the canvas with proper transformations.
   * @param {Object} agent - Agent object to draw.
   * @param {Rectangle} canvasRectangle - Canvas coordinates for drawing.
   */
  function drawAgentImage(agent, canvasRectangle) {
    context.save();

    agent.opacity &&
      agent.opacity !== 0 &&
      (context.globalAlpha = agent.opacity);
    //rotate around image center
    context.translate(canvasRectangle.center.x, canvasRectangle.center.y);
    //angle increases counter clockwise in our system, while canvas is clockwise

    //atan2 is clockwise and canvas is counter clockwise.
    let imageOrientation = 2 * Math.PI - agent.orientation;

    context.rotate(imageOrientation);
    canvasRectangle.size.divideByScalar(screen.zoomOutFactor);
    context.translate(-canvasRectangle.size.x / 2, -canvasRectangle.size.y / 2);

    //give game client a chance to decorate the image with game specific effects
    onBeforeDrawAgent &&
      onBeforeDrawAgent(agent, imageOrientation, context, canvasRectangle);

    context.globalCompositeOperation = "lighter";
    //draw from center (canvas translation)
    //Note: this was added because Firefox generetes an error drawing the mouse hint.
    // Perhaps we need to wait for the canvas to be ready before using it...
    try {
      context.drawImage(
        resourceStore.resources[agent.imageName],
        0,
        0,
        canvasRectangle.size.x,
        canvasRectangle.size.y,
      );
    } catch (e) {
      console.log("Screen#drawAgentImage error: " + e);
    }

    //give game client a chance to decorate the image with game specific effects
    onAfterDrawAgent &&
      onAfterDrawAgent(agent, imageOrientation, context, canvasRectangle);

    context.restore();
  }

  /**
   * Draws the background image with proper camera transformations.
   */
  function drawBackground() {
    if (!camera) return;
    let imageRectangle = rect(
      0,
      0,
      backgroundImage.width,
      backgroundImage.height,
    );

    let cameraInWorldTopLeftdistance = worldRectangle
      .topLeft()
      .vectorDistance(camera.rectangle.topLeft())
      .abs();

    //convert camera from world to backgroundImage
    let cameraRectangleInImage = camera.rectangle.convert(
      worldRectangle.size,
      imageRectangle.size,
    );

    //sx,sy
    let cameraInImageTopLeftdistance = cameraInWorldTopLeftdistance.convert(
      worldRectangle.size,
      imageRectangle.size,
    );

    //void ctx.drawImage(backgroundImage, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    context.drawImage(
      backgroundImage,
      cameraInImageTopLeftdistance.x,
      cameraInImageTopLeftdistance.y,
      cameraRectangleInImage.size.x,
      cameraRectangleInImage.size.y,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }

  /**
   * Creates an image from text for agents that have text but no image.
   * @param {Object} agent - Agent object with text properties.
   */
  function createImageFromTextForAgent(agent) {
    //try to localize the text
    // NOTE: not using localization for now...
    // let localizedText = BEClient.localization.getLocalizedText(agent.text)
    let localizedText = agent.text;
    //had to change text? Then do not take received size into consideration
    //NOTE: IN THIS CASE, LABEL COLLISION WON'T WORK!
    if (agent.text !== localizedText)
      agent.rectangle.size = vect(localizedText.length * 5, 15);

    let result = TextToImage.createImageFromText(
      resourceStore,
      agent.rectangle,
      localizedText,
      agent.fontFace,
      agent.backgroundColor,
      agent.textColor,
    );
    agent.font = result.font;
    agent.imageName = result.imageName;
  }

  /**
   * Draws a single agent on the screen.
   * @memberof Screen
   * @param {Object} agent - Agent object to draw.
   */
  this.drawAgent = function (agent) {
    if (!agent.imageName && agent.text) {
      createImageFromTextForAgent(agent); //only once. Creates image
    }

    let canvasRectangle = CoordinatesConversion.rectangleWorldToCanvas(
      agent.rectangle,
      camera.rectangle,
      screen.getSize(),
    );

    if (agent.imageName) drawAgentImage(agent, canvasRectangle);
  };

  /**
   * Draws all visible agents on the screen.
   * @param {Object} agentsToDrawInput - Object containing agents to draw.
   */
  function drawAllAgents(agentsToDrawInput) {
    let agentsToDraw = Object.values(agentsToDrawInput);
    if (!camera) return; //not ready yet
    for (let index = 0; index < agentsToDraw.length; index++)
      screen.drawAgent(agentsToDraw[index], camera);
  }

  /**
   * Draws a red border around the world boundaries.
   */
  function drawWorldBorder() {
    if (!camera) return;

    let worldCanvasRectangle = CoordinatesConversion.rectangleWorldToCanvas(
      worldRectangle,
      camera.rectangle,
      screen.getSize(),
    );
    let worldCanvasRectangleScreenToCameraFactor = worldCanvasRectangle;
    worldCanvasRectangleScreenToCameraFactor.size.divideByScalar(
      screen.zoomOutFactor,
    );

    context.save();
    context.beginPath();
    let lineWidth = 20;
    context.lineWidth = lineWidth; //.toString()
    context.strokeStyle = "red";

    // context.fillStyle="red"
    context.rect(
      worldCanvasRectangleScreenToCameraFactor.center.x -
        worldCanvasRectangleScreenToCameraFactor.size.x / 2,
      worldCanvasRectangleScreenToCameraFactor.center.y -
        worldCanvasRectangleScreenToCameraFactor.size.y / 2,
      worldCanvasRectangleScreenToCameraFactor.size.x + lineWidth / 2,
      worldCanvasRectangleScreenToCameraFactor.size.y + lineWidth / 2,
    );

    context.stroke();
    context.restore();
  }

  /**
   * Main game presentation loop that renders the complete frame.
   * @memberof Screen
   */
  this.gamePresentationLoop = function () {
    clear();
    if (backgroundImage) {
      drawBackground();
    }

    drawWorldBorder();
    drawAllAgents(getVisibleAgents());

    //give game client a chance to decorate the screen with game specific effects
    onAfterDrawScreen && onAfterDrawScreen(context);

    particlesContainer.animationStep();

    //presentationLoopId = window.requestAnimationFrame(screen.gamePresentationLoop)
    presentationLoopId = window.setTimeout(
      screen.gamePresentationLoop,
      BEClientDefinitions.ANIMATION_INTERVAL,
    );
  };

  /**
   * Stops the game presentation loop and clears the screen.
   * @memberof Screen
   */
  this.stopGamePresentationLoop = function () {
    if (!presentationLoopId) return;
    window.clearTimeout(presentationLoopId);
    clear();
  };
}

/**
 * @type {Screen}
 * @description Global screen instance for managing canvas rendering and game presentation.
 */
let screen = new Screen();

// Event listener for window resize to adjust canvas
window.addEventListener("onResizeCanvas", (event) => {
  screen.adjustCanvasToWindowSize();
});

export { Screen, screen };
