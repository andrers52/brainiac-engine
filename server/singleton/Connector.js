"use strict";

// generates event to game_server:
//onUserConnected
//onUserDead

import { EObject } from "arslib";
import { BECommonDefinitions } from "../../common/BECommonDefinitions.js";
import { Vector, vect } from "../../common/geometry/Vector.js";
import { fakeSocket } from "../../common/singleton/fakeSocket.js";
import { environment } from "../agent/singleton/Environment.js";

import { Camera } from "../../server/agent/Camera.js";
import { FollowsAgent } from "../../server/agent/mixin/behavior_component/FollowsAgent.js";
import { BEServer } from "../../server/singleton/BEServer.js";
import { User } from "../User.js";

var idToUsers = {};

function ConnectorConstructor() {
  var io;

  this.getUserIds = function () {
    return Object.keys(idToUsers);
  };
  this.getUsers = function () {
    return Object.values(idToUsers);
  };
  this.getUserById = function (id) {
    return idToUsers[id];
  };

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

  this.playSoundInClientLoop = function (soundName) {
    //TODO: CHECK DISTANCE BEFORE SENDING
    for (var id in idToUsers) {
      let user = idToUsers[id];
      user.socket.emit("Sound.playSoundLoop", soundName);
    }
  };

  this.setVisibleAgents = function () {
    for (var id in idToUsers) {
      let user = idToUsers[id];
      if (!user.camera) continue;
      let nearbyAgents = environment.getNearbyAgentsByRectangle(
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
  this.setCamera = function (camera) {
    // set camera position to user received position
    // Note: this presuposes the user is always at the center
    if (!BECommonDefinitions.config.userAlwaysAtCenterOfCamera) return;

    // Independent camera

    if (!idToUsers[camera.owner.id]) return;

    idToUsers[camera.owner.id].socket.emit("camera", camera);
  };

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

  this.start = function (localApp) {
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
    //message dispatch
    io.on("connection", function (socketInput) {
      if (localApp) socketInput = fakeSocket;

      let socket = socketInput; //define connection socket here
      let user = new User(socketInput);

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
      //startAppArgs = {userName: <userName>, cameraSize: <cameraSize>}
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

        socket.on("userEvent", function (eventAndVectorArg) {
          //if(!user.agent) return // user not logged
          BEServer.propagateUserEvent(
            eventAndVectorArg.event,
            eventAndVectorArg.arg,
            user.agent,
          );
        });
      });

      socket.on("requestInitialPageInfo", () => {
        socket.emit("requestInitialPageInfoReady", {
          highScores: BEServer.currentApp.getHighScores(),
        });
      });
    });
  };
}

var connector = new ConnectorConstructor();

export { connector };
