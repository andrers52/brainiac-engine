"use strict";

import { Assert } from "arslib";
import { rect } from "../../common/geometry/Rectangle.js";
import { Vector, vect } from "../../common/geometry/Vector.js";
import { BEClientDefinitions } from "../BEClientDefinitions.js";
import { CoordinatesConversion } from "../CoordinatesConversion.js";
import { TextToImage } from "../TextToImage.js";
import { particlesContainer } from "./ParticlesContainer.js";
import { resourceStore } from "./ResourceStore.js";

function Screen() {
  let canvas;
  let context;
  let backgroundImage;
  let presentationLoopId;
  let worldRectangle;
  let canvasId;
  let camera;
  let minScreenDimension;
  this.zoomOutFactor = 1;
  let onBeforeDrawAgent;
  let onAfterDrawAgent;
  let onAfterDrawScreen;
  let getVisibleAgents;

  function addCanvas() {
    if (document.getElementById(canvasId)) return;

    canvas = document.createElement("canvas");
    canvas.id = canvasId;
    document.body.appendChild(canvas);
    canvas.focus();
  }

  this.hideCanvas = function () {
    canvas.style.visibility = "hidden";
  };
  this.showCanvas = function () {
    canvas.style.visibility = "visible";
  };
  this.getContext = function () {
    return context;
  };

  this.setBackgroundImageName = function (imageName) {
    backgroundImage =
      !!imageName && resourceStore.retrieveResourceObject(imageName);
  };

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

  //needs to be initialized before use
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
  }) {
    getVisibleAgents = getVisibleAgentsInput;
    onBeforeDrawAgent = onBeforeDrawAgentInput;
    onAfterDrawAgent = onAfterDrawAgentInput;
    onAfterDrawScreen = onAfterDrawScreenInput;
    minScreenDimension = minScreenDimensionInput;
    camera = cameraInput;
    canvasId = canvasIdInput;
    worldRectangle = rect(0, 0, worldWidth, worldHeight);

    addCanvas();

    this.adjustCanvasToWindowSize();

    //attempt orientation lock
    //this.lockOrientation()

    context = canvas.getContext("2d");

    camera.rectangle.size = this.setCameraSizeToCanvas();
    particlesContainer.start(camera);
  };

  this.setWorldToCameraSize = function () {
    worldRectangle.size = camera.rectangle.size.clone();
  };

  this.setCameraSizeToCanvas = function () {
    camera.rectangle.size = this.getSize().multiplyByScalar(this.zoomOutFactor);
    return camera.rectangle.size;
  };

  this.getCanvas = function () {
    return canvas;
  };

  // Runs each time the DOM window resize event fires.
  // Resets the canvas dimensions to match window,
  // then draws the new borders accordingly.
  window.addEventListener("onResizeCanvas", (event) => {
    screen.adjustCanvasToWindowSize();
  });
  this.adjustCanvasToWindowSize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    screen.zoomOutFactor = defineZoomOutFactor();
  };

  this.getCanvas = function () {
    return canvas;
  };
  this.getSize = function () {
    return new Vector(canvas.width, canvas.height);
  };
  this.getRectangle = function () {
    return rect(0, 0, canvas.width, canvas.height);
  };

  function clear() {
    context.save();
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }

  //opacity: 0-> opaque, 1-> transparent, undefined -> not set
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
      agent.rectangle,
      localizedText,
      agent.fontFace,
      agent.backgroundColor,
      agent.textColor,
    );
    agent.font = result.font;
    agent.imageName = result.imageName;
  }

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

  function drawAllAgents(agentsToDrawInput) {
    let agentsToDraw = Object.values(agentsToDrawInput);
    if (!camera) return; //not ready yet
    for (let index = 0; index < agentsToDraw.length; index++)
      screen.drawAgent(agentsToDraw[index], camera);
  }

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

  this.stopGamePresentationLoop = function () {
    if (!presentationLoopId) return;
    window.clearTimeout(presentationLoopId);
    clear();
  };
}

let screen = new Screen();

export { Screen, screen };
