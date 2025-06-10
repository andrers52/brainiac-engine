"use strict";

import { Assert } from "arslib";

export function Draggable(canDragAlongX, canDragAlongY) {
  Assert.assert(
    canDragAlongX || canDragAlongY,
    "Draggable error: you must select at least one axys for drag",
  );
  let isBeingDragged = false;

  //mouse position when started dragging
  let originalMousePosition;
  let originalPosition;
  this.isDraggable = true;

  let self = this;
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

  function stopDragging() {
    isBeingDragged = false;
  }

  this.onMouseUp = EFunction.sequence(this.onMouseUp, stopDragging, this);

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
