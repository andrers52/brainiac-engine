"use strict";

import { Assert } from "arslib";

/**
 * @file Mixin that provides drag and drop functionality for agents.
 * Allows agents to be dragged along specified axes with mouse interactions.
 * @module Draggable
 */

/**
 * Mixin that adds drag and drop functionality to agents.
 * Allows agents to be dragged with the mouse along specified axes.
 *
 * @param {boolean} canDragAlongX - Whether the agent can be dragged horizontally
 * @param {boolean} canDragAlongY - Whether the agent can be dragged vertically
 *
 * @example
 * // Agent that can be dragged in both directions
 * const draggableAgent = createAgent("draggable.png", 50, 50);
 * Draggable.call(draggableAgent, true, true);
 *
 * @example
 * // Agent that can only be dragged horizontally
 * const slider = createAgent("slider.png", 100, 20);
 * Draggable.call(slider, true, false);
 *
 * @throws {Error} If neither canDragAlongX nor canDragAlongY is true
 * @requires The agent must have EFunction.sequence, onMouseDownHit, onMouseUp, and onMouseMove event handlers
 * @mixin
 */
export function Draggable(canDragAlongX, canDragAlongY) {
  Assert.assert(
    canDragAlongX || canDragAlongY,
    "Draggable error: you must select at least one axys for drag",
  );
  /** @type {boolean} Whether the agent is currently being dragged */
  let isBeingDragged = false;

  /** @type {Vector} Mouse position when dragging started */
  let originalMousePosition;
  /** @type {Vector} Agent position when dragging started */
  let originalPosition;
  /** @type {boolean} Flag indicating this agent is draggable */
  this.isDraggable = true;

  /** @type {Object} Reference to this agent */
  let self = this;

  /**
   * Starts the dragging operation.
   * @private
   * @param {Vector} originalMousePositionInput - The mouse position where dragging started
   */
  function startDragging(originalMousePositionInput) {
    isBeingDragged = true;
    originalMousePosition = originalMousePositionInput.clone();
    originalPosition = self.getPosition().clone();
  }

  this.onMouseDownHit = EFunction.sequence(
    this.onMouseDownHit,
    startDragging,
    this,
  );

  /**
   * Stops the dragging operation.
   * @private
   */
  function stopDragging() {
    isBeingDragged = false;
  }

  this.onMouseUp = EFunction.sequence(this.onMouseUp, stopDragging, this);

  /**
   * Handles mouse movement during dragging.
   * Updates the agent's position based on mouse movement relative to drag start position.
   * @memberof Draggable
   * @param {Vector} newMouseWorldPosition - Current mouse position in world coordinates
   * @returns {Object} This agent instance for method chaining
   */
  this.onMouseMove = function (newMouseWorldPosition) {
    if (!isBeingDragged) return;

    //moving relative to mouse movement
    let newWorldPosition = originalPosition
      .clone()
      .add(newMouseWorldPosition.clone().subtract(originalMousePosition));
    this.setPosition(
      new Vector(
        canDragAlongX ? newWorldPosition.x : this.rectangle.center.x,
        canDragAlongY ? newWorldPosition.y : this.rectangle.center.y,
      ),
    );
    return this;
  };
}
