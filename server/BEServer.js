"use strict";

import { Assert, Platform } from "arslib";
import { BECommonDefinitions } from "../common/BECommonDefinitions.js";
import { getSharedLocalSocket } from "../common/fakeSocket.js";
import { AgentDefinitions } from "./agent/AgentDefinitions.js";
import { Environment } from "./agent/Environment.js";
import { Connector } from "./Connector.js";

/**
 * @file Main server for the Brainiac Engine.
 * Coordinates application startup, configuration loading, and client communication.
 * @module BEServer
 */

/**
 * Fetches JSON configuration asynchronously from a file.
 * @async
 * @private
 * @param {string} file - Path to the JSON configuration file
 * @returns {Promise<Object>} Parsed JSON configuration object
 * @throws {Error} If file cannot be fetched or parsed
 */
async function fetchAsync(file) {
  // await response of fetch call
  let response = await fetch(file);
  // only proceed once promise is resolved
  let data = await response.json();
  // only proceed once second promise is resolved
  return data;
}

/**
 * Constructor function for the Brainiac Engine server.
 * Handles server initialization, configuration loading, and application management.
 * @constructor
 * @class BEServerConstructor
 */
function BEServerConstructor() {
  /** @type {Environment} The game environment instance */
  this.environment = new Environment();

  /** @type {Object|null} Express app instance for HTTP server */
  this.expressApp = null;

  /** @type {Connector} The connector instance for client-server communication */
  this.connector = new Connector(this); // Pass this BEServer instance to Connector

  /** @type {Object|null} The fake socket instance for local apps */
  this.fakeSocket = null;

  /** @type {boolean} Flag to track if the server has been started */
  this.isStarted = false;

  /** @type {string} Background image name for the application */
  let backgroundImageName;

  /**
   * Sets the background image name for the application.
   * @memberof BEServerConstructor
   * @param {string} imageName - Name of the background image
   */
  this.setBackgroundImageName = function (imageName) {
    backgroundImageName = imageName;
  };

  /**
   * Gets the current background image name.
   * @memberof BEServerConstructor
   * @returns {string} The current background image name
   */
  this.getBackgroundImageName = function () {
    return backgroundImageName;
  };
  /**
   * Reads configuration from JSON file, supporting both browser and Node.js environments.
   * @async
   * @private
   * @returns {Promise<Object>} Configuration object loaded from file
   * @throws {Error} If configuration file cannot be read or parsed
   */
  async function _readConfig() {
    if (!Platform.isNode()) {
      return await fetchAsync(BECommonDefinitions.CONFIG_JSON);
    } else {
      const { readFile } = await import("fs/promises");
      const resultStr = await readFile(BECommonDefinitions.CONFIG_JSON, {
        encoding: "utf8",
      });
      console.log(resultStr);
      console.log(typeof resultStr);
      return JSON.parse(resultStr);
      // return await JSON.parse((BECommonDefinitions.CONFIG_JSON))
    }
  }

  /**
   * Continuously sends visible agent data to clients at regular intervals.
   * @private
   */
  const _sendClientVisibleAgents = () => {
    if (this.stopped) return; // Don't continue if server is stopped
    this.connector.setVisibleAgents();
    this.visibleAgentsTimerId = setTimeout(
      _sendClientVisibleAgents,
      AgentDefinitions.AGENTS_CLIENT_REFRESH_INTERVAL,
    );
  };

  /**
   * Validates an app object to ensure it implements all required methods for BEServer.
   * @private
   * @param {string} appName - Name of the application being validated
   * @param {Object} app - Application object to validate
   * @param {Function} app.start - Initializes the application
   * @param {Function} app.onUserConnected - Called when a user connects (user, cameraSize)
   * @param {Function} app.onUserDisconnected - Called when a user disconnects (user)
   * @param {Function} [app.sendInitialData] - Optional method to send initial data to a user (user)
   * @param {Function} [app.getHighScores] - Optional method to retrieve high scores for the initial page
   * @param {Object} [config] - Optional configuration object to validate
   * @param {string} [config.buildType] - Build type: "dev", "deploy", or "test"
   * @param {string} [config.version] - Application version string
   * @param {boolean} [config.playProceduralSoundInClient] - Whether to play procedural sounds in client
   * @param {boolean} [config.userAlwaysAtCenterOfCamera] - Whether user is always centered in camera view
   * @param {boolean} [config.localApp] - Whether app runs in local mode (no network) or multiplayer mode
   * @param {boolean} [config.cameraFollowUser] - Whether camera follows user movement
   * @param {boolean} [config.worldToCameraSize] - Whether to scale world to camera size
   * @throws {Error} Throws if app object doesn't implement required methods or parameters are invalid
   */
  const _validateApp = (appName, app, config) => {
    // Validate parameters using Assert
    Assert.assertIsString(appName, "App name must be a string");
    Assert.assertIsObject(app, "App must be an object");

    // Validate required methods
    Assert.assertIsFunction(app.start, "App must have a start() method");
    Assert.assertIsFunction(
      app.onUserConnected,
      "App must have an onUserConnected() method",
    );
    Assert.assertIsFunction(
      app.onUserDisconnected,
      "App must have an onUserDisconnected() method",
    );

    // Validate optional methods (if they exist)
    Assert.assertIsOptionalFunction(
      app.sendInitialData,
      "App.sendInitialData must be a function if provided",
    );
    Assert.assertIsOptionalFunction(
      app.getHighScores,
      "App.getHighScores must be a function if provided",
    );

    // Validate optional config parameter and its fields
    if (config !== undefined) {
      Assert.assertIsObject(config, "Config must be an object if provided");

      // Validate config fields based on config.json structure
      if (config.buildType !== undefined) {
        Assert.assertIsString(
          config.buildType,
          "Config.buildType must be a string",
        );
        Assert.assertIsTrue(
          ["dev", "deploy", "test"].includes(config.buildType),
          "Config.buildType must be one of: 'dev', 'deploy', 'test'",
        );
      }

      if (config.version !== undefined) {
        Assert.assertIsString(
          config.version,
          "Config.version must be a string",
        );
      }

      if (config.playProceduralSoundInClient !== undefined) {
        Assert.assertIsBoolean(
          config.playProceduralSoundInClient,
          "Config.playProceduralSoundInClient must be a boolean",
        );
      }

      if (config.userAlwaysAtCenterOfCamera !== undefined) {
        Assert.assertIsBoolean(
          config.userAlwaysAtCenterOfCamera,
          "Config.userAlwaysAtCenterOfCamera must be a boolean",
        );
      }

      if (config.localApp !== undefined) {
        Assert.assertIsBoolean(
          config.localApp,
          "Config.localApp must be a boolean",
        );
      }

      if (config.cameraFollowUser !== undefined) {
        Assert.assertIsBoolean(
          config.cameraFollowUser,
          "Config.cameraFollowUser must be a boolean",
        );
      }

      if (config.worldToCameraSize !== undefined) {
        Assert.assertIsBoolean(
          config.worldToCameraSize,
          "Config.worldToCameraSize must be a boolean",
        );
      }
    }
  };

  /**
   * Starts the Brainiac Engine server.
   * Initializes the environment, loads configuration, and sets up the connector.
   * @memberof BEServerConstructor
   */
  this.start = function (configOverride, onReady) {
    if (this.isStarted) {
      console.log("⚠️ BEServer already started, skipping duplicate start");
      if (onReady) onReady();
      return Promise.resolve();
    }

    this.stopped = false; // Initialize stopped flag
    this.visibleAgentsTimerId = null; // Initialize timer ID tracker
    this.environment.start(
      BECommonDefinitions.WORLD_WIDTH,
      BECommonDefinitions.WORLD_HEIGHT,
    );
    /** @type {Object|null} Reference to the currently executing application */
    this.currentApp = null; //provides global access to the currently executing Game
    /** @type {string} Name of the currently executing application */
    this.currentAppName = "";

    _readConfig().then(async (config) => {
      /** @type {Object} Server configuration object */
      this.config = configOverride || config;

      // Auto-detect browser environment and set localApp accordingly
      if (!Platform.isNode() && this.config.localApp === undefined) {
        this.config.localApp = true;
        console.log("🌐 Browser environment detected - setting localApp: true");
      }

      BECommonDefinitions.start(this.config); //adjust to config
      if (BECommonDefinitions.config.buildType === "deploy")
        Assert.disableAllVerifications = true;

      // Create fake socket for local apps
      if (this.config.localApp) {
        this.fakeSocket = getSharedLocalSocket();
      }

      // Create Express app before starting connector (if not in local app mode AND in Node.js environment)
      if (!this.config.localApp && Platform.isNode()) {
        const { default: express } = await import("express");
        const { default: cors } = await import("cors");

        this.expressApp = express();

        const corsOptions = {
          origin: `http://${BECommonDefinitions.WEB_SOCKET_ADDRESS_IP}`,
        };

        this.expressApp.use(cors(corsOptions));
        this.expressApp.use(express.static("."));
      }

      await this.connector.start(!!this.config.localApp, this.fakeSocket);

      this.isStarted = true; // Mark as started

      if (onReady) {
        onReady();
      }
    });
  };
  /**
   * Starts the server synchronously for testing purposes.
   * Skips configuration loading and connector setup.
   * @memberof BEServerConstructor
   */
  this.startSync = function () {
    this.stopped = false;
    this.visibleAgentsTimerId = null;
    this.environment.startForTests(
      BECommonDefinitions.WORLD_WIDTH,
      BECommonDefinitions.WORLD_HEIGHT,
    );
    this.currentApp = null;
    this.currentAppName = "";

    // Set up a minimal config for tests
    this.config = { buildType: "test", localApp: false };
    BECommonDefinitions.start(this.config);
  };

  /**
   * Stops the Brainiac Engine server and cleans up resources.
   * @memberof BEServerConstructor
   */
  this.stop = function () {
    this.stopped = true;
    if (this.visibleAgentsTimerId) {
      clearTimeout(this.visibleAgentsTimerId);
      this.visibleAgentsTimerId = null;
    }
    if (this.environment && this.environment.stop) {
      this.environment.stop();
    }
    if (this.connector && this.connector.stop) {
      this.connector.stop();
    }
    this.currentApp = null;
    this.currentAppName = "";
  };

  /**
   * Starts a specific application on the server.
   * Validates the app object using Assert to ensure it implements all required methods.
   * @memberof BEServerConstructor
   * @param {string} appName - Name of the application to start
   * @param {Object} app - Application object that must implement the following required methods:
   * @param {Function} app.start - Initializes the application
   * @param {Function} app.onUserConnected - Called when a user connects (user, cameraSize)
   * @param {Function} app.onUserDisconnected - Called when a user disconnects (user)
   * @param {Function} [app.sendInitialData] - Optional method to send initial data to a user (user)
   * @param {Function} [app.getHighScores] - Optional method to retrieve high scores for the initial page
   * @param {Object} [config] - Optional configuration object
   * @param {string} [config.buildType] - Build type: "dev", "deploy", or "test"
   * @param {string} [config.version] - Application version string
   * @param {boolean} [config.playProceduralSoundInClient] - Whether to play procedural sounds in client
   * @param {boolean} [config.userAlwaysAtCenterOfCamera] - Whether user is always centered in camera view
   * @param {boolean} [config.localApp] - Whether app runs in local mode (no network) or multiplayer mode
   * @param {boolean} [config.cameraFollowUser] - Whether camera follows user movement
   * @param {boolean} [config.worldToCameraSize] - Whether to scale world to camera size
   * @throws {Error} Throws if app object doesn't implement required methods or parameters are invalid
   */
  this.startApp = function (appName, app, config) {
    // Validate app and parameters
    _validateApp(appName, app, config);

    const self = this;

    if (this.isStarted) {
      // Server is already started, just set up the app
      console.log("🎮 Setting up application on already started server");
      self.currentApp = app;
      self.currentAppName = appName;
      self.currentApp.start();
      _sendClientVisibleAgents();
    } else {
      // Server not started yet, start it first
      this.start(config, function () {
        self.currentApp = app;
        self.currentAppName = appName;
        self.currentApp.start();
        _sendClientVisibleAgents();
      });
    }
  };

  /**
   * Propagates user events to the appropriate agents in the environment.
   * @memberof BEServerConstructor
   * @param {string} event - The event name (e.g., 'onMouseDown', 'onKeyPress')
   * @param {*} arg - Event argument (position for mouse events, key for keyboard events)
   * @param {Object} [clientCamera] - Client camera for viewport filtering
   * @param {Object} [agent] - Specific agent to receive the event. If not provided, nearby agents receive it.
   */
  this.propagateUserEvent = function (event, arg, clientCamera, agent) {
    this.environment.propagateUserEvent(event, arg, clientCamera, agent);
  };

  /**
   * Gets the environment instance.
   * @memberof BEServerConstructor
   * @returns {Environment} The environment instance
   */
  this.getEnvironment = function () {
    return this.environment;
  };

  /**
   * Gets the connector instance.
   * @memberof BEServerConstructor
   * @returns {Connector} The connector instance
   */
  this.getConnector = function () {
    return this.connector;
  };

  /**
   * Gets the Express app instance for custom route configuration.
   * @memberof BEServerConstructor
   * @returns {Object|null} Express app instance or null if not available
   */
  this.getExpressApp = function () {
    return this.expressApp;
  };

  /**
   * Configures routes on the Express app before starting the server.
   * @memberof BEServerConstructor
   * @param {Function} configureRoutes - Callback function to configure routes, receives the Express app
   * @param {Object} configOverride - Optional configuration override
   * @returns {Promise} Promise that resolves when the server is fully configured and started
   */
  this.startWithRoutes = function (configureRoutes, configOverride) {
    return new Promise((resolve, reject) => {
      if (this.isStarted) {
        console.log("⚠️ BEServer already started, skipping duplicate start");
        resolve();
        return;
      }

      this.stopped = false; // Initialize stopped flag
      this.visibleAgentsTimerId = null; // Initialize timer ID tracker

      // Initialize environment with default world dimensions
      this.environment.start(
        BECommonDefinitions.WORLD_WIDTH,
        BECommonDefinitions.WORLD_HEIGHT,
      );

      /** @type {Object|null} Reference to the currently executing application */
      this.currentApp = null; //provides global access to the currently executing Game
      /** @type {string} Name of the currently executing application */
      this.currentAppName = "";

      _readConfig()
        .then(async (config) => {
          try {
            /** @type {Object} Server configuration object */
            this.config = configOverride || config;

            // Auto-detect browser environment and set localApp accordingly
            if (!Platform.isNode() && this.config.localApp === undefined) {
              this.config.localApp = true;
              console.log(
                "🌐 Browser environment detected - setting localApp: true",
              );
            }

            BECommonDefinitions.start(this.config); //adjust to config
            if (BECommonDefinitions.config.buildType === "deploy")
              Assert.disableAllVerifications = true;

            // Create fake socket for local apps
            if (this.config.localApp) {
              this.fakeSocket = getSharedLocalSocket();
            }

            // Create Express app before starting connector (if not in local app mode AND in Node.js environment)
            if (!this.config.localApp && Platform.isNode()) {
              const { default: express } = await import("express");
              const { default: cors } = await import("cors");

              this.expressApp = express();

              const corsOptions = {
                origin: `http://${BECommonDefinitions.WEB_SOCKET_ADDRESS_IP}`,
              };

              this.expressApp.use(cors(corsOptions));
              this.expressApp.use(express.static("."));

              // Configure custom routes before starting the connector
              if (configureRoutes && typeof configureRoutes === "function") {
                configureRoutes(this.expressApp);
              }
            }

            await this.connector.start(!!this.config.localApp, this.fakeSocket);

            this.isStarted = true; // Mark as started

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .catch(reject);
    });
  };

  // ...existing code...
}

/**
 * Singleton instance of the Brainiac Engine server.
 * @type {BEServerConstructor}
 * @instance
 */
// var BEServer = new BEServerConstructor();

export { BEServerConstructor as BEServer }; // Export the constructor
