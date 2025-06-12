import { strict as assert } from "assert";
import sinon from "sinon";
import { HasEnergy } from "./HasEnergy.js";

describe("HasEnergy", function () {
  let agent;

  beforeEach(function () {
    agent = {};
    HasEnergy.call(agent, 50, 100); // Initialize with 50 initial energy and 100 max energy
  });

  it("should initialize with the given initial energy and max energy", function () {
    assert.strictEqual(agent.getEnergy(), 50);
    assert.strictEqual(agent.energy, 50);
  });

  it("should increase energy", function () {
    agent.increaseEnergy(30);
    assert.strictEqual(agent.getEnergy(), 80);
    agent.increaseEnergy(50); // Exceeding max energy
    assert.strictEqual(agent.getEnergy(), 100);
  });

  it("should decrease energy", function () {
    assert.strictEqual(agent.decreaseEnergy(20), true);
    assert.strictEqual(agent.getEnergy(), 30);
  });

  it("should not decrease energy below zero if negativeEnergyKills is false", function () {
    assert.strictEqual(agent.decreaseEnergy(60), false);
    assert.strictEqual(agent.getEnergy(), 50);
  });

  it("should call die method if energy goes negative and negativeEnergyKills is true", function () {
    agent.die = sinon.spy();
    assert.strictEqual(agent.decreaseEnergy(60, true), false);
    assert(agent.die.calledOnce);
  });

  it("should provide a getter for energy", function () {
    agent.increaseEnergy(20);
    assert.strictEqual(agent.energy, 70);
  });
});
