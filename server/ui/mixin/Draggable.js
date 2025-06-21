"use strict";

import { Assert, EFunction } from "arslib";
import { Vector } from "../../../common/geometry/Vector.js";

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

  /** @type {boolean} Flag indicating this agent is draggable */
  this.isDraggable = true;

  /** @type {boolean} Whether the agent is currently being dragged */
  this.isBeingDragged = false;

  /** @type {Vector} Mouse position when dragging started */
  this.originalMousePosition = null;
  /** @type {Vector} Agent position when dragging started */
  this.originalPosition = null;

  /**
   * Starts the dragging operation.
   * @private
   * @param {Vector} originalMousePositionInput - The mouse position where dragging started
   */
  this.startDragging = (originalMousePositionInput) => {
    console.log(`Draggable: Starting drag on agent ${this.id}`);
    // Always reset dragging state with fresh positions
    this.isBeingDragged = true;
    this.originalMousePosition = originalMousePositionInput.clone();
    this.originalPosition = this.getPosition().clone();
  };

  this.onMouseDownHit = this.onMouseDownHit
    ? EFunction.sequence(this.onMouseDownHit, this.startDragging, this)
    : this.startDragging;

  /**
   * Stops the dragging operation.
   * @private
   */
  this.stopDragging = () => {
    console.log(`Draggable: Stopping drag on agent ${this.id}`);
    this.isBeingDragged = false;
  };

  this.onMouseUp = this.onMouseUp
    ? EFunction.sequence(this.onMouseUp, this.stopDragging, this)
    : this.stopDragging;

  /**
   * Handles mouse movement during dragging.
   * Updates the agent's position based on mouse movement relative to drag start position.
   * @memberof Draggable
   * @param {Vector} newMouseWorldPosition - Current mouse position in world coordinates
   * @returns {Object} This agent instance for method chaining
   */
  this.handleMouseMove = (newMouseWorldPosition) => {
    if (!this.isBeingDragged) return this;

    // Safety check: ensure we have valid original positions
    if (!this.originalPosition || !this.originalMousePosition) {
      console.warn("Draggable: missing original positions, stopping drag");
      this.isBeingDragged = false;
      return this;
    }

    //moving relative to mouse movement
    let newWorldPosition = this.originalPosition
      .clone()
      .add(newMouseWorldPosition.clone().subtract(this.originalMousePosition));

    const finalPosition = new Vector(
      canDragAlongX ? newWorldPosition.x : this.rectangle.center.x,
      canDragAlongY ? newWorldPosition.y : this.rectangle.center.y,
    );

    this.setPosition(finalPosition);

    // Update spatial index after position change
    if (this.beServer) {
      this.beServer.getEnvironment().updateAgent(this);

      // Sync position changes to clients
      this.beServer.getConnector().setVisibleAgents();
    }

    return this;
  };

  // Register onMouseMove to handle dragging, but only respond when actually being dragged
  this.onMouseMove = this.onMouseMove
    ? EFunction.sequence(this.onMouseMove, this.handleMouseMove, this)
    : this.handleMouseMove;
}
