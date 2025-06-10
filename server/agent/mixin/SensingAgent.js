"use strict";

import { Assert } from "arslib";
import { rect } from "../../../common/geometry/Rectangle.js";
import { Vector } from "../../../common/geometry/Vector.js";
import { environment } from "../singleton/Environment.js";
//detect all agents
//onSensingAgents({[vector: relativeSensingVetor1, agent: agent1],..., [vector: relativeSensingVetorN, agent: agentN]})
//detect user agent
//onSensingUserAgent({vector: relativeSensingVetor1, agent: agent1});
//detect forward agents (180 degrees forward)
//onSensingForwardAgents({[vector: relativeSensingVetor1, agent: agent1],..., [vector: relativeSensingVetorN, agent: agentN]})
//detect agent with smaller angle in front
//onSensingMostForwardAgent({vector: relativeSensingVetor1, agent: agent1})
//relative to agent orientation
//detector(agent) -> true: agent perceived, false: otherwise
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

  function isForward(vector) {
    let angleToTurn = vector.getAngle();
    return Math.abs(angleToTurn) <= Math.PI / 2;
  }

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

  function getUserAgentAndVector(vectorsAndAgents) {
    let vectorAndAgent = vectorsAndAgents.filter((vectorAndAgent) =>
      vectorAndAgent.agent.isUserAgent(),
    );
    if (vectorAndAgent.length < 1) return null;
    return vectorAndAgent[0];
  }

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
