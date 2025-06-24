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

import { BECommonDefinitions } from "../common/BECommonDefinitions.js";
import { Vector } from "../common/geometry/Vector.js";
import { BEServer } from "./BEServer.js";

import { Camera } from "./agent/Camera.js";
import { FollowsAgent } from "./agent/mixin/behavior_component/FollowsAgent.js";
import { User } from "./User.js";

/** @type {Object.<string, User>} Map of user IDs to User objects */
var idToUsers = {};

/**
 * Constructor for the client-server connection manager.
 * Manages WebSocket connections, user sessions, and real-time communication.
 * @constructor
 * @param {BEServer} beServer - The BEServer instance.
 * @class Connector
 */
function Connector(beServer) {
  /** @type {Object} Socket.IO server instance */
  var io;
  /** @type {Object} HTTP server instance (for cleanup) */
  var httpServer;
  /** @type {boolean} Whether this connector is running in local app mode */
  var isLocalApp = false;

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
      let nearbyAgents = beServer
        .getEnvironment()
        .getNearbyAgentsByRectangle(user.camera.rectangle);

      let userVisibleAgents = nearbyAgents.filter(
        // camera will be sent separately
        (agent) => !agent.isCamera && user.camera.canBeSeen(agent.rectangle),
      );

      // Sanitize agent data to avoid circular references
      let sanitizedAgents = userVisibleAgents.map((agent) => ({
        id: agent.id,
        imageName: agent.imageName,
        rectangle: agent.rectangle
          ? {
              x: agent.rectangle.x,
              y: agent.rectangle.y,
              width: agent.rectangle.width,
              height: agent.rectangle.height,
              center: agent.rectangle.center
                ? {
                    x: agent.rectangle.center.x,
                    y: agent.rectangle.center.y,
                    data: [agent.rectangle.center.x, agent.rectangle.center.y],
                  }
                : {
                    x: agent.rectangle.x + agent.rectangle.width / 2,
                    y: agent.rectangle.y + agent.rectangle.height / 2,
                    data: [
                      agent.rectangle.x + agent.rectangle.width / 2,
                      agent.rectangle.y + agent.rectangle.height / 2,
                    ],
                  },
              size: agent.rectangle.size
                ? {
                    x: agent.rectangle.size.x,
                    y: agent.rectangle.size.y,
                    data: [agent.rectangle.size.x, agent.rectangle.size.y],
                  }
                : {
                    x: agent.rectangle.width,
                    y: agent.rectangle.height,
                    data: [agent.rectangle.width, agent.rectangle.height],
                  },
            }
          : null,
        position: agent.getPosition ? agent.getPosition() : null,
        orientation: agent.orientation,
        energy: agent.energy,
        userScore: agent.userScore,
        name: agent.name,
        type: agent.type,
        isBonus: agent.isBonus,
        isAI: agent.isAI,
        // Include all ship properties (as they were originally)
        thrust: agent.thrust,
        currentWeapon: agent.currentWeapon,
        alternateWeaponTimeLeft: agent.alternateWeaponTimeLeft,
        userId: agent.userId,
        // Add any other necessary properties that are safe to serialize
      }));

      // for network visualization
      //console.log('userVisibleAgents:' + JSON.stringify(sanitizedAgents))
      //console.log('Num userVisibleAgents:' + sanitizedAgents.length)

      user.socket.emit("update", sanitizedAgents);
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

    // Sanitize camera data to avoid circular references
    let sanitizedCamera = {
      id: camera.id,
      rectangle: camera.rectangle
        ? {
            x: camera.rectangle.x,
            y: camera.rectangle.y,
            width: camera.rectangle.width,
            height: camera.rectangle.height,
            center: camera.rectangle.center
              ? {
                  x: camera.rectangle.center.x,
                  y: camera.rectangle.center.y,
                  data: [camera.rectangle.center.x, camera.rectangle.center.y],
                }
              : {
                  x: camera.rectangle.x + camera.rectangle.width / 2,
                  y: camera.rectangle.y + camera.rectangle.height / 2,
                  data: [
                    camera.rectangle.x + camera.rectangle.width / 2,
                    camera.rectangle.y + camera.rectangle.height / 2,
                  ],
                },
            size: camera.rectangle.size
              ? {
                  x: camera.rectangle.size.x,
                  y: camera.rectangle.size.y,
                  data: [camera.rectangle.size.x, camera.rectangle.size.y],
                }
              : {
                  x: camera.rectangle.width,
                  y: camera.rectangle.height,
                  data: [camera.rectangle.width, camera.rectangle.height],
                },
          }
        : null,
      position: camera.getPosition ? camera.getPosition() : null,
      // Add any other necessary camera properties that are safe to serialize
    };

    idToUsers[camera.owner.id].socket.emit("camera", sanitizedCamera);
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
    if (!idToUsers[userId]) {
      return; //user has disconnected before death
    }
    try {
      idToUsers[userId].socket.emit("messageToGameClient", {
        message: message,
        contentObject: contentObject,
      });
    } catch (e) {
      console.log(
        `data encoding error. Message is: ${message}, Error: ${e.message}`,
      );
      console.log("ContentObject type:", typeof contentObject);
      console.log(
        "ContentObject keys:",
        contentObject ? Object.keys(contentObject) : "null",
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
    let user = this.getUsers().find(
      (user) => user.agent && user.agent.id === owningAgentId,
    );
    if (user) {
      // Call the application's onUserDead handler
      if (beServer.currentApp && beServer.currentApp.onUserDead) {
        // Use injected beServer instance
        beServer.currentApp.onUserDead(user); // Use injected beServer instance
      }
      // Clean up user session
      delete idToUsers[user.id];
      if (user.socket) {
        user.socket.disconnect();
      }
    }
  };

  /**
   * Starts the connector system, setting up either real WebSocket server or fake socket for local apps.
   * @memberof Connector
   * @param {boolean} localApp - Whether this is a local application (uses fake socket) or networked (uses real WebSocket)
   * @param {Object} [fakeSocket] - The fake socket instance to use for local apps (provided by BEServer)
   */ this.start = async function (localApp, fakeSocket) {
    isLocalApp = !!localApp;

    if (!localApp) {
      // Dynamic imports for server dependencies (only when running in server mode)
      const { createServer } = await import("http");
      const { Server: SocketIOServer } = await import("socket.io");

      // Use the Express app created by BEServer
      const expressApp = beServer.getExpressApp();

      if (!expressApp) {
        throw new Error(
          "Express app not available from BEServer. Make sure BEServer.start() was called first.",
        );
      }

      httpServer = createServer(expressApp);

      io = new SocketIOServer(httpServer);

      httpServer.listen(BECommonDefinitions.WEB_PORT, function () {
        console.log(
          `Web server listening at port ${BECommonDefinitions.WEB_PORT}`,
        );
      });
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
        beServer.currentApp.onUserDead(user);
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

        // Fallback if cameraSize is invalid, and create proper Vector object
        if (
          !cameraSize ||
          typeof cameraSize.x !== "number" ||
          typeof cameraSize.y !== "number"
        ) {
          cameraSize = new Vector(900, 900); // Create proper Vector with fallback values
        } else {
          // Convert valid cameraSize to proper Vector object
          cameraSize = new Vector(cameraSize.x, cameraSize.y);
        }

        if (BECommonDefinitions.config.worldToCameraSize) {
          BECommonDefinitions.WORLD_WIDTH = cameraSize.x;
          BECommonDefinitions.WORLD_HEIGHT = cameraSize.y;
        }
        //warn game_server of connection
        beServer.currentApp.onUserConnected(user, cameraSize);
        idToUsers[user.id] = user;

        user.camera = new Camera(beServer, user);
        if (beServer.config.cameraFollowUser) {
          user.camera.start(cameraSize, user.agent.getPosition());
          FollowsAgent.call(user.camera, user.agent, true);
        } else user.camera.start(cameraSize, new Vector(0, 0));

        //tell the client we are ready
        socket.emit("BEServer.clientStartReady", {
          userAgentId: user.agent ? user.agent.id : 0,
          backgroundImagename: beServer.getBackgroundImageName(),
        });

        beServer.currentApp.sendInitialData &&
          beServer.currentApp.sendInitialData(user);

        /**
         * Handles user input events from the client.
         * @param {Object} eventAndVectorArg - Event data from client
         * @param {string} eventAndVectorArg.event - Event name
         * @param {*} eventAndVectorArg.arg - Event argument
         * @param {Object} [eventAndVectorArg.clientCamera] - Client camera for viewport filtering
         */
        socket.on("userEvent", function (eventAndVectorArg) {
          //if(!user.agent) return // user not logged
          if (
            eventAndVectorArg &&
            eventAndVectorArg.event &&
            eventAndVectorArg.arg
          ) {
            // For mouse events, don't pass user agent to allow spatial search for widgets
            const targetAgent = eventAndVectorArg.event.includes("Mouse")
              ? null
              : user.agent;

            beServer.propagateUserEvent(
              eventAndVectorArg.event,
              eventAndVectorArg.arg,
              eventAndVectorArg.clientCamera, // Pass client camera for viewport filtering
              targetAgent,
            );
          }
        });
      });

      /**
       * Handles request for initial page information like high scores.
       */
      socket.on("requestInitialPageInfo", () => {
        socket.emit("requestInitialPageInfoReady", {
          highScores: beServer.currentApp.getHighScores(),
        });
      });
    });
  };

  /**
   * Stops the connector and cleans up resources.
   * @memberof Connector
   */
  this.stop = function () {
    // Clear user connections
    idToUsers = {};

    // Close HTTP server if running in server mode
    if (!isLocalApp && httpServer) {
      httpServer.closeAllConnections?.(); // Close all connections immediately if available
      httpServer.close();
      httpServer = null;
    }

    // Close Socket.IO server
    if (io && io.close) {
      io.close();
    }
    io = null;
  };
}

export { Connector };
