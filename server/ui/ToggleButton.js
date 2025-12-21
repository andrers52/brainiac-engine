'use strict';

import { EFunction } from 'arslib';
import { ChangesImageWithState } from '../agent/mixin/ChangesImageWithState.js';
import { createButton } from './Button.js';

/**
 * @file Toggle button UI component with two-state functionality.
 * Creates buttons that can switch between selected and deselected states.
 * @module ToggleButton
 */

/**
 * Creates a toggle button that switches between two states (selected/deselected).
 * Each state can have different images, actions, and audio feedback.
 *
 * @param {string} selectedImageName - Image to display when button is selected
 * @param {string} deselectedImageName - Image to display when button is deselected
 * @param {Rectangle} inputRectangle - Rectangle defining button position and size
 * @param {Function} [selectedAction] - Function to execute when button becomes selected
 * @param {Function} [deselectedAction] - Function to execute when button becomes deselected
 * @param {boolean} [checked=false] - Initial state of the button
 * @param {string} [selectedAudio] - Audio to play when button becomes selected
 * @param {string} [deselectedAudio] - Audio to play when button becomes deselected
 * @returns {Object} The created toggle button with state management capabilities
 *
 * @example
 * // Create a simple toggle button
 * const muteButton = createToggleButton(
 *   "mute_on.png", "mute_off.png",
 *   rect(10, 10, 50, 50),
 *   () => audio.mute(),
 *   () => audio.unmute(),
 *   false // Initially unmuted
 * );
 *
 * @example
 * // Create a toggle button with audio feedback
 * const settingsButton = createToggleButton(
 *   "settings_open.png", "settings_closed.png",
 *   rect(100, 100, 60, 60),
 *   () => showSettings(),
 *   () => hideSettings(),
 *   false,
 *   "open.wav",
 *   "close.wav"
 * );
 */
export function createToggleButton(
  selectedImageName,
  deselectedImageName,
  inputRectangle,
  selectedAction,
  deselectedAction,
  checked,
  selectedAudio,
  deselectedAudio,
) {
  //let timeToReturnToNormalInMillis = 400;

  //initialSelect?
  //initialSelect && flag.changeState("selected");

  //Not setting the button action. Will be set below
  let toggleButton = createButton(
    checked ? selectedImageName : deselectedImageName,
    inputRectangle,
    null,
  );

  /** @type {Object} Configuration for the toggle button's state system */
  let toggleButtonConfiguration = {
    defaultState: checked ? 'selected' : 'deselected',
    states: [
      {
        stateName: 'selected',
        image: selectedImageName,
        audioName: selectedAudio ? selectedAudio : null,
      },
      {
        stateName: 'deselected',
        image: deselectedImageName,
        audioName: deselectedAudio ? deselectedAudio : null,
      },
    ],
  };

  ChangesImageWithState.call(toggleButton, toggleButtonConfiguration);

  /**
   * Handles the toggle action when the button is clicked.
   * Switches between selected and deselected states and executes appropriate actions.
   * @private
   */
  function onMouseDownHitActionOnlyWhenStateIsDeselected() {
    if (toggleButton.currentState === 'deselected') {
      selectedAction && selectedAction.call(this);
      toggleButton.changeState('selected');
      return toggleButton;
    }

    deselectedAction && deselectedAction.call(toggleButton);
    toggleButton.changeState('deselected');
    return toggleButton;
  }

  // ** NOT WORKING (?!) **
  ////disable onMouseUp handler call it after onMouseDownHit time delay
  //let onMouseUpOrig = this.onMouseUp;
  //this.onMouseUp = function() {};
  //let self = this;
  //function mouseUpWithDelay() {
  //  setInterval(function(){onMouseUpOrig.call(self);}, timeToReturnToNormalInMillis);
  //};

  /**
   * Programmatically deselects the toggle button.
   * @memberof ToggleButton
   */
  toggleButton.deselect = function () {
    this.changeState('deselected');
  };

  /**
   * Programmatically selects the toggle button.
   * @memberof ToggleButton
   */
  toggleButton.select = function () {
    this.changeState('selected');
  };

  toggleButton.onMouseDownHit = EFunction.sequence(
    toggleButton.onMouseDownHit,
    onMouseDownHitActionOnlyWhenStateIsDeselected,
    this,
  );
  //mouseUpWithDelay]);

  /**
   * Checks if the toggle button is currently selected.
   * @memberof ToggleButton
   * @returns {boolean} True if the button is in selected state
   */
  toggleButton.isSelected = function () {
    return this.currentState === 'selected';
  };

  return toggleButton;
}
