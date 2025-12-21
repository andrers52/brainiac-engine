'use strict';

import { EFunction } from 'arslib';
import { createAgentWithRectangle } from '../../../agent/Agent.js';
import { Fade } from './Fade.js';

/**
 * @fileoverview Raster effect that creates a trail of fading images behind a moving agent.
 * Each movement creates a ghost image that gradually fades away.
 */

/**
 * Adds raster trail behavior to an agent.
 * Creates fading copies of the agent at each position it moves through.
 */
export function Raster() {
  /**
   * Creates a fading trail copy when the agent moves.
   * Called automatically whenever the agent's move method is invoked.
   */
  function moveWithRaster() {
    let fadingAgent = createAgentWithRectangle(
      this.imageName,
      this.rectangle.clone(),
      false,
    );
    Fade.call(fadingAgent);
    fadingAgent.startFading();
  }

  this.move = EFunction.sequence(this.move, moveWithRaster, this);
}
