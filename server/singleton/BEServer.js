"use strict";

import { Assert, Platform } from "arslib";
import { BECommonDefinitions } from "../../common/BECommonDefinitions.js";
import { AgentDefinitions } from "../agent/AgentDefinitions.js";
import { environment } from "../agent/singleton/Environment.js";
import { connector } from "./Connector.js";

// async function
async function fetchAsync(file) {
  // await response of fetch call
  let response = await fetch(file);
  // only proceed once promise is resolved
  let data = await response.json();
  // only proceed once second promise is resolved
  return data;
}

function BEServerConstructor() {
  // return promise
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

  //send rendering info to client
  function _sendClientVisibleAgents() {
    connector.setVisibleAgents();
    setTimeout(
      _sendClientVisibleAgents,
      AgentDefinitions.AGENTS_CLIENT_REFRESH_INTERVAL,
    );
  }

  this.start = function () {
    environment.start(
      BECommonDefinitions.WORLD_WIDTH,
      BECommonDefinitions.WORLD_HEIGHT,
    );
    this.currentApp = null; //provides global access to the currently executing Game
    this.currentAppName = "";

    let backgroundImageName;
    this.setBackgroundImageName = function (imageName) {
      backgroundImageName = imageName;
    };
    this.getBackgroundImageName = function () {
      return backgroundImageName;
    };

    _readConfig().then((config) => {
      this.config = config;
      BECommonDefinitions.start(this.config); //adjust to config
      if (BECommonDefinitions.config.buildType === "deploy")
        Assert.disableAllVerifications = true;
      connector.start(!!this.config.localApp);
    });
  };

  this.startApp = function (appName, app, config) {
    this.start(config);
    BEServer.currentApp = app;
    BEServer.currentAppName = appName;
    BEServer.currentApp.start();
    _sendClientVisibleAgents();
  };

  //send fired event to selected agent
  this.propagateUserEvent = function (event, arg, agent) {
    environment.propagateUserEvent(event, arg, agent);
  };
}

var BEServer = new BEServerConstructor();

export { BEServer };
