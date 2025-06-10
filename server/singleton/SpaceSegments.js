"use strict";

import { Assert } from "arslib";

function SpaceSegments() {
  const DEFAULT_NUM_SEGMENT_ROWS = 20;
  const DEFAULT_NUM_SEGMENT_COLUMNS = DEFAULT_NUM_SEGMENT_ROWS;

  let agentIdToSegment;
  let segments;

  let self = this;

  function adjacentSegments(row, column) {
    let result = [];
    for (let possibleRow = row - 1; possibleRow <= row + 1; possibleRow++) {
      for (
        let possibleColumn = column - 1;
        possibleColumn <= column + 1;
        possibleColumn++
      ) {
        if (
          possibleRow >= 0 &&
          possibleRow <= self.NUM_SEGMENT_ROWS - 1 &&
          possibleColumn >= 0 &&
          possibleColumn <= self.NUM_SEGMENT_COLUMNS - 1
        )
          result.push([possibleRow, possibleColumn]);
      }
    }
    return result;
  }

  function Segment(row, column) {
    this.row = row;
    this.column = column;
    this.adjacents = adjacentSegments(row, column);
    this.agents = {};
    return this;
  }

  let _getSegmentByPosition = (position) => {
    Assert.assertIsNumber(position.x);
    Assert.assertIsNumber(position.y);
    let row =
      this.NUM_SEGMENT_ROWS -
      1 -
      Math.trunc(
        (position.y + this.WORLD_HEIGHT / 2) /
          (this.WORLD_HEIGHT / this.NUM_SEGMENT_ROWS),
      );
    Assert.assertIsNumber(row);
    row =
      row >= this.NUM_SEGMENT_ROWS
        ? this.NUM_SEGMENT_ROWS - 1
        : row < 0
        ? 0
        : row;
    let column = Math.trunc(
      (position.x + this.WORLD_WIDTH / 2) /
        (this.WORLD_WIDTH / this.NUM_SEGMENT_COLUMNS),
    );
    Assert.assertIsNumber(column);
    column =
      column >= this.NUM_SEGMENT_COLUMNS
        ? this.NUM_SEGMENT_COLUMNS - 1
        : column < 0
        ? 0
        : column;
    Assert.assert(segments[row][column]);
    return segments[row][column];
  };

  this.start = function (
    WORLD_WIDTH,
    WORLD_HEIGHT,
    NUM_SEGMENT_ROWS = DEFAULT_NUM_SEGMENT_ROWS,
    NUM_SEGMENT_COLUMNS = DEFAULT_NUM_SEGMENT_COLUMNS,
  ) {
    this.WORLD_WIDTH = WORLD_WIDTH;
    this.WORLD_HEIGHT = WORLD_HEIGHT;
    this.NUM_SEGMENT_ROWS = NUM_SEGMENT_ROWS;
    this.NUM_SEGMENT_COLUMNS = NUM_SEGMENT_COLUMNS;
    this.clear();
  };

  this.clear = function () {
    agentIdToSegment = {};
    segments = [];

    segments = [...Array(this.NUM_SEGMENT_ROWS)].map((e1, row) =>
      [...Array(this.NUM_SEGMENT_COLUMNS)].map(
        (e2, column) => new Segment(row, column),
      ),
    );
  };

  this.checkAgentExists = function (agent) {
    return Object.keys(agentIdToSegment).includes(agent.id);
  };

  this.addAgent = function (agent) {
    let segment = _getSegmentByPosition(agent.getPosition());
    agentIdToSegment[agent.id] = segment;
    segment.agents[agent.id] = agent;
  };

  this.removeAgent = function (agent) {
    let segment = agentIdToSegment[agent.id];
    if (!segment) return;

    let agents = segment.agents;

    delete agents[agent.id];
    delete agentIdToSegment[agent.id];
  };

  this.updateAgent = function (agent) {
    this.removeAgent(agent);
    this.addAgent(agent);
  };

  this.getNearbyAgentsByRectangle = function (encompassingRectangle) {
    let topLeftSegment = _getSegmentByPosition(encompassingRectangle.topLeft());
    let bottomRightSegment = _getSegmentByPosition(
      encompassingRectangle.bottomRight(),
    );

    // Adjust row and column bounds to ensure correct range
    let minRow = Math.min(topLeftSegment.row, bottomRightSegment.row);
    let maxRow = Math.max(topLeftSegment.row, bottomRightSegment.row);
    let minColumn = Math.min(topLeftSegment.column, bottomRightSegment.column);
    let maxColumn = Math.max(topLeftSegment.column, bottomRightSegment.column);

    let arraysOfAgents = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        arraysOfAgents.push(Object.values(segments[row][column].agents));
      }
    }
    return [].concat.apply([], arraysOfAgents); // flatten arrays
  };

  this.getNearbyAgentsByPosition = function (position) {
    return Object.values(_getSegmentByPosition(position).agents);
  };

  this.getNearbyAgents = function (agent) {
    let arraysOfAgents = _getSegmentByPosition(
      agent.getPosition(),
    ).adjacents.map(([row, column]) =>
      Object.values(segments[row][column].agents),
    );

    return [].concat.apply([], arraysOfAgents); // flatten arrays
  };
}

var spaceSegments = new SpaceSegments();

export { spaceSegments };
