"use strict";

import { Assert, EArray, EFunction } from "arslib";

//configuration is an object in the format
//{"defaultState": "<state_nameX>",
// auto_reverse means hit end and go backwards towards beginning, otherwise restart
// "auto_reverse": [true|false],
// "animationStates":
//  [
//    {"stateName": <state_name1>, "timeinMilis": <time1>, "animationFrames": [<imageName1_1>,...,<imageName1_N>], "audioName": <audioName1>},
//    ...,
//    {"stateName": <state_nameN>, "timeinMilis": <timeN>,  "animationFrames": [<imageNameN_1>,...,<imageNameN_M>], "audioName": <audioName1>}
//  ]
//}
//soundProvider is resposible for playing sound in client
// must provide: soundProvider.playSoundInClient(audioName)
export function Animated(configurationObj, soundProvider) {
  let ANIMATION_DEFAULT_DELAY = 2000;

  let self = this;

  let intervalId = null;

  let states = [];
  let defaultState = "notInitialized";
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

  this.currentState = "notInitialized"; //TODO: CHANGE TO READ ONLY PROPERTY
  let currentStateFrame = 0;

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
      throw "Animation resources descriptor reading error: " + exception;
    }
    Assert.assert(
      states.includes(defaultState),
      "Animation resources integrity check failed",
    );

    self.changeState(defaultState);
  }

  function updateImageAndAudio(state) {
    self.imageName = EArray.first(framesPerState[state]);
    self.audioName = audioPerState[state];
  }

  function isValidState(state) {
    return states.includes(state);
  }

  function isLastFrame() {
    return framesPerState[self.currentState].length - 1 === currentStateFrame;
  }

  function isFirstFrame() {
    return currentStateFrame === 0;
  }

  function setImageName(imageName) {
    self.imageName = imageName;
  }

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

  this.addActionToExecuteAtAnimationEnd = function (state, action) {
    Assert.assert(
      isValidState(state),
      "Animated#addActionToAnimationEnd error -> given state is not valid",
    );
    Assert.assertIsFunction(
      action,
      "Animated#addActionToAnimationEnd error -> action expected to be a function",
    );
    actionsToExecuteAtAnimationEnd[state] = action;
    return this;
  };

  function animatedDie() {
    clearInterval(intervalId);
  }

  this.die = EFunction.sequence(this.die, animatedDie, this);

  start(configurationObj);
}
