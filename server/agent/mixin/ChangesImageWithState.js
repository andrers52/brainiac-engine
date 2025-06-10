"use strict";

import { Assert } from "arslib";
import { Rectangle } from "../../../common/geometry/Rectangle.js";
import { Vector } from "../../../common/geometry/Vector.js";
import { connector } from "../../singleton/Connector.js";

//configuration is an object in the format
//{"defaultState": "<state_nameX>",
// "states":
//  [
//    {"stateName": <state_name1>, "image": <state_name1_image>, "audioName": <audioName1>},
//    ...,
//    {"stateName": <state_nameN>, "image": <state_nameN_image>, "audioName": <audioNameN>}
//  ]
//}
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

  this.currentState = "notInitialized"; //TODO: CHANGE TO READ ONLY PROPERTY

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

  function isValidState(state) {
    return states.includes(state);
  }

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
