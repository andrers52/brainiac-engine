import { strict as assert } from "assert";
import sinon from "sinon";
import { BECommonDefinitions } from "../../common/BECommonDefinitions"; // Adjust the path to your BECommonDefinitions module
import { fakeSocket } from "../../common/singleton/fakeSocket"; // Adjust the path to your fakeSocket module
import { BEServer } from "../../server/singleton/BEServer"; // Adjust the path to your BEServer module
import { environment } from "../agent/singleton/Environment"; // Adjust the path to your Environment module
import { ConnectorConstructor } from "./path/to/ConnectorConstructor"; // Adjust the path to your ConnectorConstructor module

describe("ConnectorConstructor", function () {
  let connector, socket, user, clock;

  beforeEach(function () {
    connector = new ConnectorConstructor();
    socket = {
      emit: sinon.spy(),
      on: sinon.spy(),
      disconnect: sinon.spy(),
    };
    user = {
      id: 1,
      name: "testUser",
      socket,
      agent: {
        id: 1,
        getPosition: sinon.stub().returns({ x: 0, y: 0 }),
      },
      camera: {
        rectangle: {
          checkPointInside: sinon.stub().returns(true),
        },
        canBeSeen: sinon.stub().returns(true),
      },
    };
    connector.getUserById = sinon.stub().returns(user);
    sinon.stub(BEServer, "currentApp").value({
      onUserDead: sinon.spy(),
      onUserConnected: sinon.spy(),
      sendInitialData: sinon.spy(),
      getHighScores: sinon.stub().returns([]),
      start: sinon.spy(),
    });
    sinon.stub(environment, "getNearbyAgentsByRectangle").returns([user.agent]);
    sinon.stub(environment, "propagateUserEvent");
    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    BEServer.currentApp.onUserDead.restore();
    BEServer.currentApp.onUserConnected.restore();
    BEServer.currentApp.sendInitialData.restore();
    environment.getNearbyAgentsByRectangle.restore();
    environment.propagateUserEvent.restore();
    clock.restore();
  });

  it("should get user IDs", function () {
    connector.getUserById.returns(user);
    assert.deepStrictEqual(connector.getUserIds(), [user.id.toString()]);
  });

  it("should get users", function () {
    connector.getUserById.returns(user);
    assert.deepStrictEqual(connector.getUsers(), [user]);
  });

  it("should get user by ID", function () {
    connector.getUserById.returns(user);
    assert.deepStrictEqual(connector.getUserById(user.id), user);
  });

  it("should play sound in client", function () {
    connector.playSoundInClient("testSound");
    assert(socket.emit.calledWith("Sound.playSound", "testSound"));
  });

  it("should play procedural sound in client", function () {
    BECommonDefinitions.config.playProceduralSoundInClient = true;
    const soundDescObj = { sound: "testSound" };
    const generatingEventPosition = { x: 0, y: 0 };
    connector.playProceduralSoundInClient(
      soundDescObj,
      generatingEventPosition,
    );
    assert(socket.emit.calledWith("playDescr", soundDescObj));
  });

  it("should play sound in client loop", function () {
    connector.playSoundInClientLoop("testSound");
    assert(socket.emit.calledWith("Sound.playSoundLoop", "testSound"));
  });

  it("should set visible agents", function () {
    connector.setVisibleAgents();
    assert(socket.emit.calledWith("update", [user.agent]));
  });

  it("should set camera", function () {
    connector.setCamera(user.camera);
    assert(socket.emit.calledWith("camera", user.camera));
  });

  it("should send message to game client", function () {
    connector.messageToGameClient("testMessage", { content: "testContent" });
    assert(
      socket.emit.calledWith("messageToGameClient", {
        message: "testMessage",
        contentObject: { content: "testContent" },
      }),
    );
  });

  it("should send message to single game client", function () {
    connector.messageToSingleGameClient(user.id, "testMessage", {
      content: "testContent",
    });
    assert(
      socket.emit.calledWith("messageToGameClient", {
        message: "testMessage",
        contentObject: { content: "testContent" },
      }),
    );
  });

  it("should remove user by owning agent ID", function () {
    connector.removeUserByOwningAgentId(user.agent.id);
    assert(BEServer.currentApp.onUserDead.calledWith(user));
    assert(socket.disconnect.calledOnce);
  });

  it("should start the connector with a local app", function () {
    sinon.stub(fakeSocket, "on");
    connector.start(true);
    assert(fakeSocket.on.calledOnce);
    fakeSocket.on.restore();
  });

  it("should handle socket connection and events", function () {
    const express = require("express");
    const app = express();
    const server = require("http").Server(app);
    const io = require("socket.io")(server);

    sinon.stub(io, "on");
    connector.start(false);
    assert(io.on.calledOnce);
    io.on.restore();
  });
});
