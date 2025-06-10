"use strict";

import { Assert, Platform } from "arslib";
import { BECommonDefinitions } from "../../common/BECommonDefinitions.js";
import { AgentDefinitions } from "../agent/AgentDefinitions.js";
import { environment } from "../agent/singleton/Environment.js";
import { connector } from "./Connector.js";

/**
 * @file Main server singleton for the Brainiac Engine.
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
      const fs = require("fs");
      const util = require("util");
      const readFileAsync = util.promisify(fs.readFile);
      const resultStr = await readFileAsync(BECommonDefinitions.CONFIG_JSON, {
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
  function _sendClientVisibleAgents() {
    connector.setVisibleAgents();
    setTimeout(
      _sendClientVisibleAgents,
      AgentDefinitions.AGENTS_CLIENT_REFRESH_INTERVAL,
    );
  }

  /**
   * Starts the Brainiac Engine server.
   * Initializes the environment, loads configuration, and sets up the connector.
   * @memberof BEServerConstructor
   */
  this.start = function () {
    environment.start(
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

    _readConfig().then((config) => {
      /** @type {Object} Server configuration object */
      this.config = config;
      BECommonDefinitions.start(this.config); //adjust to config
      if (BECommonDefinitions.config.buildType === "deploy")
        Assert.disableAllVerifications = true;
      connector.start(!!this.config.localApp);
    });
  };

  /**
   * Starts a specific application on the server.
   * @memberof BEServerConstructor
   * @param {string} appName - Name of the application to start
   * @param {Object} app - Application object with start() method and event handlers
   * @param {Object} [config] - Optional configuration object
   */
  this.startApp = function (appName, app, config) {
    this.start(config);
    BEServer.currentApp = app;
    BEServer.currentAppName = appName;
    BEServer.currentApp.start();
    _sendClientVisibleAgents();
  };

  /**
   * Propagates user events to the appropriate agents in the environment.
   * @memberof BEServerConstructor
   * @param {string} event - The event name (e.g., 'onMouseDown', 'onKeyPress')
   * @param {*} arg - Event argument (position for mouse events, key for keyboard events)
   * @param {Object} [agent] - Specific agent to receive the event. If not provided, nearby agents receive it.
   */
  this.propagateUserEvent = function (event, arg, agent) {
    environment.propagateUserEvent(event, arg, agent);
  };
}

/**
 * Singleton instance of the Brainiac Engine server.
 * @type {BEServerConstructor}
 * @instance
 */
var BEServer = new BEServerConstructor();

export { BEServer };
