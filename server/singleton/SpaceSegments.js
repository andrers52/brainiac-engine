'use strict'

import Assert from '../../../arslib/util/assert.js'

function SpaceSegments () {
  const DEFAULT_NUM_SEGMENT_ROWS = 20
  const DEFAULT_NUM_SEGMENT_COLUMNS = DEFAULT_NUM_SEGMENT_ROWS
  
  let agentIdToSegment
  let segments
  
  let self = this
  function adjacentSegments(row, column) {
    let result = []
    for (let possibleRow = row - 1; possibleRow <= row + 1; possibleRow++) {
      for (let possibleColumn = column - 1; possibleColumn <= column + 1; possibleColumn++) {
        if (possibleRow >= 0 && possibleRow <= self.NUM_SEGMENT_ROWS - 1 &&
          possibleColumn >= 0 && possibleColumn <= self.NUM_SEGMENT_COLUMNS - 1)
          result.push([possibleRow, possibleColumn])
      }
    }
    return result
  }
  
  function Segment(row, column) {
    this.row = row
    this.column = column
    this.adjacents = adjacentSegments(row, column)
    this.agents = {}
    return this
  }
  
  let _getSegmentByPosition = (position) => {
    Assert.assertIsNumber(position.x)
    Assert.assertIsNumber(position.y)
    let row = (this.NUM_SEGMENT_ROWS - 1) -
      Math.trunc((position.y + this.WORLD_HEIGHT/2) / (this.WORLD_HEIGHT / this.NUM_SEGMENT_ROWS))
    Assert.assertIsNumber(row)
    row = (row >= this.NUM_SEGMENT_ROWS) ?
      this.NUM_SEGMENT_ROWS - 1 :
      (row < 0) ? 0 : row
    let column = Math.trunc((position.x + this.WORLD_WIDTH/2) / (this.WORLD_WIDTH / this.NUM_SEGMENT_COLUMNS))
    Assert.assertIsNumber(column)
    column = (column >= this.NUM_SEGMENT_COLUMNS) ?
      this.NUM_SEGMENT_COLUMNS - 1 :
      (column < 0) ? 0 : column
    Assert.assert(segments[row][column])
    return segments[row][column]
  }
  
  this.start = function (
    WORLD_WIDTH,
    WORLD_HEIGHT,
    NUM_SEGMENT_ROWS = DEFAULT_NUM_SEGMENT_ROWS,
    NUM_SEGMENT_COLUMNS = DEFAULT_NUM_SEGMENT_COLUMNS) {

    this.WORLD_WIDTH = WORLD_WIDTH
    this.WORLD_HEIGHT = WORLD_HEIGHT
    this.NUM_SEGMENT_ROWS = NUM_SEGMENT_ROWS
    this.NUM_SEGMENT_COLUMNS = NUM_SEGMENT_COLUMNS
    this.clear()
  }

  this.clear = function () {
    agentIdToSegment = {}
    segments = []
  
    segments =
    [...Array(this.NUM_SEGMENT_ROWS)]
      .map(
        (e1, row) =>
          [...Array(this.NUM_SEGMENT_COLUMNS)]
            .map((e2, column) => new Segment(row, column))
      )
  }
    
  this.checkAgentExists = function (agent) {
    return Object.keys(agentIdToSegment).includes(agent.id)
  }
  this.addAgent = function (agent) {
    //let oldAgentNum = totalAgentsNum(); // TODO: REMOVE

    let segment = _getSegmentByPosition(agent.getPosition())
    agentIdToSegment[agent.id] = segment
    segment.agents[agent.id] = agent

    // TODO: REMOVE
    //let newAgentNum = totalAgentsNum();
    //Assert.assert((oldAgentNum + 1) === newAgentNum, "Error in SpaceSegment#addAgent");
  }

  this.removeAgent = function (agent) {
    //let oldAgentNum = totalAgentsNum(); // TODO: REMOVE

    let segment = agentIdToSegment[agent.id]
    // Assert.assert(segment, 'Error: segment not found in SpaceSegment#removeAgent')
    if(!segment) return

    let agents = segment.agents
  
    delete agents[agent.id]
    delete agentIdToSegment[agent.id]

    // TODO: REMOVE
    //let newAgentNum = totalAgentsNum();
    //Assert.assert((oldAgentNum - 1) === newAgentNum, "Error in SpaceSegment#removeAgentByPosition");

  }

  this.updateAgent = function (agent) {
    //let oldAgentNum = totalAgentsNum(); // TODO: REMOVE

    this.removeAgent(agent)
    this.addAgent(agent)

    // TODO: REMOVE
    //let newAgentNum = totalAgentsNum();
    //Assert.assert(oldAgentNum === newAgentNum, "Error in SpaceSegment#updateAgent");
  }  
  
  this.getNearbyAgentsByRectangle = function (encompassingRectangle) {
    let topLeftSegment = _getSegmentByPosition(encompassingRectangle.topLeft())
    let bottomRightSegment = _getSegmentByPosition(encompassingRectangle.bottomRight())
    let arraysOfAgents = []
    for (let row = topLeftSegment.row; row <= bottomRightSegment.row; row++) {
      for (let column = topLeftSegment.column; column <= bottomRightSegment.column; column++) {
        arraysOfAgents.push(Object.values(segments[row][column].agents))
      }
    }
    return [].concat.apply([], arraysOfAgents) //flaten arrays
  }
  
  this.getNearbyAgentsByPosition = function (position) {
    return Object.values(_getSegmentByPosition(position).agents)
  }


  // -------------- TESTS -------------------------------
  function totalAgentsNum () {
    let arraysOfAgents = []
    for (let row = 0; row < this.NUM_SEGMENT_ROWS; row++) {
      for (let column = 0; column < this.NUM_SEGMENT_COLUMNS; column++) {
        arraysOfAgents.push(Object.values(segments[row][column].agents))
      }
    }
    let num = ([].concat.apply([], arraysOfAgents)).length
    //console.log(num);
    return num
  }

  // -------------- TESTS -------------------------------

  this.getNearbyAgents = function (agent) {
    let arraysOfAgents =
      _getSegmentByPosition(agent.getPosition())
        .adjacents
        .map(([row, column]) => Object.values(segments[row][column].agents))

    return [].concat.apply([], arraysOfAgents) //flaten arrays
  }
}

var spaceSegments = new SpaceSegments()

export default spaceSegments

