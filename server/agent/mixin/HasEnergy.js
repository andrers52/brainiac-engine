"use strict";

export function HasEnergy(initialEnergy = 100, maxEnergy = 100) {
  let energy = initialEnergy;
  this.increaseEnergy = function (energyToAdd) {
    energy += energyToAdd;
    if (energy > maxEnergy) energy = maxEnergy;
  };
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
  this.getEnergy = function () {
    return energy;
  };

  //adding a getter for energy
  Object.defineProperty(this, "energy", {
    get: function () {
      return energy;
    },
    enumerable: true,
  });
}
