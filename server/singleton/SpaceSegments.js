"use strict";

import { Assert } from "arslib";

/**
 * @file Spatial indexing system for efficient agent collision detection and proximity queries.
 * Divides the world into grid segments to optimize agent searching and collision detection.
 * @module SpaceSegments
 */

/**
 * Spatial indexing system that divides the world into a grid of segments.
 * Each segment tracks agents within its bounds, enabling efficient proximity queries
 * and collision detection without checking every agent against every other agent.
 * @constructor
 * @class SpaceSegments
 */
function SpaceSegments() {
  /** @constant {number} Default number of rows in the spatial grid */
  const DEFAULT_NUM_SEGMENT_ROWS = 20;
  /** @constant {number} Default number of columns in the spatial grid */
  const DEFAULT_NUM_SEGMENT_COLUMNS = DEFAULT_NUM_SEGMENT_ROWS;

  /** @type {Object.<number, Segment>} Map of agent IDs to their containing segments */
  let agentIdToSegment;
  /** @type {Array<Array<Segment>>} 2D array of segment objects */
  let segments;

  /** @type {SpaceSegments} Reference to this instance */
  let self = this;

  /**
   * Calculates all adjacent segment coordinates for a given segment position.
   * Includes the segment itself and all 8 surrounding segments (if they exist).
   * @private
   * @param {number} row - Row index of the segment
   * @param {number} column - Column index of the segment
   * @returns {Array<Array<number>>} Array of [row, column] coordinate pairs for adjacent segments
   */
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

  /**
   * Represents a single segment in the spatial grid.
   * @constructor
   * @class Segment
   * @param {number} row - Row index of this segment
   * @param {number} column - Column index of this segment
   */
  function Segment(row, column) {
    /** @type {number} Row index in the grid */
    this.row = row;
    /** @type {number} Column index in the grid */
    this.column = column;
    /** @type {Array<Array<number>>} Coordinates of adjacent segments */
    this.adjacents = adjacentSegments(row, column);
    /** @type {Object.<number, Object>} Agents contained in this segment */
    this.agents = {};
    return this;
  }

  /**
   * Gets the segment that contains a given world position.
   * @private
   * @param {Vector} position - World position to find segment for
   * @returns {Segment} The segment containing the position
   * @throws {Error} If position coordinates are invalid
   */
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

  /**
   * Initializes the spatial segmentation system with world dimensions and grid size.
   * @memberof SpaceSegments
   * @param {number} WORLD_WIDTH - Width of the world in pixels
   * @param {number} WORLD_HEIGHT - Height of the world in pixels
   * @param {number} [NUM_SEGMENT_ROWS=DEFAULT_NUM_SEGMENT_ROWS] - Number of rows in the grid
   * @param {number} [NUM_SEGMENT_COLUMNS=DEFAULT_NUM_SEGMENT_COLUMNS] - Number of columns in the grid
   */
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

  /**
   * Clears all segments and resets the spatial index.
   * Creates a new empty grid with the current dimensions.
   * @memberof SpaceSegments
   */
  this.clear = function () {
    agentIdToSegment = {};
    segments = [];

    segments = [...Array(this.NUM_SEGMENT_ROWS)].map((e1, row) =>
      [...Array(this.NUM_SEGMENT_COLUMNS)].map(
        (e2, column) => new Segment(row, column),
      ),
    );
  };

  /**
   * Checks if an agent exists in the spatial index.
   * @memberof SpaceSegments
   * @param {Object} agent - The agent to check for
   * @returns {boolean} True if agent exists in the index
   */
  this.checkAgentExists = function (agent) {
    return Object.keys(agentIdToSegment).includes(agent.id);
  };

  /**
   * Adds an agent to the spatial index at its current position.
   * @memberof SpaceSegments
   * @param {Object} agent - The agent to add (must have getPosition() method and id property)
   */
  this.addAgent = function (agent) {
    let segment = _getSegmentByPosition(agent.getPosition());
    agentIdToSegment[agent.id] = segment;
    segment.agents[agent.id] = agent;
  };

  /**
   * Removes an agent from the spatial index.
   * @memberof SpaceSegments
   * @param {Object} agent - The agent to remove
   */
  this.removeAgent = function (agent) {
    let segment = agentIdToSegment[agent.id];
    if (!segment) return;

    let agents = segment.agents;

    delete agents[agent.id];
    delete agentIdToSegment[agent.id];
  };

  /**
   * Updates an agent's position in the spatial index.
   * Removes the agent from its old segment and adds it to the new one.
   * @memberof SpaceSegments
   * @param {Object} agent - The agent to update
   */
  this.updateAgent = function (agent) {
    this.removeAgent(agent);
    this.addAgent(agent);
  };

  /**
   * Gets all agents within a rectangular area.
   * @memberof SpaceSegments
   * @param {Rectangle} encompassingRectangle - The rectangle area to search within
   * @returns {Array<Object>} Array of agents within the rectangle area
   */
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

  /**
   * Gets all agents in the same segment as a given position.
   * @memberof SpaceSegments
   * @param {Vector} position - The world position to search around
   * @returns {Array<Object>} Array of agents in the same segment as the position
   */
  this.getNearbyAgentsByPosition = function (position) {
    return Object.values(_getSegmentByPosition(position).agents);
  };

  /**
   * Gets all agents in adjacent segments to a given agent.
   * Includes agents in the same segment and all 8 surrounding segments.
   * @memberof SpaceSegments
   * @param {Object} agent - The reference agent (must have getPosition() method)
   * @returns {Array<Object>} Array of nearby agents including the agent itself
   */
  this.getNearbyAgents = function (agent) {
    let arraysOfAgents = _getSegmentByPosition(
      agent.getPosition(),
    ).adjacents.map(([row, column]) =>
      Object.values(segments[row][column].agents),
    );

    return [].concat.apply([], arraysOfAgents); // flatten arrays
  };
}

/**
 * Singleton instance of the spatial indexing system.
 * @type {SpaceSegments}
 * @instance
 */
var spaceSegments = new SpaceSegments();

export { spaceSegments };
