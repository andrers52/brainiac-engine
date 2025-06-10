import { strict as assert } from "assert";
import sinon from "sinon";
import { Pulsate } from "../../../../../server/agent/mixin/image_effect/Pulsate.js";

describe("Pulsate", function () {
  let agent, clock;

  beforeEach(function () {
    agent = {
      rectangle: {
        size: {
          x: 10,
          y: 10,
          clone: function () {
            return { x: this.x, y: this.y };
          },
        },
        grow: function (factor) {
          this.size.x *= factor;
          this.size.y *= factor;
        },
        shrink: function (factor) {
          this.size.x /= factor;
          this.size.y /= factor;
        },
      },
      started: false,
    };

    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    clock.restore();
  });

  it("should initialize with default max time if not provided", function () {
    Pulsate.call(agent);
    assert.strictEqual(agent.maxTimeinMilliseconds, undefined);
  });

  it("should start and stop pulsate correctly", function () {
    const initialSize = agent.rectangle.size.clone();

    Pulsate.call(agent, 2000);
    agent.startPulsate();
    assert(agent.started);

    clock.tick(500);
    assert(agent.rectangle.size.x > initialSize.x);
    assert(agent.rectangle.size.y > initialSize.y);

    clock.tick(500);
    assert(agent.rectangle.size.x < initialSize.x * 1.1);
    assert(agent.rectangle.size.y < initialSize.y * 1.1);

    clock.tick(1000);
    agent.stopPulsate();
    assert(!agent.started);
    assert.strictEqual(agent.rectangle.size.x, initialSize.x);
    assert.strictEqual(agent.rectangle.size.y, initialSize.y);
  });

  it("should pulsate correctly during the cycle", function () {
    const initialSize = agent.rectangle.size.clone();

    Pulsate.call(agent, 2000);
    agent.startPulsate();
    assert(agent.started);

    clock.tick(500);
    assert(agent.rectangle.size.x > initialSize.x);
    assert(agent.rectangle.size.y > initialSize.y);

    clock.tick(500);
    assert(agent.rectangle.size.x < initialSize.x * 1.1);
    assert(agent.rectangle.size.y < initialSize.y * 1.1);

    clock.tick(1000);
    agent.stopPulsate();
    assert(!agent.started);
    assert.strictEqual(agent.rectangle.size.x, initialSize.x);
    assert.strictEqual(agent.rectangle.size.y, initialSize.y);
  });

  it("should reset size after stop pulsate", function () {
    const initialSize = agent.rectangle.size.clone();

    Pulsate.call(agent, 2000);
    agent.startPulsate();
    assert(agent.started);

    clock.tick(2000);
    agent.stopPulsate();
    assert(!agent.started);
    assert.strictEqual(agent.rectangle.size.x, initialSize.x);
    assert.strictEqual(agent.rectangle.size.y, initialSize.y);
  });

  it("should not start pulsate if already started", function () {
    Pulsate.call(agent, 2000);
    agent.startPulsate();
    assert(agent.started);

    const startSpy = sinon.spy(agent, "startPulsate");

    agent.startPulsate();
    assert(startSpy.notCalled);
  });

  it("should not stop pulsate if not started", function () {
    const stopSpy = sinon.spy(agent, "stopPulsate");

    Pulsate.call(agent, 2000);
    agent.stopPulsate();
    assert(stopSpy.calledOnce);
  });
});
