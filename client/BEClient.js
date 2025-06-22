"use strict";

import { Assert, Sound } from "arslib";
import { BECommonDefinitions } from "../common/BECommonDefinitions.js";
import { getSharedLocalSocket } from "../common/fakeSocket.js";
import { rect } from "../common/geometry/Rectangle.js";
import { BEClientDefinitions } from "./BEClientDefinitions.js";
import { ParticlesContainer } from "./ParticlesContainer.js";
import { ResourceStore } from "./ResourceStore.js";
import { Screen } from "./Screen.js";
import { UserEvents } from "./UserEvents.js";

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
 * Creates a new BEClient instance.
 * @function BEClient
 * @description Brainiac Engine Client - Main client-side game engine instance factory.
 * Provides game initialization, server connection management, and rendering coordination.
 * @returns {Object} A new BEClient instance with all necessary methods and properties.
 */
function BEClient() {
  // Instance state
  this.userName = "";
  this.gameContainerId = "contentArea";
  this.onAfterDrawAgent = null;
  this.onBeforeDrawAgent = null;
  this.onAfterDrawScreen = null;
  this.app = null;
  this.agentsExecutionIntervalId = null;
  this.visibleAgents = [];
  this.socket = null;
  this.config = null;
  this.fakeSocket = null; // For local apps

  // Private instance variables
  const camera = { rectangle: rect(0, 0, 1, 1) }; // 1s to avoid conversion errors
  const resourceStore = new ResourceStore();
  const screen = new Screen();

  // Initialize after screen is available
  const particlesContainer = new ParticlesContainer(screen);
  const userEvents = new UserEvents(screen);

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
   * @returns {Array} Array of visible agent objects.
   */
  this.getVisibleAgents = () => {
    return this.visibleAgents;
  };

  /**
   * Finds a visible agent by a specific property value.
   * @param {string} property - The property name to search by.
   * @param {*} value - The value to match against the property.
   * @returns {Object|undefined} The found agent object, or undefined if not found.
   */
  this.getVisibleAgentByProperty = (property, value) => {
    return this.visibleAgents.find((ag) => ag[property] === value);
  };

  /**
   * Sets the array of visible agents and optionally adjusts camera position.
   * @param {Array} visibleAgentsInput - Array of agent objects to set as visible.
   */
  this.setVisibleAgents = (visibleAgentsInput) => {
    // Assert.assert(camera, 'camera should be defined before showing agents')
    //if(!camera) return
    this.visibleAgents = visibleAgentsInput;

    // set camera position to user received position
    if (this.config.userAlwaysAtCenterOfCamera) {
      const userAgent = this.visibleAgents.find(
        (agent) => !!agent.name && agent.name === this.userName,
      );

      if (userAgent) {
        setCameraToAgentPosition(userAgent);
      }
    }
  };

  /**
   * Gets the current camera object.
   * @returns {Object} The camera object with rectangle property.
   */
  this.getCamera = () => {
    return camera;
  };

  /**
   * Gets the current resource store instance.
   * @returns {ResourceStore} The resource store instance.
   */
  this.getResourceStore = () => {
    return resourceStore;
  };

  /**
   * Gets the current particles container instance.
   * @returns {ParticlesContainer} The particles container instance.
   */
  this.getParticlesContainer = () => {
    return particlesContainer;
  };

  /**
   * Gets the current screen instance.
   * @returns {Screen} The screen instance.
   */
  this.getScreen = () => {
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
  const propagateUserEvent = (event, arg) => {
    let eventAndArg = {
      event: event,
      arg: arg,
      clientCamera: camera, // Include camera/client information for viewport filtering
    };
    //propagate to server
    this.socket.emit("userEvent", eventAndArg);
    if (event.includes("Mouse")) return;
    //propagate to client
    window.dispatchEvent(
      new CustomEvent(event, {
        detail: arg,
        bubbles: false,
        composed: true,
      }),
    );
  };

  /**
   * Initializes the socket connection and sets up server message handlers.
   * Handles both local app mode (using shared FakeSocket) and remote connections.
   */
  const _startConnection = () => {
    if (this.config.localApp) {
      this.socket = getSharedLocalSocket();
      // *** IF LOCALAPP EMIT 'connection' ***
      this.socket.emit("connection", {}, () => {});
    } else this.socket = io(BECommonDefinitions.WEB_SOCKET_ADDRESS);

    //dispatch server messages
    this.socket.on("connect", () => {});

    this.socket.on("disconnect", (reason) => {
      userEvents.stop();
      location.reload();
    });

    this.socket.on("update", (visibleAgentsInput) => {
      this.setVisibleAgents(visibleAgentsInput);
    });
    this.socket.on("Sound.playSound", (soundName) => {
      Sound.playSound(soundName);
    });
    this.socket.on("playDescr", (soundObjName) => {
      var s = new SoundEffect(
        this.app.getSoundEffectDescription(soundObjName),
      ).generate();
      s.getAudio().play();
    });
    this.socket.on("Sound.playSoundLoop", (soundName) => {
      Sound.playSoundLoop(soundName);
    });
    this.socket.on("camera", (cameraToSet) => {
      console.log(`Camera received: ${cameraToSet.toString()}`);
      setCamera(cameraToSet);
    });
    this.socket.on("messageToGameClient", (messageAndContentObj) => {
      if (!this.app[messageAndContentObj.message])
        console.log(
          "Server message not understood: " + messageAndContentObj.message,
        );
      this.app[messageAndContentObj.message](
        messageAndContentObj.contentObject,
      );
    });

    this.socket.on("BEClient.openModalLink", () => {
      document.getElementById("openModalLink").click();
    });
    // NOTE: not using localization for now...
    this.socket.on("BEClient.localization.setCurrentLanguage", (language) => {
      //BEClient.localization.setCurrentLanguage(language)
      console.log(`${language}: Not using localization for now...`);
    });

    this.socket.on("disconnect", () => {
      userEvents.stop();
      location.reload();
    });
  };

  /**
   * Starts the Brainiac Engine Client with the provided game application.
   * Initializes resources, establishes connections, and prepares the game environment.
   * @param {Object} app - The game application object.
   * @param {Function} app.getMediaAssets - Function returning array of media assets to load.
   * @param {Function} [app.getEffectsDescription] - Optional function returning effects descriptor.
   */
  this.start = (app) => {
    //connect to server
    this.app = app;
    //after common resources
    let executeAfterLoadCommonResources = () => {
      removeLoadingMessage();
      this.config = resourceStore.retrieveResourceObject(
        BECommonDefinitions.CONFIG_JSON,
      );
      BECommonDefinitions.start(this.config);
      _startConnection();
      if (BECommonDefinitions.config.buildType === "deploy")
        Assert.disableAllVerifications = true;
      this.connectToGameServer();
    };

    loadCommonResources();

    this.app.getEffectsDescription &&
      resourceStore.createEffectsFromDescriptor(
        this.app.getEffectsDescription(),
      );

    resourceStore.callWhenReady(executeAfterLoadCommonResources);
  };

  /**
   * Connects to the game server and initializes the game session.
   * Sets up rendering, loads game resources, and establishes communication.
   */
  this.connectToGameServer = () => {
    //EArray.empty(this.visibleAgents)
    this.visibleAgents = [];

    screen.stopGamePresentationLoop();
    //BECommon.Timer.clearAllIntervals();
    removeAllAudioEvents();
    resourceStore.removeTemporaryResources();
    //addLoadingImage();
    let executeAfterLoadGameResources = async () => {
      //connect engine events to game
      this.app.onAfterDrawAgent &&
        (this.onAfterDrawAgent = this.app.onAfterDrawAgent.bind(this.app));
      this.app.onBeforeDrawAgent &&
        (this.onBeforeDrawAgent = this.app.onBeforeDrawAgent.bind(this.app));
      this.app.onAfterDrawScreen &&
        (this.onAfterDrawScreen = this.app.onAfterDrawScreen.bind(this.app));

      screen.start({
        onBeforeDrawAgentInput: this.onBeforeDrawAgent,
        onAfterDrawAgentInput: this.onAfterDrawAgent,
        onAfterDrawScreenInput: this.onAfterDrawScreen,
        minScreenDimensionInput: BECommonDefinitions.MIN_SCREEN_DIMENSION,
        getVisibleAgentsInput: this.getVisibleAgents,
        cameraInput: camera,
        canvasIdInput: BEClientDefinitions.CANVAS_ID,
        worldWidth: BECommonDefinitions.WORLD_WIDTH,
        worldHeight: BECommonDefinitions.WORLD_HEIGHT,
        resourceStoreInput: resourceStore,
        particlesContainerInput: particlesContainer,
      });

      //camera.rectangle.size = screen.setCameraSizeToCanvas()
      if (this.config.worldToCameraSize) {
        screen.setWorldToCameraSize();
      }
      // Set camera size to proper canvas size before sending to server
      //screen.setCameraSizeToCanvas();

      //this.userName = "user"; // Removed default, will be set by showInitialScreenAndReturnUserName
      if (this.app.showInitialScreenAndReturnUserName) {
        this.userName = await this.app.showInitialScreenAndReturnUserName(this); // Pass BEClient instance
      } else {
        // Fallback or error if the method isn't defined on the app
        console.warn(
          "BEClient: app.showInitialScreenAndReturnUserName is not defined. Using default username.",
        );
        this.userName = BECommonDefinitions.DEFAULT_USER_NAME;
      }

      let connectionArgsStr = {
        userName: this.userName,
        cameraSize: camera.rectangle.size,
      };

      this.socket.on(
        "BEServer.clientStartReady",
        (userIdAndBackgroundImageName) => {
          let userId = userIdAndBackgroundImageName.userAgentId;
          this.setBackgroundImageName(
            userIdAndBackgroundImageName.backgroundImagename,
          );
          //server is ready
          //removeLoadingImage();
          //inform game we are starting and set basic info
          this.app.onConnectToServer &&
            this.app.onConnectToServer(this.userName, userId);

          userEvents.start(
            BEClientDefinitions.MOUSE_MOVE_PROPAGATION_LATENCY,
            propagateUserEvent,
            camera,
            screen,
          );

          screen.gamePresentationLoop();
        },
      );

      this.socket.emit("BEServer.clientStart", connectionArgsStr);
    };

    //game interface for definning its resources
    Assert.assertIsFunction(
      this.app.getMediaAssets,
      "You need to define 'getMediaAssets' on the game to be able to load your media assets.",
    );
    let gameMediaAssets = this.app.getMediaAssets();
    gameMediaAssets.forEach((asset) => resourceStore.addResource(asset));
    resourceStore.callWhenReady(executeAfterLoadGameResources);
  };

  /**
   * Sets the background image for the game screen.
   * @param {string} imageName - Name/identifier of the background image resource.
   */
  this.setBackgroundImageName = (imageName) => {
    screen.setBackgroundImageName(imageName);
  };

  /**
   * Starts a new game session with the given username.
   * @param {string} userName - The username for the game session.
   */
  this.startGameSession = (userName) => {
    this.userName = userName;
    let connectionArgsStr = {
      userName: this.userName,
      cameraSize: camera.rectangle.size,
    };
    this.socket.emit("BEServer.clientStart", connectionArgsStr);
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
}

export { BEClient };
