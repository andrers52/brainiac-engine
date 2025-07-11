"use strict";

import { Assert } from "arslib";
import { ActionScheduler } from "../action_scheduling/ActionScheduler.js";
import { HasBehavior } from "../HasBehavior.js";
import { createTestLLM } from "../../../LLMService.js";

/**
 * @fileoverview Intelligence mixin for LLM-powered agent decision making.
 * Provides state gathering, action discovery, prompt construction, and LLM integration.
 * 
 * Features:
 * - Gathers agent state (position, size, perceptions, etc.)
 * - Discovers available actions from agent and mixins
 * - Constructs prompts for LLM decision making
 * - Executes LLM-decided actions via action scheduling
 * - Handles message communication between agents
 * 
 * @module Intelligence
 */

/**
 * Adds intelligence capabilities to an agent using the system-wide LLM service.
 * @param {Object} config - Configuration object for the intelligence system
 * @param {Function} [config.perceptionFn] - Function to gather agent perceptions
 * @param {string} [config.agentName] - Name for this agent (defaults to "Agent")
 * @param {number} [config.thinkingInterval=1000] - Interval between thinking cycles in ms
 * @param {string} [config.systemPrompt] - Custom system prompt for the LLM
 * @param {boolean} [config.enableMessages=true] - Whether to enable message communication
 * @throws {Error} If system LLM service is not available
 */
export function Intelligence(config) {
  // Get system-wide LLM service from BEServer
  const llm = this.beServer.getLLMService();
  Assert.assert(llm, "Intelligence mixin requires system LLM service to be initialized");
  
  const {
    perceptionFn = () => [],
    agentName = "Agent",
    thinkingInterval = 1000,
    systemPrompt = null,
    enableMessages = true
  } = config;

  let self = this;
  let messageHistory = [];
  let receivedMessages = [];
  let actionScheduler = new ActionScheduler();
  let isThinking = false;

  // Add action scheduler to agent
  Object.assign(this, actionScheduler);

  /**
   * Gathers the agent's current state for LLM prompting.
   * @memberof Intelligence
   * @returns {Object} Agent state object
   */
  this.gatherState = function() {
    const position = this.getPosition();
    const size = this.getSize();
    const perceptions = perceptionFn.call(this);
    
    return {
      id: this.id,
      name: agentName,
      position: { x: position.x, y: position.y },
      size: { width: size.x, height: size.y },
      orientation: this.orientation || 0,
      isAlive: this.isAlive,
      isVisible: this.isVisible,
      isSolid: this.isSolid,
      perceptions: perceptions,
      receivedMessages: receivedMessages.slice(-5), // Last 5 messages
      worldBounds: {
        width: this.worldRectangle.size.x,
        height: this.worldRectangle.size.y
      }
    };
  };

  /**
   * Discovers available actions from the agent and its mixins.
   * Uses JSDoc comments to describe actions.
   * @memberof Intelligence
   * @returns {Array} Array of available actions with descriptions
   */
  this.discoverActions = function() {
    const actions = [];
    
    // Basic movement actions from Agent.js
    const basicActions = [
      {
        name: "moveUp",
        description: "Move up by specified distance",
        parameters: [{ name: "distance", type: "number", default: 1 }],
        returns: "boolean"
      },
      {
        name: "moveDown", 
        description: "Move down by specified distance",
        parameters: [{ name: "distance", type: "number", default: 1 }],
        returns: "boolean"
      },
      {
        name: "moveLeft",
        description: "Move left by specified distance", 
        parameters: [{ name: "distance", type: "number", default: 1 }],
        returns: "boolean"
      },
      {
        name: "moveRight",
        description: "Move right by specified distance",
        parameters: [{ name: "distance", type: "number", default: 1 }],
        returns: "boolean"
      },
      {
        name: "move",
        description: "Move by a distance vector",
        parameters: [
          { name: "distance", type: "Vector" },
          { name: "force", type: "boolean", default: false }
        ],
        returns: "boolean"
      },
      {
        name: "setPosition",
        description: "Set agent to a specific position",
        parameters: [
          { name: "position", type: "Vector" },
          { name: "force", type: "boolean", default: false }
        ],
        returns: "boolean"
      }
    ];

    actions.push(...basicActions);

    // Add message actions if enabled
    if (enableMessages) {
      actions.push(
        {
          name: "say",
          description: "Send a message to another agent",
          parameters: [
            { name: "message", type: "string" },
            { name: "targetAgentId", type: "number", optional: true }
          ],
          returns: "void"
        },
        {
          name: "listen",
          description: "Get received messages",
          parameters: [],
          returns: "Array"
        }
      );
    }

    // TODO: Discover actions from other mixins dynamically
    // This would require introspection of the agent's methods and their JSDoc

    return actions;
  };

  /**
   * Constructs a prompt for the LLM based on agent state and available actions.
   * @memberof Intelligence
   * @param {Object} [goal] - Optional goal or context for the agent
   * @returns {string} Formatted prompt for the LLM
   */
  this.buildPrompt = function(goal = null) {
    const state = this.gatherState();
    const actions = this.discoverActions();
    
    let prompt = systemPrompt || `You are an intelligent agent in a 2D world. 
You can perceive your environment and take actions to achieve goals.
Always respond with a JSON object containing your decision.`;

    prompt += `\n\nAgent State:
- ID: ${state.id}
- Name: ${state.name}
- Position: (${state.position.x}, ${state.position.y})
- Size: ${state.size.width}x${state.size.height}
- Orientation: ${state.orientation} radians
- Alive: ${state.isAlive}
- Visible: ${state.isVisible}
- World Bounds: ${state.worldBounds.width}x${state.worldBounds.height}`;

    if (state.perceptions.length > 0) {
      prompt += `\n- Perceptions: ${JSON.stringify(state.perceptions)}`;
    }

    if (state.receivedMessages.length > 0) {
      prompt += `\n- Recent Messages: ${JSON.stringify(state.receivedMessages)}`;
    }

    prompt += `\n\nAvailable Actions:`;
    actions.forEach(action => {
      prompt += `\n- ${action.name}(${action.parameters.map(p => p.name).join(', ')}): ${action.description}`;
    });

    if (goal) {
      prompt += `\n\nGoal: ${goal}`;
    }

    prompt += `\n\nRespond with a JSON object like:
{
  "action": "actionName",
  "parameters": [param1, param2],
  "reasoning": "Why you chose this action"
}`;

    return prompt;
  };

  /**
   * Sends a message to another agent.
   * @memberof Intelligence
   * @param {string} message - The message content
   * @param {number} [targetAgentId] - Target agent ID (if not specified, broadcasts)
   */
  this.say = function(message, targetAgentId = null) {
    const messageObj = {
      from: this.id,
      fromName: agentName,
      to: targetAgentId,
      content: message,
      timestamp: Date.now()
    };

    messageHistory.push(messageObj);

    // Send to target agent or broadcast
    if (targetAgentId) {
      const targetAgent = this.beServer.getEnvironment().getAgents()[targetAgentId];
      if (targetAgent && targetAgent.intelligence) {
        targetAgent.intelligence.receiveMessage(messageObj);
      }
    } else {
      // Broadcast to all agents with intelligence
      Object.values(this.beServer.getEnvironment().getAgents()).forEach(agent => {
        if (agent.intelligence && agent.id !== this.id) {
          agent.intelligence.receiveMessage(messageObj);
        }
      });
    }

    // Display message on screen
    this.displayMessage(messageObj);
  };

  /**
   * Receives a message from another agent.
   * @memberof Intelligence
   * @param {Object} messageObj - The message object
   */
  this.receiveMessage = function(messageObj) {
    receivedMessages.push(messageObj);
    this.displayMessage(messageObj);
  };

  /**
   * Displays a message on the screen.
   * @memberof Intelligence
   * @param {Object} messageObj - The message object to display
   */
  this.displayMessage = function(messageObj) {
    let displayText = `${messageObj.fromName}: "${messageObj.content}"`;
    if (messageObj.to) {
      const targetAgent = this.beServer.getEnvironment().getAgents()[messageObj.to];
      if (targetAgent && targetAgent.intelligence) {
        displayText += ` to ${targetAgent.intelligence.agentName || 'Agent'}`;
      }
    }
    
    // Send to client for display
    this.beServer.connector.messageToGameClient("displayMessage", {
      text: displayText,
      timestamp: messageObj.timestamp
    });
  };

  /**
   * Gets received messages.
   * @memberof Intelligence
   * @returns {Array} Array of received messages
   */
  this.listen = function() {
    return receivedMessages;
  };

  /**
   * Executes an action based on LLM decision.
   * @memberof Intelligence
   * @param {Object} decision - LLM decision object
   * @returns {boolean} True if action was executed successfully
   */
  this.executeDecision = function(decision) {
    try {
      if (!decision.action || !this[decision.action]) {
        console.warn(`Unknown action: ${decision.action}`);
        return false;
      }

      const action = this[decision.action];
      const parameters = decision.parameters || [];

      // Execute the action
      const result = action.apply(this, parameters);
      
      console.log(`Agent ${agentName} executed ${decision.action}: ${decision.reasoning}`);
      return true;
    } catch (error) {
      console.error(`Error executing action ${decision.action}:`, error);
      return false;
    }
  };

  /**
   * Main thinking cycle - queries LLM and executes decisions.
   * @memberof Intelligence
   * @param {string} [goal] - Optional goal for this thinking cycle
   */
  this.think = async function(goal = null) {
    if (isThinking) return;
    isThinking = true;

    try {
      const prompt = this.buildPrompt(goal);
      const response = await llm.generate(prompt);
      
      // Parse LLM response
      let decision;
      try {
        decision = JSON.parse(response);
      } catch (e) {
        console.warn("LLM response is not valid JSON:", response);
        isThinking = false;
        return;
      }

      // Execute the decision
      this.executeDecision(decision);
      
    } catch (error) {
      console.error("Error in thinking cycle:", error);
    } finally {
      isThinking = false;
    }
  };

  /**
   * Starts the intelligence system with periodic thinking.
   * @memberof Intelligence
   */
  this.startIntelligence = function() {
    const thinkingBehavior = () => {
      if (this.isAlive && !isThinking) {
        this.think();
      }
    };

    // Add thinking behavior to agent
    if (!this.behavior) {
      HasBehavior.call(this, thinkingBehavior);
    } else {
      this.aggregateBehavior(thinkingBehavior);
    }
  };

  // Store intelligence methods on the agent
  this.intelligence = {
    think: this.think.bind(this),
    say: this.say.bind(this),
    listen: this.listen.bind(this),
    gatherState: this.gatherState.bind(this),
    discoverActions: this.discoverActions.bind(this),
    buildPrompt: this.buildPrompt.bind(this),
    executeDecision: this.executeDecision.bind(this),
    startIntelligence: this.startIntelligence.bind(this),
    receiveMessage: this.receiveMessage.bind(this),
    agentName: agentName
  };

  // Start intelligence system
  this.startIntelligence();
} 