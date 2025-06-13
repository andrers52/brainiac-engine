"use strict";

import { Assert, Sound } from "arslib";
import { BECommonDefinitions } from "../../common/BECommonDefinitions.js";
import { rect } from "../../common/geometry/Rectangle.js";
import { fakeSocket } from "../../common/singleton/fakeSocket.js";
import { BEClientDefinitions } from "../BEClientDefinitions.js";
import { ParticlesContainer } from "../ParticlesContainer.js";
import { ResourceStore } from "../ResourceStore.js";
import { Screen } from "../Screen.js";
import { UserEvents } from "../UserEvents.js";

/**
 * @fileoverview Brainiac Engine Client - Main client-side game engine controller.
 * Manages game initialization, server connections, rendering, and client-server communication.
 *
 * Generated Events to game:
 * - onAfterDrawScreen(context) -> calls game event after each time the screen is draw.
 * - onBeforeDrawAgent(agentId,imageName, context, canvasRectangle, orientation) -> calls game event after each image draw.
 * - onAfterDrawAgent(agentId,imageName, context, canvasRectangle, orientation) -> calls game event after each image draw.
 * - onConnectToServer(userName) -> game start event with defined user name
 *
 * Needed game interfaces:
 * - getMediaAssets() -> return an array of media assets to load for the game.
 */

/**
 * @namespace BEClient
 * @description Brainiac Engine Client - Main client-side game engine namespace.
 * Provides game initialization, server connection management, and rendering coordination.
 */
let BEClient = {};

/**
 * @memberof BEClient
 * @type {string}
 * @description Current user's name/identifier.
 */
BEClient.userName = "";

/**
 * @memberof BEClient
 * @type {Function|null}
 * @description Callback function called after drawing each agent.
 * Signature: (agentId, imageName, context, canvasRectangle, orientation) => void
 */
BEClient.onAfterDrawAgent = null;

/**
 * @memberof BEClient
 * @type {Function|null}
 * @description Callback function called before drawing each agent.
 * Signature: (agentId, imageName, context, canvasRectangle, orientation) => void
 */
BEClient.onBeforeDrawAgent = null;

/**
 * @memberof BEClient
 * @type {Function|null}
 * @description Callback function called after drawing the entire screen.
 * Signature: (context) => void
 */
BEClient.onAfterDrawScreen = null;

/**
 * @memberof BEClient
 * @type {Object|null}
 * @description Reference to the game application instance.
 */
BEClient.app = null;

/**
 * @memberof BEClient
 * @type {UserEvents}
 * @description User input events handler instance.
 */
BEClient.userEvents = new UserEvents();

/**
 * @memberof BEClient
 * @type {number|null}
 * @description Interval ID for agent execution loop.
 */
BEClient.agentsExecutionIntervalId = null;

/**
 * @memberof BEClient
 * @type {Array}
 * @description Array of currently visible agents in the game world.
 */
BEClient.visibleAgents = [];

/**
 * Sets the camera position to center on the given agent.
 * @param {Object} agent - The agent to center the camera on.
 * @param {Object} agent.rectangle - The agent's rectangle with center coordinates.
 * @param {Object} agent.rectangle.center - The center point of the agent.
 * @param {number} agent.rectangle.center.x - X coordinate of agent center.
 * @param {number} agent.rectangle.center.y - Y coordinate of agent center.
 */
function setCameraToAgentPosition(agent) {
  let cameraSize = screen.getSize().multiplyByScalar(screen.zoomOutFactor);
  setCamera({
    rectangle: rect(
      agent.rectangle.center.x,
      agent.rectangle.center.y,
      cameraSize.x,
      cameraSize.y,
    ),
  });
}

/**
 * Gets the array of currently visible agents.
 * @memberof BEClient
 * @returns {Array} Array of visible agent objects.
 */
BEClient.getVisibleAgents = function () {
  return BEClient.visibleAgents;
};

/**
 * Finds a visible agent by a specific property value.
 * @memberof BEClient
 * @param {string} property - The property name to search by.
 * @param {*} value - The value to match against the property.
 * @returns {Object|undefined} The found agent object, or undefined if not found.
 */
BEClient.getVisibleAgentByProperty = function (property, value) {
  return BEClient.visibleAgents.find((ag) => ag[property] === value);
};

/**
 * Sets the array of visible agents and optionally adjusts camera position.
 * @memberof BEClient
 * @param {Array} visibleAgentsInput - Array of agent objects to set as visible.
 */
BEClient.setVisibleAgents = function (visibleAgentsInput) {
  // Assert.assert(camera, 'camera should be defined before showing agents')
  //if(!camera) return
  BEClient.visibleAgents = visibleAgentsInput;

  // set camera position to user received position
  if (BEClient.config.userAlwaysAtCenterOfCamera) {
    const userAgent = BEClient.visibleAgents.find(
      (agent) => !!agent.name && agent.name === BEClient.userName,
    );

    setCameraToAgentPosition(userAgent);
  }
};

/**
 * Camera object passed by reference to maintain state consistency.
 * @type {Object}
 * @property {Object} rectangle - Camera rectangle with center and size.
 */
let camera = { rectangle: rect(0, 0, 1, 1) }; //1s to avoid conversion errors

/**
 * ResourceStore instance for managing all game assets.
 * @type {ResourceStore}
 */
let resourceStore = new ResourceStore();

/**
 * ParticlesContainer instance for managing all particle effects.
 * @type {ParticlesContainer}
 */
let particlesContainer = new ParticlesContainer();

/**
 * Screen instance for managing canvas rendering and game presentation.
 * @type {Screen}
 */
let screen = new Screen();

/**
 * Gets the current camera object.
 * @memberof BEClient
 * @returns {Object} The camera object with rectangle property.
 */
BEClient.getCamera = function () {
  return camera;
};

/**
 * Gets the current resource store instance.
 * @memberof BEClient
 * @returns {ResourceStore} The resource store instance.
 */
BEClient.getResourceStore = function () {
  return resourceStore;
};

/**
 * Gets the current particles container instance.
 * @memberof BEClient
 * @returns {ParticlesContainer} The particles container instance.
 */
BEClient.getParticlesContainer = function () {
  return particlesContainer;
};

/**
 * Gets the current screen instance.
 * @memberof BEClient
 * @returns {Screen} The screen instance.
 */
BEClient.getScreen = function () {
  return screen;
};

/**
 * Sets the camera position and size by updating the existing camera object.
 * @param {Object} cameraToSet - Camera object with rectangle property.
 * @param {Object} cameraToSet.rectangle - Rectangle defining camera view.
 * @param {Object} cameraToSet.rectangle.center - Center coordinates.
 * @param {number} cameraToSet.rectangle.center.x - X coordinate.
 * @param {number} cameraToSet.rectangle.center.y - Y coordinate.
 * @param {Object} cameraToSet.rectangle.size - Camera view size.
 * @param {number} cameraToSet.rectangle.size.x - Width.
 * @param {number} cameraToSet.rectangle.size.y - Height.
 */
function setCamera(cameraToSet) {
  camera.rectangle.center.x = cameraToSet.rectangle.center.x;
  camera.rectangle.center.y = cameraToSet.rectangle.center.y;
  camera.rectangle.size.x = cameraToSet.rectangle.size.x;
  camera.rectangle.size.y = cameraToSet.rectangle.size.y;
}

/**
 * Removes all audio event listeners from loaded audio resources.
 */
function removeAllAudioEvents() {
  resourceStore
    .retrieveAllAudioNames()
    .map((audioName) => Sound.clearAllEvents(audioName));
}

/**
 * Removes the loading message element from the DOM.
 */
function removeLoadingMessage() {
  let loading = document.getElementById("loading");
  loading && loading.parentNode.removeChild(loading);
}

/**
 * Propagates user events to both server and client listeners.
 * @param {string} event - The event name/type.
 * @param {*} arg - Event arguments/data to pass along.
 */
function propagateUserEvent(event, arg) {
  let eventAndArg = { event: event, arg: arg };
  //propagate to server
  BEClient.socket.emit("userEvent", eventAndArg);
  if (event.includes("Mouse")) return;
  //propagate to client
  window.dispatchEvent(
    new CustomEvent(event, {
      detail: arg,
      bubbles: false,
      composed: true,
    }),
  );
}

/**
 * Initializes the socket connection and sets up server message handlers.
 * Handles both local app mode (using fakeSocket) and remote connections.
 */
function _startConnection() {
  if (BEClient.config.localApp) {
    BEClient.socket = fakeSocket;
    // *** IF LOCALAPP EMIT 'connection' ***
    BEClient.socket.emit("connection", {}, () => {});
  } else BEClient.socket = io(BECommonDefinitions.WEB_SOCKET_ADDRESS);

  //dispatch server messages
  BEClient.socket.on("update", function (visibleAgentsInput) {
    BEClient.setVisibleAgents(visibleAgentsInput);
  });
  BEClient.socket.on("Sound.playSound", function (soundName) {
    Sound.playSound(soundName);
  });
  BEClient.socket.on("playDescr", function (soundObjName) {
    var s = new SoundEffect(
      BEClient.app.getSoundEffectDescription(soundObjName),
    ).generate();
    s.getAudio().play();
  });
  BEClient.socket.on("Sound.playSoundLoop", function (soundName) {
    Sound.playSoundLoop(soundName);
  });
  BEClient.socket.on("camera", function (cameraToSet) {
    console.log(`Camera received: ${cameraToSet.toString()}`);
    setCamera(cameraToSet);
  });
  BEClient.socket.on("messageToGameClient", function (messageAndContentObj) {
    if (!BEClient.app[messageAndContentObj.message])
      console.log(
        "Server message not understood: " + messageAndContentObj.message,
      );

    BEClient.app[messageAndContentObj.message](
      messageAndContentObj.contentObject,
    );
  });

  BEClient.socket.on("BEClient.openModalLink", function () {
    document.getElementById("openModalLink").click();
  });
  // NOTE: not using localization for now...
  BEClient.socket.on(
    "BEClient.localization.setCurrentLanguage",
    function (language) {
      //BEClient.localization.setCurrentLanguage(language)
      console.log(`${language}: Not using localization for now...`);
    },
  );

  BEClient.socket.on("disconnect", function () {
    BEClient.userEvents.stop();
    location.reload();
  });
}

/**
 * Starts the Brainiac Engine Client with the provided game application.
 * Initializes resources, establishes connections, and prepares the game environment.
 * @memberof BEClient
 * @param {Object} app - The game application object.
 * @param {Function} app.getMediaAssets - Function returning array of media assets to load.
 * @param {Function} [app.getEffectsDescription] - Optional function returning effects descriptor.
 */
BEClient.start = function (app) {
  //connect to server
  BEClient.app = app;
  //after common resources
  let executeAfterLoadCommonResources = () => {
    removeLoadingMessage();
    BEClient.config = resourceStore.retrieveResourceObject(
      BECommonDefinitions.CONFIG_JSON,
    );
    _startConnection();
    BECommonDefinitions.start(BEClient.config);
    if (BECommonDefinitions.config.buildType === "deploy")
      Assert.disableAllVerifications = true;
    BEClient.connectToGameServer();
  };

  loadCommonResources();

  BEClient.app.getEffectsDescription &&
    resourceStore.createEffectsFromDescriptor(
      BEClient.app.getEffectsDescription(),
    );

  resourceStore.callWhenReady(executeAfterLoadCommonResources);
};

/**
 * Connects to the game server and initializes the game session.
 * Sets up rendering, loads game resources, and establishes communication.
 * @memberof BEClient
 */
BEClient.connectToGameServer = function () {
  //EArray.empty(BEClient.visibleAgents)
  BEClient.visibleAgents = [];

  screen.stopGamePresentationLoop();
  //BECommon.Timer.clearAllIntervals();
  removeAllAudioEvents();
  resourceStore.removeTemporaryResources();
  //addLoadingImage();
  let executeAfterLoadGameResources = async () => {
    //connect engine events to game
    BEClient.app.onAfterDrawAgent &&
      (BEClient.onAfterDrawAgent = BEClient.app.onAfterDrawAgent.bind(
        BEClient.app,
      ));
    BEClient.app.onBeforeDrawAgent &&
      (BEClient.onBeforeDrawAgent = BEClient.app.onBeforeDrawAgent.bind(
        BEClient.app,
      ));
    BEClient.app.onAfterDrawScreen &&
      (BEClient.onAfterDrawScreen = BEClient.app.onAfterDrawScreen.bind(
        BEClient.app,
      ));

    screen.start({
      onBeforeDrawAgentInput: BEClient.onBeforeDrawAgent,
      onAfterDrawAgentInput: BEClient.onAfterDrawAgent,
      onAfterDrawScreenInput: BEClient.onAfterDrawScreen,
      minScreenDimensionInput: BECommonDefinitions.MIN_SCREEN_DIMENSION,
      getVisibleAgentsInput: BEClient.getVisibleAgents,
      cameraInput: camera,
      canvasIdInput: BEClientDefinitions.CANVAS_ID,
      worldWidth: BECommonDefinitions.WORLD_WIDTH,
      worldHeight: BECommonDefinitions.WORLD_HEIGHT,
      resourceStoreInput: resourceStore,
      particlesContainerInput: particlesContainer,
    });

    //camera.rectangle.size = screen.setCameraSizeToCanvas()
    if (BEClient.config.worldToCameraSize) {
      screen.setWorldToCameraSize();
    }

    BEClient.userName = "user";
    BEClient.app.showInitialScreenAndReturnUserName &&
      (BEClient.userName =
        await BEClient.app.showInitialScreenAndReturnUserName());
    let connectionArgsStr = {
      userName: BEClient.userName,
      cameraSize: camera.rectangle.size,
    };

    BEClient.socket.on(
      "BEServer.clientStartReady",
      function (userIdAndBackgroundImageName) {
        let userId = userIdAndBackgroundImageName.userAgentId;
        BEClient.setBackgroundImageName(
          userIdAndBackgroundImageName.backgroundImagename,
        );
        //server is ready
        //removeLoadingImage();
        //inform game we are starting and set basic info
        BEClient.app.onConnectToServer &&
          BEClient.app.onConnectToServer(BEClient.userName, userId);

        BEClient.userEvents.start(
          BEClientDefinitions.MOUSE_MOVE_PROPAGATION_LATENCY,
          propagateUserEvent,
          camera,
          screen,
        );

        screen.gamePresentationLoop();
      },
    );

    BEClient.socket.emit("BEServer.clientStart", connectionArgsStr);
  };

  //game interface for definning its resources
  Assert.assertIsFunction(
    BEClient.app.getMediaAssets,
    "You need to define 'getMediaAssets' on the game to be able to load your media assets.",
  );
  let gameMediaAssets = BEClient.app.getMediaAssets();
  gameMediaAssets.forEach((asset) => resourceStore.addResource(asset));
  resourceStore.callWhenReady(executeAfterLoadGameResources);
};

/**
 * Sets the background image for the game screen.
 * @memberof BEClient
 * @param {string} imageName - Name/identifier of the background image resource.
 */
BEClient.setBackgroundImageName = function (imageName) {
  screen.setBackgroundImageName(imageName);
};

/**
 * Loads common engine resources including effects and base assets.
 */
function loadCommonResources() {
  resourceStore.createEffectsFromDescriptor(
    BECommonDefinitions.COMMON_EFFECTS_DESCRIPTION,
  );
  BECommonDefinitions.COMMON_RESOURCES.forEach((resource) =>
    resourceStore.addResource(resource),
  );
}

export { BEClient };
