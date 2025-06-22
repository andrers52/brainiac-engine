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
  /** @type {Connector} The connector instance for client-server communication */
  this.connector = new Connector(this); // Pass this BEServer instance to Connector
  /** @type {Object|null} The fake socket instance for local apps */
  this.fakeSocket = null;
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
   * Starts the Brainiac Engine server.
   * Initializes the environment, loads configuration, and sets up the connector.
   * @memberof BEServerConstructor
   */
  this.start = function (configOverride, onReady) {
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

    _readConfig().then(async (config) => {
      /** @type {Object} Server configuration object */
      this.config = configOverride || config;
      BECommonDefinitions.start(this.config); //adjust to config
      if (BECommonDefinitions.config.buildType === "deploy")
        Assert.disableAllVerifications = true;

      // Create fake socket for local apps
      if (this.config.localApp) {
        this.fakeSocket = getSharedLocalSocket();
      }

      await this.connector.start(!!this.config.localApp, this.fakeSocket);

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
   * @memberof BEServerConstructor
   * @param {string} appName - Name of the application to start
   * @param {Object} app - Application object with start() method and event handlers
   * @param {Object} [config] - Optional configuration object
   */
  this.startApp = function (appName, app, config) {
    const self = this;
    this.start(config, function () {
      self.currentApp = app;
      self.currentAppName = appName;
      self.currentApp.start();
      _sendClientVisibleAgents();
    });
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
}

/**
 * Singleton instance of the Brainiac Engine server.
 * @type {BEServerConstructor}
 * @instance
 */
// var BEServer = new BEServerConstructor();

export { BEServerConstructor as BEServer }; // Export the constructor
