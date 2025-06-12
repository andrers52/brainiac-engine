import { strict as assert } from "assert";
import sinon from "sinon";
import { Vector } from "../../../common/geometry/Vector.js";
import { environment } from "../singleton/Environment.js";
import { SensingWorldBorder } from "./SensingWorldBorder.js";

describe("SensingWorldBorder", function () {
  let agent, worldRectangleStub;

  beforeEach(function () {
    agent = {
      getPosition: sinon.stub().returns(new Vector(0, 0)),
      move: sinon.stub().returns(true), // Return true like real move method
      onSensingWorldBorder: sinon.spy(),
    };

    worldRectangleStub = sinon.stub(environment, "getWorldRectangle").returns({
      checkPointInside: sinon.stub().returns(true),
    });

    SensingWorldBorder.call(agent);
  });

  afterEach(function () {
    worldRectangleStub.restore();
  });

  it("should throw an error if onSensingWorldBorder event handler is not implemented", function () {
    assert.throws(() => {
      SensingWorldBorder.call({});
    }, /Error: added SensingWorldBorder to agent without implementing onSensingWorldBorder event handler/);
  });

  it("should detect border collision in UP direction", function () {
    worldRectangleStub.returns({
      checkPointInside: sinon.stub().callsFake((position) => {
        return position.y < 50; // Return false when y >= 50 (outside)
      }),
    });

    agent.getPosition.returns(new Vector(0, 0));
    agent.move();

    assert(agent.onSensingWorldBorder.calledOnce);
    assert.strictEqual(agent.onSensingWorldBorder.firstCall.args[0].y, 50);
  });

  it("should detect border collision in DOWN direction", function () {
    worldRectangleStub.returns({
      checkPointInside: sinon.stub().callsFake((position) => position.y >= -50),
    });

    agent.getPosition.returns(new Vector(0, -45));
    agent.move();

    assert(agent.onSensingWorldBorder.calledOnce);
    assert.strictEqual(agent.onSensingWorldBorder.firstCall.args[0].y, -50);
  });

  it("should detect border collision in LEFT direction", function () {
    worldRectangleStub.returns({
      checkPointInside: sinon.stub().callsFake((position) => position.x >= -50),
    });

    agent.getPosition.returns(new Vector(-45, 0));
    agent.move();

    assert(agent.onSensingWorldBorder.calledOnce);
    assert.strictEqual(agent.onSensingWorldBorder.firstCall.args[0].x, -50);
  });

  it("should detect border collision in RIGHT direction", function () {
    worldRectangleStub.returns({
      checkPointInside: sinon.stub().callsFake((position) => position.x <= 50),
    });

    agent.getPosition.returns(new Vector(45, 0));
    agent.move();

    assert(agent.onSensingWorldBorder.calledOnce);
    assert.strictEqual(agent.onSensingWorldBorder.firstCall.args[0].x, 50);
  });

  it("should not detect any border collision", function () {
    worldRectangleStub.returns({
      checkPointInside: sinon.stub().returns(true),
    });

    agent.getPosition.returns(new Vector(0, 0));
    agent.move();

    assert(agent.onSensingWorldBorder.notCalled);
  });
});
