import { strict as assert } from "assert";
import sinon from "sinon";
import { Rectangle } from "../../../common/geometry/Rectangle.js";
import { Vector } from "../../../common/geometry/Vector.js";
import { connector } from "../../singleton/Connector.js";
import { ChangesImageWithState } from "./ChangesImageWithState.js";

describe("ChangesImageWithState", function () {
  const SAMPLE_CONFIGURATION = {
    defaultState: "idle",
    states: [
      { stateName: "idle", image: "idle.png", audioName: "idle.mp3" },
      { stateName: "running", image: "running.png", audioName: "running.mp3" },
    ],
  };

  let agent;

  beforeEach(function () {
    agent = {
      getSize: sinon.stub().returns(new Vector(0, 0)),
      rectangle: new Rectangle(),
      currentState: null,
      imageName: null,
      audioName: null,
    };
    sinon.stub(connector, "playSoundInClient");
    ChangesImageWithState.call(agent, SAMPLE_CONFIGURATION);
  });

  afterEach(function () {
    connector.playSoundInClient.restore();
  });

  it("should initialize with the default state", function () {
    assert.strictEqual(agent.currentState, "idle");
  });

  it("should update image and audio on state change", function () {
    agent.changeState("running");
    assert.strictEqual(agent.imageName, "running.png");
    assert.strictEqual(agent.audioName, "running.mp3");
    assert(connector.playSoundInClient.calledWith("running.mp3"));
  });

  it("should not change to an invalid state", function () {
    assert.throws(() => {
      agent.changeState("invalidState");
    });
  });

  it("should add and execute actions at state change", function () {
    const actionSpy = sinon.spy();
    agent.addActionToExecuteAtStateChange("idle", actionSpy);
    agent.changeState("running");
    assert(actionSpy.calledOnce, "Action at state change was not called");
  });

  it("should update image and audio during initialization", function () {
    assert.strictEqual(agent.imageName, "idle.png");
    assert.strictEqual(agent.audioName, "idle.mp3");
    assert(connector.playSoundInClient.calledWith("idle.mp3"));
  });

  it("should create a rectangle if size is zero during initialization", function () {
    const rectangleSpy = sinon.spy(Rectangle.prototype, "constructor");
    ChangesImageWithState.call(agent, SAMPLE_CONFIGURATION);
    assert.strictEqual(agent.rectangle.getSize().x, 10);
    assert.strictEqual(agent.rectangle.getSize().y, 10);
    rectangleSpy.restore();
  });
});
