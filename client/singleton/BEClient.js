/* globals SoundEffect */
"use strict";

import { Assert, Sound } from "arslib";
import { BECommonDefinitions } from "../../common/BECommonDefinitions.js";
import { rect } from "../../common/geometry/Rectangle.js";
import { fakeSocket } from "../../common/singleton/fakeSocket.js";
import { BEClientDefinitions } from "../BEClientDefinitions.js";
import { UserEvents } from "../UserEvents.js";
import { resourceStore } from "./ResourceStore.js";
import { screen } from "./Screen.js";

// changing defaults

// Generated Events to game:
// onAfterDrawScreen(context) -> calls game event after each time the screen is draw.
// onBeforeDrawAgent(agentId,imageName, context, canvasRectangle, orientation) -> calls game event after each image draw.
// onAfterDrawAgent(agentId,imageName, context, canvasRectangle, orientation) -> calls game event after each image draw.
// onConnectToServer(userName) -> game start event with defined user name

// Needed game interfaces
// getMediaAssets() -> return an array of media assets to load for the game.

//brainiac client engine namespace
let BEClient = {};

BEClient.userName = "";

BEClient.onAfterDrawAgent = null;
BEClient.onBeforeDrawAgent = null;

BEClient.onAfterDrawScreen = null;

BEClient.app = null;

BEClient.userEvents = new UserEvents();

// let loading_animation = document.createElement('img')

BEClient.agentsExecutionIntervalId = null;

BEClient.visibleAgents = [];

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

BEClient.getVisibleAgents = function () {
  return BEClient.visibleAgents;
};

BEClient.getVisibleAgentByProperty = function (property, value) {
  return BEClient.visibleAgents.find((ag) => ag[property] === value);
};

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

// Note: this is needed because camera is passed by reference
// and users depend on its update
let camera = { rectangle: rect(0, 0, 1, 1) }; //1s to avoid conversion errors

BEClient.getCamera = function () {
  return camera;
};

function setCamera(cameraToSet) {
  camera.rectangle.center.x = cameraToSet.rectangle.center.x;
  camera.rectangle.center.y = cameraToSet.rectangle.center.y;
  camera.rectangle.size.x = cameraToSet.rectangle.size.x;
  camera.rectangle.size.y = cameraToSet.rectangle.size.y;
}

// function addLoadingImage() {
//   loading_animation.id = BEClientDefinitions.LOADING_ANIMATION_ID
//   loading_animation.src = './common_media/images/waiting_animation.gif'
//   loading_animation.className = BEClientDefinitions.LOADING_ANIMATION_CLASS_NAME
//   loading_animation.width = 100
//   loading_animation.height = 100

//   document.body.appendChild(loading_animation)
// }

// function removeLoadingImage() {
//   try {
//     let loading_image = document.getElementById(BEClientDefinitions.LOADING_ANIMATION_ID)
//     if (loading_image) {
//       loading_animation.parentNode.removeChild(loading_image)
//     }
//   } catch (e) { console.log('error while remoring loading image')}
// }

function removeAllAudioEvents() {
  resourceStore
    .retrieveAllAudioNames()
    .map((audioName) => Sound.clearAllEvents(audioName));
}

function removeLoadingMessage() {
  let loading = document.getElementById("loading");
  loading && loading.parentNode.removeChild(loading);
}

//send fired event to all agents -- to be called by userEvents --
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

BEClient.setBackgroundImageName = function (imageName) {
  screen.setBackgroundImageName(imageName);
};

function loadCommonResources() {
  resourceStore.createEffectsFromDescriptor(
    BECommonDefinitions.COMMON_EFFECTS_DESCRIPTION,
  );
  BECommonDefinitions.COMMON_RESOURCES.forEach((resource) =>
    resourceStore.addResource(resource),
  );
}

export { BEClient };
