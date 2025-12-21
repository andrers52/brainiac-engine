'use strict';

/**
 * @fileoverview Energy management system for agents.
 * Provides energy tracking with increase/decrease functionality and optional death on energy depletion.
 */

/**
 * Adds energy management capabilities to an agent.
 * @param {number} [initialEnergy=100] - Starting energy level.
 * @param {number} [maxEnergy=100] - Maximum energy level the agent can have.
 */
export function HasEnergy(initialEnergy = 100, maxEnergy = 100) {
  let energy = initialEnergy;

  /**
   * Increases the agent's energy, capped at maximum energy.
   * @memberof HasEnergy
   * @param {number} energyToAdd - Amount of energy to add.
   */
  this.increaseEnergy = function (energyToAdd) {
    energy += energyToAdd;
    if (energy > maxEnergy) energy = maxEnergy;
  };

  /**
   * Decreases the agent's energy with optional death on negative energy.
   * @memberof HasEnergy
   * @param {number} energyToSubtract - Amount of energy to subtract.
   * @param {boolean} [negativeEnergyKills=false] - Whether to kill agent if energy goes negative.
   * @returns {boolean} True if energy was successfully decreased, false if would go negative.
   */
  this.decreaseEnergy = function (
    energyToSubtract,
    negativeEnergyKills = false,
  ) {
    let newEnergy = energy - energyToSubtract;
    if (newEnergy < 0) {
      if (negativeEnergyKills) this.die();
      return false;
    }
    energy = newEnergy;
    return true;
  };

  /**
   * Gets the current energy level.
   * @memberof HasEnergy
   * @returns {number} Current energy level.
   */
  this.getEnergy = function () {
    return energy;
  };

  /**
   * @memberof HasEnergy
   * @type {number}
   * @description Read-only property for accessing current energy level.
   */
  Object.defineProperty(this, 'energy', {
    get: function () {
      return energy;
    },
    enumerable: true,
  });
}
