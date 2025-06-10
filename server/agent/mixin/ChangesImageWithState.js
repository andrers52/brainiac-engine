"use strict";

import { Assert } from "arslib";
import { Rectangle } from "../../../common/geometry/Rectangle.js";
import { Vector } from "../../../common/geometry/Vector.js";
import { connector } from "../../singleton/Connector.js";

/**
 * @fileoverview State-based image and audio management for agents.
 * Allows agents to change their visual appearance and audio based on different states.
 *
 * Configuration format:
 * {
 *   "defaultState": "<state_nameX>",
 *   "states": [
 *     {"stateName": <state_name1>, "image": <state_name1_image>, "audioName": <audioName1>},
 *     ...,
 *     {"stateName": <state_nameN>, "image": <state_nameN_image>, "audioName": <audioNameN>}
 *   ]
 * }
 */

/**
 * Adds state-based image and audio changing capabilities to an agent.
 * @param {Object} configurationObj - State configuration object.
 * @param {string} configurationObj.defaultState - Default state name.
 * @param {Array} configurationObj.states - Array of state definitions.
 * @param {string} configurationObj.states[].stateName - Name of the state.
 * @param {string} configurationObj.states[].image - Image name for this state.
 * @param {string} [configurationObj.states[].audioName] - Optional audio name for this state.
 * @throws {Error} If configuration is invalid or resources are missing.
 */
export function ChangesImageWithState(configurationObj) {
  let self = this;

  let states = [];
  let defaultState = "notInitialized";

  //state -> image name
  let imagePerState = {};
  //state -> audio name
  let audioPerState = {};

  //actions to execute when entering an new state. Added "a posteriori" by user
  //actions will be called on "self" context ("this" inside function)
  let actionsToExecuteAtStateChange = {};

  /**
   * @memberof ChangesImageWithState
   * @type {string}
   * @description Current state name of the agent.
   */
  this.currentState = "notInitialized"; //TODO: CHANGE TO READ ONLY PROPERTY

  /**
   * Initializes the state system from configuration.
   * @param {Object} configurationObj - State configuration object.
   * @throws {Error} If configuration is invalid.
   */
  function start(configurationObj) {
    try {
      defaultState = self.currentState = configurationObj.defaultState;
      configurationObj.states.forEach(function (state) {
        states.push(state.stateName);
        imagePerState[state.stateName] = state.image;
        audioPerState[state.stateName] = state.audioName;
      });

      updateImageAndAudio(defaultState);
    } catch (exception) {
      throw (
        "ChangesImageWithState initialization error: resources descriptor reading: " +
        exception
      );
    }
    Assert.assert(
      states.includes(defaultState),
      "ChangesImageWithState error: resources integrity check failed",
    );

    self.currentState = defaultState;
  }

  /**
   * Updates the agent's image and audio based on the given state.
   * @param {string} state - State name to update to.
   */
  function updateImageAndAudio(state) {
    self.imageName = imagePerState[state];
    if (self.getSize().x === 0 && self.getSize().x === 0) {
      //agent may have size.x === size.y === 0 because it was initialized without a rectangle
      self.rectangle = new Rectangle(
        self.rectangle.getPosition() || null,
        new Vector(10, 10),
      );
    }
    self.audioName = audioPerState[state];
    connector.playSoundInClient(self.audioName);
  }

  /**
   * Checks if a state name is valid.
   * @param {string} state - State name to validate.
   * @returns {boolean} True if state is valid.
   */
  function isValidState(state) {
    return states.includes(state);
  }

  /**
   * Changes the agent to a new state.
   * @memberof ChangesImageWithState
   * @param {string} newState - Name of the new state.
   * @returns {Object} This agent instance for chaining.
   * @throws {Error} If newState is not valid.
   */
  this.changeState = function (newState) {
    Assert.assert(isValidState(newState));

    //test if needs to perform action at end of animation
    if (actionsToExecuteAtStateChange[self.currentState]) {
      actionsToExecuteAtStateChange[self.currentState].call(self);
    }

    this.currentState = newState;
    updateImageAndAudio(newState);
    // *** TODO *** CHANGE AND UNCOMMENT THIS ***
    //this.audioName && connector.playSoundInClient(this.audioName);
    return this;
  };

  /**
   * Adds an action to be executed when entering a specific state.
   * @memberof ChangesImageWithState
   * @param {string} state - State name to attach action to.
   * @param {Function} action - Function to execute when entering this state.
   * @returns {Object} This agent instance for chaining.
   * @throws {Error} If state is invalid or action is not a function.
   */
  this.addActionToExecuteAtStateChange = function (state, action) {
    Assert.assert(
      isValidState(state),
      "ChangesImageWithState#addActionToExecuteAtStateChange error -> invalid state",
    );
    Assert.assertIsFunction(
      action,
      "ChangesImageWithState#addActionToExecuteAtStateChange error -> action expected to be a function",
    );
    actionsToExecuteAtStateChange[state] = action;
    return this;
  };

  start(configurationObj);
}
