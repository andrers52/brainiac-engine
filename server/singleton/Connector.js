"use strict";

/**
 * @file Connection management system for client-server communication.
 * Handles user connections, event propagation, and real-time updates.
 * @module Connector
 */

/**
 * Events generated to game server:
 * - onUserConnected: Called when a new user connects
 * - onUserDead: Called when a user disconnects or dies
 */

import { EObject } from "arslib";
import { BECommonDefinitions } from "../../common/BECommonDefinitions.js";
import { Vector, vect } from "../../common/geometry/Vector.js";
import { BEServer } from "./BEServer.js";

import { Camera } from "../../server/agent/Camera.js";
import { FollowsAgent } from "../../server/agent/mixin/behavior_component/FollowsAgent.js";
import { User } from "../User.js";

/** @type {Object.<string, User>} Map of user IDs to User objects */
var idToUsers = {};

/**
 * Constructor for the client-server connection manager.
 * Manages WebSocket connections, user sessions, and real-time communication.
 * @constructor
 * @class Connector
 */
function Connector() {
  /** @type {Object} Socket.IO server instance */
  var io;

  /**
   * Gets all connected user IDs.
   * @memberof Connector
   * @returns {Array<string>} Array of user ID strings
   */
  this.getUserIds = function () {
    return Object.keys(idToUsers);
  };

  /**
   * Gets all connected User objects.
   * @memberof Connector
   * @returns {Array<User>} Array of connected User instances
   */
  this.getUsers = function () {
    return Object.values(idToUsers);
  };

  /**
   * Gets a specific user by their ID.
   * @memberof Connector
   * @param {string} id - The user ID to look up
   * @returns {User|undefined} The User object or undefined if not found
   */
  this.getUserById = function (id) {
    return idToUsers[id];
  };

  /**
   * Plays a sound on all connected clients.
   * @memberof Connector
   * @param {string} soundName - Name of the sound resource to play
   * @todo Add distance checking before sending to optimize network traffic
   */
  this.playSoundInClient = function (soundName) {
    //TODO: CHECK DISTANCE BEFORE SENDING
    for (var id in idToUsers) {
      let user = idToUsers[id];
      user.socket.emit("Sound.playSound", soundName);
    }

    //TODO: CHECK DISTANCE BEFORE SENDING
    // for (var id in idToUsers) {
    //   let user = idToUsers[id];
    //   user.socket.emit("Sound.playSound", soundName);
    // }
  };

  /**
   * Plays a procedural sound on clients within camera view of the event position.
   * Only plays if procedural sound is enabled in configuration.
   * @memberof Connector
   * @param {Object} soundDescObj - Sound description object for procedural generation
   * @param {Vector} generatingEventPosition - World position where the sound originates
   */
  this.playProceduralSoundInClient = function (
    soundDescObj,
    generatingEventPosition,
  ) {
    if (!BECommonDefinitions.config.playProceduralSoundInClient) return;
    for (var id in idToUsers) {
      let user = idToUsers[id];
      if (
        !user.agent ||
        !user.camera.rectangle.checkPointInside(generatingEventPosition)
      ) {
        continue;
      }
      user.socket.emit("playDescr", soundDescObj);
    }
  };

  /**
   * Plays a looping sound on all connected clients.
   * @memberof Connector
   * @param {string} soundName - Name of the sound resource to play in loop
   * @todo Add distance checking before sending to optimize network traffic
   */
  this.playSoundInClientLoop = function (soundName) {
    //TODO: CHECK DISTANCE BEFORE SENDING
    for (var id in idToUsers) {
      let user = idToUsers[id];
      user.socket.emit("Sound.playSoundLoop", soundName);
    }
  };

  /**
   * Sends visible agents to all connected clients based on their camera views.
   * Filters agents to only include those visible to each user's camera.
   * @memberof Connector
   */
  this.setVisibleAgents = function () {
    for (var id in idToUsers) {
      let user = idToUsers[id];
      if (!user.camera) continue;
      let nearbyAgents = BEServer.getEnvironment().getNearbyAgentsByRectangle(
        user.camera.rectangle,
      );

      let userVisibleAgents = nearbyAgents.filter(
        // camera will be sent separately
        (agent) => !agent.isCamera && user.camera.canBeSeen(agent.rectangle),
      );

      // for network visualization
      //console.log('userVisibleAgents:' + JSON.stringify(userVisibleAgents))
      //console.log('Num userVisibleAgents:' + userVisibleAgents.length)

      user.socket.emit("update", userVisibleAgents);
    }
  };

  /**
   * Sets camera position for a user if user-centered camera is enabled.
   * @memberof Connector
   * @param {Camera} camera - The camera object to update
   */
  this.setCamera = function (camera) {
    // set camera position to user received position
    // Note: this presuposes the user is always at the center
    if (!BECommonDefinitions.config.userAlwaysAtCenterOfCamera) return;

    // Independent camera

    if (!idToUsers[camera.owner.id]) return;

    idToUsers[camera.owner.id].socket.emit("camera", camera);
  };

  /**
   * Sends a message to all connected game clients.
   * @memberof Connector
   * @param {string} message - The message type/identifier
   * @param {Object} contentObject - The message content object
   */
  this.messageToGameClient = function (message, contentObject) {
    if (Object.keys(idToUsers).length === 0) return;
    io.emit("messageToGameClient", {
      message: message,
      contentObject: contentObject,
    });

    // Object.keys(idToUsers)
    //   .filter(id => idToUsers[id].agent) //remove users not playing (no agent associated)
    //   .forEach(id => {
    //     idToUsers[id].socket.emit(
    //       "messageToGameClient",
    //       { "message": message, "contentObject": contentObject });
    //   });
  };

  /**
   * Sends a message to a specific game client by user ID.
   * @memberof Connector
   * @param {string} userId - ID of the user to send message to
   * @param {string} message - The message type/identifier
   * @param {Object} contentObject - The message content object
   */
  this.messageToSingleGameClient = function (userId, message, contentObject) {
    if (!idToUsers[userId]) return; //user has disconnected before death
    try {
      idToUsers[userId].socket.emit("messageToGameClient", {
        message: message,
        contentObject: contentObject,
      });
    } catch (e) {
      console.log(
        `data encoding error. Message is:${message},  contentObject is: ${JSON.stringify(
          contentObject,
        )}`,
      );
    }
  };

  /**
   * Removes a user from the system by their owning agent ID.
   * Calls the application's onUserDead handler and cleans up the user session.
   * @memberof Connector
   * @param {number} owningAgentId - ID of the agent that owns the user to remove
   */
  this.removeUserByOwningAgentId = function (owningAgentId) {
    for (var id in idToUsers) {
      let user = idToUsers[id];
      if (user.agent && user.agent.id === owningAgentId) {
        BEServer.currentApp.onUserDead(user);
        //setTimeout(() => user.socket.disconnect(), 2000);
        delete idToUsers[id];
      }
    }
  };

  /**
   * Starts the connector system, setting up either real WebSocket server or fake socket for local apps.
   * @memberof Connector
   * @param {boolean} localApp - Whether this is a local application (uses fake socket) or networked (uses real WebSocket)
   * @param {Object} [fakeSocket] - The fake socket instance to use for local apps (provided by BEServer)
   */
  this.start = function (localApp, fakeSocket) {
    if (!localApp) {
      // var compression = require('compression')
      const cors = require("cors");
      var express = require("express");
      var app = express();

      const corsOptions = {
        origin: `http://${BECommonDefinitions.WEB_SOCKET_ADDRESS_IP}`,
      };

      app.use(cors(corsOptions));

      var server = require("http").Server(app);

      io = require("socket.io")(server);

      server.listen(BECommonDefinitions.WEB_PORT, function () {
        console.log(
          "Web server listening at port %d",
          BECommonDefinitions.WEB_PORT,
        );
      });

      app.use(express.static("."));
    } else {
      io = fakeSocket;
    }

    /**
     * Sets up message handling for client connections.
     * Handles user connection, disconnection, and various game events.
     * @private
     */
    io.on("connection", function (socketInput) {
      if (localApp) socketInput = io; // Use the same shared FakeSocket instance

      /** @type {Object} The client socket connection */
      let socket = socketInput; //define connection socket here
      /** @type {User} User object for this connection */
      let user = new User(socketInput);

      /**
       * Removes the user from the system and notifies the application.
       * @private
       */
      function removeUser() {
        BEServer.currentApp.onUserDead(user);
        delete idToUsers[user.id];
      }

      //sockets.add(socket);
      socket.on("LOG_MESSAGE", function (msg) {
        console.log(msg);
      });
      socket.on("disconnect", function () {
        removeUser();
      });

      /**
       * Handles client start request with user name and camera size.
       * Sets up user agent, camera, and initializes the game session.
       * @param {Object} startAppArgs - Client start arguments
       * @param {string} startAppArgs.userName - Name of the user
       * @param {Vector} startAppArgs.cameraSize - Size of the user's camera viewport
       */
      socket.on("BEServer.clientStart", function (startAppArgs) {
        //removeUser();
        user.name = startAppArgs.userName;

        //BEServer.currentLanguage = startAppArgs.currentLanguage;
        let cameraSize = startAppArgs.cameraSize;
        EObject.extend(cameraSize, Vector.prototype);
        console.log("EXEC: BEServer.clientStart");

        if (BECommonDefinitions.config.worldToCameraSize) {
          BECommonDefinitions.WORLD_WIDTH = cameraSize.x;
          BECommonDefinitions.WORLD_HEIGHT = cameraSize.y;
        }
        //warn game_server of connection
        BEServer.currentApp.onUserConnected(user, cameraSize);
        idToUsers[user.id] = user;

        user.camera = new Camera(user);
        if (BEServer.config.cameraFollowUser) {
          user.camera.start(cameraSize, user.agent.getPosition());
          FollowsAgent.call(user.camera, user.agent, true);
        } else user.camera.start(cameraSize, vect(0, 0));

        //tell the client we are ready
        socket.emit("BEServer.clientStartReady", {
          userAgentId: user.agent ? user.agent.id : 0,
          backgroundImagename: BEServer.getBackgroundImageName(),
        });

        BEServer.currentApp.sendInitialData &&
          BEServer.currentApp.sendInitialData(user);

        /**
         * Handles user input events from the client.
         * @param {Object} eventAndVectorArg - Event data from client
         * @param {string} eventAndVectorArg.event - Event name
         * @param {*} eventAndVectorArg.arg - Event argument
         */
        socket.on("userEvent", function (eventAndVectorArg) {
          //if(!user.agent) return // user not logged
          BEServer.propagateUserEvent(
            eventAndVectorArg.event,
            eventAndVectorArg.arg,
            user.agent,
          );
        });
      });

      /**
       * Handles request for initial page information like high scores.
       */
      socket.on("requestInitialPageInfo", () => {
        socket.emit("requestInitialPageInfoReady", {
          highScores: BEServer.currentApp.getHighScores(),
        });
      });
    });
  };
}

export { Connector };
