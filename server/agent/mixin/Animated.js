'use strict';

import { Assert, EArray, EFunction } from 'arslib';

/**
 * @fileoverview Animation system for state-based sprite animations with audio support.
 * Provides configurable animation states with frame sequences, timing, and audio playback.
 *
 * Configuration format:
 * {
 *   "defaultState": "<state_nameX>",
 *   "auto_reverse": [true|false], // hit end and go backwards vs restart
 *   "animationStates": [
 *     {
 *       "stateName": <state_name1>,
 *       "timeinMilis": <time1>,
 *       "animationFrames": [<imageName1_1>,...,<imageName1_N>],
 *       "audioName": <audioName1>
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * Adds animation capabilities to an agent with state-based frame sequences.
 * @param {Object} configurationObj - Animation configuration object.
 * @param {string} configurationObj.defaultState - Default animation state name.
 * @param {boolean} [configurationObj.auto_reverse=false] - Whether to reverse animation direction at end.
 * @param {Array} configurationObj.animationStates - Array of animation state definitions.
 * @param {Object} soundProvider - Object responsible for playing sound in client.
 * @param {Function} soundProvider.playSoundInClient - Function to play audio by name.
 * @throws {Error} If configuration is invalid or resources are missing.
 */
export function Animated(configurationObj, soundProvider) {
  let ANIMATION_DEFAULT_DELAY = 2000;

  let self = this;

  let intervalId = null;

  let states = [];
  let defaultState = 'notInitialized';
  //auto-reverse (forward, backwards, forward, ...) or cyclic animation (default -> forward, reaches end and starts again)
  let auto_reverse = false;
  let current_increment = 1; //forward -> 1, backwards -> -1
  //state -> collection of image names
  let framesPerState = {};
  let timePerState = {};
  //state -> audio name
  let audioPerState = {};

  //actions to execute when animation cycle finishes. Added "a posteriori" by user
  //actions will be called on "self" context ("this" inside function)
  let actionsToExecuteAtAnimationEnd = {};

  /**
   * @memberof Animated
   * @type {string}
   * @description Current animation state name.
   */
  this.currentState = 'notInitialized'; //TODO: CHANGE TO READ ONLY PROPERTY

  let currentStateFrame = 0;

  /**
   * Initializes the animation system from configuration.
   * @param {Object} configurationObj - Animation configuration object.
   * @throws {Error} If configuration is invalid.
   */
  function start(configurationObj) {
    try {
      defaultState = self.currentState = configurationObj.defaultState;
      auto_reverse = configurationObj.auto_reverse;
      configurationObj.animationStates.forEach(function (animationState) {
        states.push(animationState.stateName);
        framesPerState[animationState.stateName] =
          animationState.animationFrames;
        timePerState[animationState.stateName] =
          animationState.timeinMilis || ANIMATION_DEFAULT_DELAY;
        audioPerState[animationState.stateName] = animationState.audioName;
      });

      updateImageAndAudio(defaultState);
    } catch (exception) {
      throw 'Animation resources descriptor reading error: ' + exception;
    }
    Assert.assert(
      states.includes(defaultState),
      'Animation resources integrity check failed',
    );

    self.changeState(defaultState);
  }

  /**
   * Updates the agent's image and audio based on current state.
   * @param {string} state - Animation state name.
   */
  function updateImageAndAudio(state) {
    self.imageName = EArray.first(framesPerState[state]);
    self.audioName = audioPerState[state];
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
   * Checks if currently on the last frame of current state.
   * @returns {boolean} True if on last frame.
   */
  function isLastFrame() {
    return framesPerState[self.currentState].length - 1 === currentStateFrame;
  }

  /**
   * Checks if currently on the first frame of current state.
   * @returns {boolean} True if on first frame.
   */
  function isFirstFrame() {
    return currentStateFrame === 0;
  }

  /**
   * Sets the current image name for the agent.
   * @param {string} imageName - Name of the image to set.
   */
  function setImageName(imageName) {
    self.imageName = imageName;
  }

  /**
   * Advances to the next frame in the animation sequence.
   */
  function changeFrame() {
    //normal case
    if (!(isLastFrame() || isFirstFrame())) {
      currentStateFrame += current_increment;
      setImageName(framesPerState[self.currentState][currentStateFrame]);
      return;
    }

    //test if needs to perform action at end of animation
    if (isLastFrame() && actionsToExecuteAtAnimationEnd[self.currentState]) {
      actionsToExecuteAtAnimationEnd[self.currentState].call(self);
    }

    //cyclic animation first or last
    if (!auto_reverse) {
      if (isLastFrame()) currentStateFrame = 0; //restart on last frame
      else currentStateFrame++;

      setImageName(framesPerState[self.currentState][currentStateFrame]);

      return;
    }

    //autoreverse animation first or last
    if (
      (isFirstFrame() && current_increment === -1) ||
      (isLastFrame() && current_increment === 1)
    )
      current_increment *= -1; //invert direction

    currentStateFrame += current_increment;
    setImageName(framesPerState[self.currentState][currentStateFrame]);
  }

  /**
   * Changes the animation to a new state.
   * @memberof Animated
   * @param {string} newState - Name of the new animation state.
   * @returns {Object} This agent instance for chaining.
   * @throws {Error} If newState is not valid.
   */
  this.changeState = function (newState) {
    Assert.assert(isValidState(newState));

    this.currentState = newState;
    currentStateFrame = 0;

    updateImageAndAudio(newState);
    this.audioName && soundProvider.playSoundInClient(this.audioName);

    intervalId && clearInterval(intervalId);
    intervalId = setInterval(function () {
      changeFrame();
    }, timePerState[newState]);

    return this;
  };

  /**
   * Adds an action to be executed when a specific animation state completes.
   * @memberof Animated
   * @param {string} state - Animation state name.
   * @param {Function} action - Function to execute when state animation ends.
   * @returns {Object} This agent instance for chaining.
   * @throws {Error} If state is invalid or action is not a function.
   */
  this.addActionToExecuteAtAnimationEnd = function (state, action) {
    Assert.assert(
      isValidState(state),
      'Animated#addActionToAnimationEnd error -> given state is not valid',
    );
    Assert.assertIsFunction(
      action,
      'Animated#addActionToAnimationEnd error -> action expected to be a function',
    );
    actionsToExecuteAtAnimationEnd[state] = action;
    return this;
  };

  /**
   * Cleanup function called when agent dies to clear animation intervals.
   */
  function animatedDie() {
    clearInterval(intervalId);
  }

  this.die = EFunction.sequence(this.die, animatedDie, this);

  start(configurationObj);
}
