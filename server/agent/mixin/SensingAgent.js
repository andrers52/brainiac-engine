"use strict";

import { Assert } from "arslib";
import { rect } from "../../../common/geometry/Rectangle.js";
import { Vector } from "../../../common/geometry/Vector.js";
import { environment } from "../singleton/Environment.js";

/**
 * @fileoverview Agent sensing system for detecting nearby agents and user interactions.
 * Provides various sensing capabilities including forward detection, user agent detection, and general agent sensing.
 *
 * Generated Events:
 * - onSensingAgents({[vector: relativeSensingVector1, agent: agent1],...}) - Detect all agents
 * - onSensingUserAgent({vector: relativeSensingVector1, agent: agent1}) - Detect user agent
 * - onSensingForwardAgents({[vector: relativeSensingVector1, agent: agent1],...}) - Detect forward agents (180 degrees forward)
 * - onSensingMostForwardAgent({vector: relativeSensingVector1, agent: agent1}) - Detect agent with smallest angle in front
 *
 * All vectors are relative to agent orientation.
 */

/**
 * Adds sensing capabilities to an agent for detecting nearby agents.
 * @param {Function} [detector=() => false] - Function that determines if an agent should be detected.
 * @param {number} [sensingDistance=100] - Maximum distance for sensing other agents.
 * @param {number} [delay=250] - Delay between sensing checks in milliseconds.
 * @throws {Error} If agent doesn't implement any of the required sensing event handlers.
 */
export function SensingAgent(
  detector = () => false,
  sensingDistance = 100,
  delay = 250,
) {
  Assert.assert(
    this.onSensingAgents ||
      this.onSensingForwardAgents ||
      this.onSensingUserAgent ||
      this.onSensingMostForwardAgent,
    `Error: added SensingAgent to agent without implementing
    'onSensingAgents' or 'onSensingForwardAgents' or
    'onSensingUserAgent' or 'onSensingMostForwardAgent' event handler`,
  );

  let boundDetector = detector.bind(this);
  let sensingRect = rect(0, 0, sensingDistance * 2, sensingDistance * 2);
  let self = this;

  /**
   * Calculates the relative detection vector from this agent to a detected agent.
   * @param {Object} detectedAgent - The agent that was detected.
   * @returns {Vector} Relative vector from this agent to the detected agent.
   */
  function calculateRelativeDetectionVector(detectedAgent) {
    let absoluteDetectionVector = detectedAgent
      .getPosition()
      .clone()
      .subtract(self.getPosition());

    let absoluteDetectionVectorAngle = absoluteDetectionVector.getAngle();
    let absoluteDetectionVectorSize = absoluteDetectionVector.size();

    let relativeDetectionVectorAngle =
      absoluteDetectionVectorAngle - self.orientation;

    return Vector.makeFromAngleAndSize(
      relativeDetectionVectorAngle,
      absoluteDetectionVectorSize,
    );
  }

  /**
   * Gets all agents within sensing range that pass the detector function.
   * @returns {Array|null} Array of objects with vector and agent properties, or null if none detected.
   */
  function getSensingAgents() {
    //return undefined or first perceived agent
    sensingRect.center = self.getPosition().clone();
    let nearbyAgents = environment.getNearbyAgents(self);
    if (!nearbyAgents.length) return null;
    let detectedNearbyAgents = nearbyAgents.filter(
      (agent) =>
        agent.id !== self.id &&
        !agent.isCamera &&
        agent.isSolid &&
        boundDetector(agent) &&
        agent.rectangle &&
        sensingRect.checkHasCornerInside(agent.rectangle),
    );
    if (!detectedNearbyAgents.length) return null;

    let vectorsAndAgents = detectedNearbyAgents.map((agent) => ({
      vector: calculateRelativeDetectionVector(agent),
      agent: agent,
    }));

    Assert.assertIsArray(
      vectorsAndAgents,
      "SensingAgent#getSensingAgents should return an array of objects",
    );
    Assert.assert(
      vectorsAndAgents[0].vector && vectorsAndAgents[0].agent,
      "SensingAgent#getSensingAgents object seems mal-formed",
    );
    return vectorsAndAgents;
  }

  /**
   * Checks if a vector represents a forward direction (within 90 degrees).
   * @param {Vector} vector - Vector to check.
   * @returns {boolean} True if vector is forward-facing.
   */
  function isForward(vector) {
    let angleToTurn = vector.getAngle();
    return Math.abs(angleToTurn) <= Math.PI / 2;
  }

  /**
   * Finds the agent that is most directly in front (smallest angle).
   * @param {Array} forwardVectorsAndAgents - Array of forward-facing agents.
   * @returns {Object} Object with vector and agent properties for the most forward agent.
   */
  function findMostForwardAgent(forwardVectorsAndAgents) {
    Assert.assert(forwardVectorsAndAgents.length >= 1);
    let mostForwardVectorAndAgent = forwardVectorsAndAgents[0];
    let mostForwardVectorAndAgentAngle = Math.abs(
      mostForwardVectorAndAgent.vector.getAngle(),
    );
    forwardVectorsAndAgents.forEach((vectorAndAgent) => {
      let vectorAngle = Math.abs(vectorAndAgent.vector.getAngle());
      if (vectorAngle < mostForwardVectorAndAgentAngle) {
        mostForwardVectorAndAgent = vectorAndAgent;
        mostForwardVectorAndAgentAngle = vectorAngle;
      }
    });
    return mostForwardVectorAndAgent;
  }

  /**
   * Finds the user agent among detected agents.
   * @param {Array} vectorsAndAgents - Array of detected agents.
   * @returns {Object|null} Object with vector and agent properties for user agent, or null if not found.
   */
  function getUserAgentAndVector(vectorsAndAgents) {
    let vectorAndAgent = vectorsAndAgents.filter((vectorAndAgent) =>
      vectorAndAgent.agent.isUserAgent(),
    );
    if (vectorAndAgent.length < 1) return null;
    return vectorAndAgent[0];
  }

  /**
   * Main sensing loop that runs at intervals and triggers appropriate events.
   */
  function testSensingAtInterval() {
    self.isAlive && setTimeout(testSensingAtInterval, delay);

    let vectorsAndAgents = getSensingAgents();
    if (!vectorsAndAgents) return;

    self.onSensingAgents && self.onSensingAgents(vectorsAndAgents);

    let userAgentAndVector = getUserAgentAndVector(vectorsAndAgents);

    if (self.onSensingUserAgent && userAgentAndVector) {
      self.onSensingUserAgent(userAgentAndVector);
    }

    if (self.onSensingForwardAgents || self.onSensingMostForwardAgent) {
      let forwardVectorsAndAgents = vectorsAndAgents.filter((vectorAndAgent) =>
        isForward(vectorAndAgent.vector),
      );
      if (forwardVectorsAndAgents.length > 0) {
        self.onSensingForwardAgents &&
          self.onSensingForwardAgents(forwardVectorsAndAgents);
        if (self.onSensingMostForwardAgent) {
          let mostForwardVectorAndAgent = findMostForwardAgent(
            forwardVectorsAndAgents,
          );
          self.onSensingMostForwardAgent(mostForwardVectorAndAgent);
        }
      }
    }
  }

  testSensingAtInterval();
}
