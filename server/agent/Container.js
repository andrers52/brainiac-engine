'use strict';

import { Assert, EFunction } from 'arslib';
import { Rectangle } from '../../common/geometry/Rectangle.js';
import { Vector } from '../../common/geometry/Vector.js';
import { createAgent } from './Agent.js';

/**
 * @file Container system for organizing and managing groups of agents.
 * Containers can arrange agents in vertical or horizontal layouts with automatic sizing.
 * @module Container
 */

/**
 * Creates a container agent that manages and arranges other agents.
 * The container handles movement, sizing, and positioning of contained agents.
 * Contained agents cannot move independently - they move with the container.
 *
 * @param {Array<Object>} [agentsToContain] - Initial agents to add to the container
 * @param {string} [orientation="horizontal"] - Layout orientation ("vertical" or "horizontal")
 * @param {number} [padding=1] - Spacing between contained agents
 * @param {Rectangle} [rectangle] - Initial rectangle for the container
 * @returns {Object} The created container agent with container-specific methods
 *
 * @example
 * // Create a horizontal container with buttons
 * const buttons = [button1, button2, button3];
 * const container = createContainer(buttons, "horizontal", 5);
 *
 * @example
 * // Create a vertical container
 * const menuItems = [item1, item2, item3];
 * const menu = createContainer(menuItems, "vertical", 10);
 */
export function createContainer(
  agentsToContain,
  orientation,
  padding,
  rectangle,
) {
  let container = createAgent(null, 100, 100, false);
  orientation &&
    Assert.assertIsValidString(
      orientation,
      ['vertical', 'horizontal'],
      'Invalid container orientation given:' + orientation,
    );
  /** @type {boolean} Containers are invisible by default */
  container.isVisible = false; //default
  /** @type {string} Layout orientation for contained agents */
  container.orientation = orientation || 'horizontal'; //default orientation
  //if no rectangle given just define a basic one to allow the user to start from that
  container.rectangle = rectangle || new Rectangle(null, new Vector(10, 10));
  /** @type {boolean} Containers are non-solid */
  container.isSolid = false;
  /** @type {number} Padding between contained agents */
  container.padding = padding || 1; //minimum padding to avoid collision

  /** @type {Array<Object>} Collection of contained agents */
  let containedCollection = [];

  /**
   * Adjusts the sizes of all contained agents based on container size and orientation.
   * @private
   */
  function adjustAgentsSizes() {
    let totalPadding = container.padding * (containedCollection.length - 1);
    let totalHorizontalSize =
      container.rectangle.size.x -
      (container.orientation === 'horizontal' ? totalPadding : 0);
    let agentHorizontalSize =
      totalHorizontalSize /
      (container.orientation === 'horizontal' ? containedCollection.length : 1);
    let totalVerticalSize =
      container.rectangle.size.y -
      (container.orientation === 'vertical' ? totalPadding : 0);
    let agentVerticalSize =
      totalVerticalSize /
      (container.orientation === 'vertical' ? containedCollection.length : 1);
    containedCollection.forEach(function (agent) {
      agent.setSize(new Vector(agentHorizontalSize, agentVerticalSize));
    });
  }

  /**
   * Places remaining agents in sequence using the first agent as anchor.
   * @private
   */
  function placeRemainingAgentsWithFirstAsAnchor() {
    let agentOrientationEquivalence = {
      vertical: 'below',
      horizontal: 'right',
    };
    containedCollection.forEach(function (agent, index) {
      if (index === 0) return;
      agent.moveRelativeToAgent(
        containedCollection[--index],
        agentOrientationEquivalence[orientation],
        container.padding,
        true,
      );
    });
  }

  /**
   * Places all contained agents within the container bounds.
   * @private
   */
  function placeAllAgents() {
    let agentSize = containedCollection.first().getSize();
    let xPos, yPos;
    //vertical placement
    if (container.orientation === 'vertical') {
      xPos = container.getPosition().x;
      yPos = container.rectangle.topLeft().y - agentSize.y / 2;
    } else {
      //horizontal placement
      yPos = container.getPosition().y;
      xPos = container.rectangle.bottomLeft().x + agentSize.x / 2;
    }
    containedCollection.first().setPosition(new Vector(xPos, yPos), true);
    placeRemainingAgentsWithFirstAsAnchor();
  }

  /**
   * Adds an agent to this container.
   * The agent will be resized and positioned according to container layout.
   * @memberof Container
   * @param {Object} agent - The agent to add to the container
   * @returns {Object} This container instance for method chaining
   */
  container.addAgent = function (agent) {
    agent.container = container; //add reference to container in agent
    containedCollection.add(agent);
    adjustAgentsSizes();
    placeAllAgents();
    return container;
  };

  /**
   * Removes an agent from this container.
   * Remaining agents will be resized and repositioned.
   * @memberof Container
   * @param {Object} agent - The agent to remove from the container
   * @returns {Object} This container instance for method chaining
   */
  container.removeAgent = function (agent) {
    containedCollection.removeElement(agent);
    adjustAgentsSizes();
    placeAllAgents();

    //enableAgentMovement(agent);
    return container;
  };

  /**
   * Gets an agent at a specific index in the container.
   * @memberof Container
   * @param {number} indx - Index of the agent to retrieve
   * @returns {Object} The agent at the specified index
   */
  container.getElement = function (indx) {
    return containedCollection[indx];
  };

  /**
   * Gets the collection of all contained agents.
   * @memberof Container
   * @returns {Array<Object>} Array of all contained agents
   */
  container.getCollection = function () {
    return containedCollection;
  };

  // *** INITIALIZATION ***
  //add initially given agent to container
  agentsToContain &&
    agentsToContain.forEach((agent) => container.addAgent(agent));

  //re-write some agent's methods

  //TODO: USE sequence UTILITY FUNCTION?
  //container.onMouseDownHit =
  //       EFunction.sequence(container.onMouseDownHit, startDragging, container);

  /**
   * Override move method to move all contained agents together.
   * Tests movement for all agents before executing.
   * @memberof Container
   * @param {Vector} distance - Distance to move the container and all contained agents
   * @param {boolean} [force] - Whether to force movement ignoring collisions
   * @returns {boolean} True if movement was successful
   */
  let originalMove = container.move;
  container.move = function (distance, force) {
    if (!force) {
      if (!container.checkMove(distance)) return false;
      for (let i = 0; i < containedCollection.length; i++) {
        if (!containedCollection[i].checkMove(distance)) return false;
      }
    }

    //every one can move, so, let's do container (no testing needed)!
    //Note that we're using originalMove (agent default move to call everybody's move.
    //container is necessary because we overwrited the contained agent's move.
    originalMove.call(container, distance, true);
    containedCollection.forEach((agent) =>
      originalMove.call(agent, distance, true),
    );
    return true;
  };

  /**
   * Kills all contained agents.
   * @private
   */
  function killAll() {
    for (var i = 0; i < containedCollection.length; i++) {
      containedCollection[i].die();
    }
  }

  /** @type {Function} Original die method before override */
  let originalDie = container.die;

  /**
   * Override die method to kill all contained agents before dying.
   * @memberof Container
   */
  container.die = EFunction.sequence(killAll, originalDie, container);

  return container;
}
