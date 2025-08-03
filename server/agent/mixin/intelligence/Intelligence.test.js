"use strict";

import { strict as assert } from "assert";
import sinon from "sinon";
import { Intelligence } from "./Intelligence.js";
import { HasBehavior } from "../HasBehavior.js";
import { LLMService, createTestLLM } from "arslib";

describe("Intelligence", function () {
  let mockAgent, mockBEServer, mockEnvironment, mockLLM, intelligence;

  beforeEach(function () {
    // Create mock LLM function
    const mockGenerate = sinon.stub().resolves(JSON.stringify({
      action: "moveRight",
      parameters: [5],
      reasoning: "Testing movement"
    }));
    
    mockLLM = createTestLLM({
      generate: mockGenerate
    });

    // Create mock environment
    mockEnvironment = {
      getAgents: sinon.stub().returns({}),
      getNearbyAgents: sinon.stub().returns([])
    };

    // Create mock BEServer
    mockBEServer = {
      getEnvironment: sinon.stub().returns(mockEnvironment),
      getLLMService: sinon.stub().returns({
        generate: mockLLM,
        isInitialized: sinon.stub().returns(true)
      }),
      connector: {
        messageToGameClient: sinon.stub()
      }
    };

    // Create mock agent
    mockAgent = {
      id: 1,
      beServer: mockBEServer,
      getPosition: sinon.stub().returns({ x: 100, y: 100 }),
      getSize: sinon.stub().returns({ x: 50, y: 50 }),
      orientation: 0,
      isAlive: true,
      isVisible: true,
      isSolid: true,
      worldRectangle: { size: { x: 800, y: 600 } },
      moveRight: sinon.stub().returns(true),
      moveUp: sinon.stub().returns(true),
      moveDown: sinon.stub().returns(true),
      moveLeft: sinon.stub().returns(true),
      move: sinon.stub().returns(true),
      setPosition: sinon.stub().returns(true),
      behavior: function () {} // Always a real function
    };
    
    // Apply HasBehavior mixin
    HasBehavior.call(mockAgent, function() {});
  });

  afterEach(function () {
    // Clean up stubs
    sinon.restore();
  });

  // Helper functions for demo scenarios
  function createIntelligentAgent(beServer, agentName = "Agent") {
    const agent = {
      id: Math.floor(Math.random() * 1000),
      beServer: beServer,
      getPosition: sinon.stub().returns({ x: 100, y: 100 }),
      getSize: sinon.stub().returns({ x: 50, y: 50 }),
      orientation: 0,
      isAlive: true,
      isVisible: true,
      isSolid: true,
      worldRectangle: { size: { x: 800, y: 600 } },
      moveRight: sinon.stub().returns(true),
      moveUp: sinon.stub().returns(true),
      moveDown: sinon.stub().returns(true),
      moveLeft: sinon.stub().returns(true),
      move: sinon.stub().returns(true),
      setPosition: sinon.stub().returns(true),
      behavior: function () {} // Always a real function
    };
    
    // Apply HasBehavior mixin first
    HasBehavior.call(agent, function() {});
    
    Intelligence.call(agent, { agentName });
    return agent;
  }

  function createEnhancedIntelligentAgent(beServer, agentName = "EnhancedAgent") {
    const agent = createIntelligentAgent(beServer, agentName);
    agent.behavior = function () {}; // Ensure real function
    
    // Add enhanced perception
    const originalGatherState = agent.intelligence.gatherState;
    agent.intelligence.gatherState = function() {
      const state = originalGatherState.call(this);
      state.perceptions = [
        { id: 2, name: "NearbyAgent", distance: 50, position: { x: 150, y: 150 }, isVisible: true }
      ];
      return state;
    };
    
    // Add custom system prompt
    agent.intelligence.buildPrompt = function(goal = null) {
      return `You are an intelligent agent in a 2D world with enhanced perception.
Your goal is to explore the environment and interact with other agents.
${goal ? `Current goal: ${goal}` : ''}
Agent State: ${JSON.stringify(this.gatherState())}
Available Actions: ${JSON.stringify(this.discoverActions())}
Respond with JSON: {"action": "actionName", "parameters": [params], "reasoning": "explanation"}`;
    };
    
    return agent;
  }

  function createIntelligentAgentGroup(beServer) {
    const agents = [
      createIntelligentAgent(beServer, "Explorer"),
      createIntelligentAgent(beServer, "Communicator"),
      createIntelligentAgent(beServer, "Guard")
    ];
    agents.forEach(agent => { agent.behavior = function () {}; }); // Ensure real function for all
    
    // Set different goals for each agent
    agents[0].intelligence.buildPrompt = function(goal = null) {
      return `You are an Explorer agent. Your goal is to explore the environment and discover new areas.
${goal ? `Current goal: ${goal}` : ''}
Agent State: ${JSON.stringify(this.gatherState())}
Available Actions: ${JSON.stringify(this.discoverActions())}
Respond with JSON: {"action": "actionName", "parameters": [params], "reasoning": "explanation"}`;
    };
    
    agents[1].intelligence.buildPrompt = function(goal = null) {
      return `You are a Communicator agent. Your goal is to interact with other agents and share information.
${goal ? `Current goal: ${goal}` : ''}
Agent State: ${JSON.stringify(this.gatherState())}
Available Actions: ${JSON.stringify(this.discoverActions())}
Respond with JSON: {"action": "actionName", "parameters": [params], "reasoning": "explanation"}`;
    };
    
    agents[2].intelligence.buildPrompt = function(goal = null) {
      return `You are a Guard agent. Your goal is to protect the area and monitor for threats.
${goal ? `Current goal: ${goal}` : ''}
Agent State: ${JSON.stringify(this.gatherState())}
Available Actions: ${JSON.stringify(this.discoverActions())}
Respond with JSON: {"action": "actionName", "parameters": [params], "reasoning": "explanation"}`;
    };
    
    return agents;
  }

  function setupIntelligentGame(beServer) {
    return createIntelligentAgentGroup(beServer);
  }

  describe("Initialization", function () {
    it("should initialize with default configuration", function () {
      Intelligence.call(mockAgent, {});
      
      assert(mockAgent.intelligence);
      assert(mockAgent.intelligence.agentName === "Agent");
      assert(mockAgent.intelligence.gatherState);
      assert(mockAgent.intelligence.discoverActions);
      assert(mockAgent.intelligence.think);
    });

    it("should initialize with custom configuration", function () {
      Intelligence.call(mockAgent, {
        agentName: "TestAgent",
        enableMessages: false
      });
      
      assert(mockAgent.intelligence.agentName === "TestAgent");
    });

    it("should throw error if LLM service is not available", function () {
      mockBEServer.getLLMService.returns(null);
      
      assert.throws(() => {
        Intelligence.call(mockAgent, {});
      }, /Intelligence mixin requires system LLM service to be initialized/);
    });
  });

  describe("State Gathering", function () {
    beforeEach(function () {
      Intelligence.call(mockAgent, {});
    });

    it("should gather agent state correctly", function () {
      const state = mockAgent.intelligence.gatherState();
      
      assert.strictEqual(state.id, 1);
      assert.strictEqual(state.name, "Agent");
      assert.deepStrictEqual(state.position, { x: 100, y: 100 });
      assert.deepStrictEqual(state.size, { width: 50, height: 50 });
      assert.strictEqual(state.orientation, 0);
      assert.strictEqual(state.isAlive, true);
      assert.strictEqual(state.isVisible, true);
      assert.strictEqual(state.isSolid, true);
    });

    it("should include custom perceptions", function () {
      const customPerceptions = [{ id: 2, distance: 50 }];
      Intelligence.call(mockAgent, {
        perceptionFn: () => customPerceptions
      });
      
      const state = mockAgent.intelligence.gatherState();
      assert.deepStrictEqual(state.perceptions, customPerceptions);
    });
  });

  describe("Action Discovery", function () {
    beforeEach(function () {
      Intelligence.call(mockAgent, {});
    });

    it("should discover basic movement actions", function () {
      const actions = mockAgent.intelligence.discoverActions();
      const actionNames = actions.map(a => a.name);
      
      assert(actionNames.includes("moveUp"));
      assert(actionNames.includes("moveDown"));
      assert(actionNames.includes("moveLeft"));
      assert(actionNames.includes("moveRight"));
      assert(actionNames.includes("move"));
      assert(actionNames.includes("setPosition"));
    });

    it("should include message actions when enabled", function () {
      Intelligence.call(mockAgent, { enableMessages: true });
      
      const actions = mockAgent.intelligence.discoverActions();
      const actionNames = actions.map(a => a.name);
      
      assert(actionNames.includes("say"));
      assert(actionNames.includes("listen"));
    });

    it("should exclude message actions when disabled", function () {
      Intelligence.call(mockAgent, { enableMessages: false });
      
      const actions = mockAgent.intelligence.discoverActions();
      const actionNames = actions.map(a => a.name);
      
      assert(!actionNames.includes("say"));
      assert(!actionNames.includes("listen"));
    });
  });

  describe("Prompt Building", function () {
    beforeEach(function () {
      Intelligence.call(mockAgent, {});
    });

    it("should build basic prompt", function () {
      const prompt = mockAgent.intelligence.buildPrompt();
      
      assert(prompt.includes("You are an intelligent agent in a 2D world"));
      assert(prompt.includes("Agent State:"));
      assert(prompt.includes("Available Actions:"));
    });

    it("should include goal in prompt", function () {
      const prompt = mockAgent.intelligence.buildPrompt("Test goal");
      
      assert(prompt.includes("Goal: Test goal"));
    });

    it("should use custom system prompt", function () {
      Intelligence.call(mockAgent, {
        systemPrompt: "Custom system prompt"
      });
      
      const prompt = mockAgent.intelligence.buildPrompt();
      assert(prompt.includes("Custom system prompt"));
    });
  });

  describe("Decision Execution", function () {
    beforeEach(function () {
      Intelligence.call(mockAgent, {});
    });

    it("should execute valid decision", function () {
      const decision = {
        action: "moveRight",
        parameters: [5],
        reasoning: "Test movement"
      };
      
      const result = mockAgent.intelligence.executeDecision(decision);
      
      assert.strictEqual(result, true);
      assert(mockAgent.moveRight.calledOnce);
      assert(mockAgent.moveRight.calledWith(5));
    });

    it("should handle invalid action", function () {
      const decision = {
        action: "invalidAction",
        parameters: [],
        reasoning: "Test"
      };
      
      const result = mockAgent.intelligence.executeDecision(decision);
      
      assert.strictEqual(result, false);
    });
  });

  describe("Thinking Process", function () {
    it("should think and execute decisions", async function () {
      // Create a mock LLM function that we can track
      const mockGenerate = sinon.stub().resolves(JSON.stringify({
        action: "moveRight",
        parameters: [5],
        reasoning: "Testing movement"
      }));
      
      // Create a fresh mock agent with the tracked LLM
      const testAgent = {
        id: 1,
        beServer: {
          getLLMService: sinon.stub().returns({
            generate: mockGenerate,
            isInitialized: sinon.stub().returns(true)
          }),
          getEnvironment: sinon.stub().returns(mockEnvironment),
          connector: {
            messageToGameClient: sinon.stub()
          }
        },
        getPosition: sinon.stub().returns({ x: 100, y: 100 }),
        getSize: sinon.stub().returns({ x: 50, y: 50 }),
        orientation: 0,
        isAlive: true,
        isVisible: true,
        isSolid: true,
        worldRectangle: { size: { x: 800, y: 600 } },
        moveRight: sinon.stub().returns(true),
        moveUp: sinon.stub().returns(true),
        moveDown: sinon.stub().returns(true),
        moveLeft: sinon.stub().returns(true),
        move: sinon.stub().returns(true),
        setPosition: sinon.stub().returns(true),
        behavior: function () {}
      };
      
      HasBehavior.call(testAgent, function() {});
      Intelligence.call(testAgent, {});
      
      await testAgent.intelligence.think("Test goal");
      
      // Check that the LLM was called
      assert(mockGenerate.calledOnce);
      assert(testAgent.moveRight.calledOnce);
    });

    it("should handle invalid JSON responses", async function () {
      // Create a mock LLM that returns invalid JSON
      const mockGenerateInvalid = sinon.stub().resolves("Invalid JSON response");
      
      const testAgent = {
        id: 1,
        beServer: {
          getLLMService: sinon.stub().returns({
            generate: mockGenerateInvalid,
            isInitialized: sinon.stub().returns(true)
          }),
          getEnvironment: sinon.stub().returns(mockEnvironment),
          connector: {
            messageToGameClient: sinon.stub()
          }
        },
        getPosition: sinon.stub().returns({ x: 100, y: 100 }),
        getSize: sinon.stub().returns({ x: 50, y: 50 }),
        orientation: 0,
        isAlive: true,
        isVisible: true,
        isSolid: true,
        worldRectangle: { size: { x: 800, y: 600 } },
        moveRight: sinon.stub().returns(true),
        moveUp: sinon.stub().returns(true),
        moveDown: sinon.stub().returns(true),
        moveLeft: sinon.stub().returns(true),
        move: sinon.stub().returns(true),
        setPosition: sinon.stub().returns(true),
        behavior: function () {}
      };
      
      HasBehavior.call(testAgent, function() {});
      Intelligence.call(testAgent, {});
      
      await testAgent.intelligence.think();
      
      // Should not execute any actions due to invalid JSON
      assert(!testAgent.moveRight.called);
    });

    it("should handle LLM errors gracefully", async function () {
      // Create a mock LLM that throws an error
      const mockGenerateError = sinon.stub().rejects(new Error("LLM error"));
      
      const testAgent = {
        id: 1,
        beServer: {
          getLLMService: sinon.stub().returns({
            generate: mockGenerateError,
            isInitialized: sinon.stub().returns(true)
          }),
          getEnvironment: sinon.stub().returns(mockEnvironment),
          connector: {
            messageToGameClient: sinon.stub()
          }
        },
        getPosition: sinon.stub().returns({ x: 100, y: 100 }),
        getSize: sinon.stub().returns({ x: 50, y: 50 }),
        orientation: 0,
        isAlive: true,
        isVisible: true,
        isSolid: true,
        worldRectangle: { size: { x: 800, y: 600 } },
        moveRight: sinon.stub().returns(true),
        moveUp: sinon.stub().returns(true),
        moveDown: sinon.stub().returns(true),
        moveLeft: sinon.stub().returns(true),
        move: sinon.stub().returns(true),
        setPosition: sinon.stub().returns(true),
        behavior: function () {}
      };
      
      HasBehavior.call(testAgent, function() {});
      Intelligence.call(testAgent, {});
      
      await testAgent.intelligence.think();
      
      // Should not crash and should not execute actions
      assert(!testAgent.moveRight.called);
    });

    it("should prevent concurrent thinking", async function () {
      // Create a mock LLM function that we can track
      const mockGenerate = sinon.stub().resolves(JSON.stringify({
        action: "moveRight",
        parameters: [5],
        reasoning: "Testing movement"
      }));
      
      const testAgent = {
        id: 1,
        beServer: {
          getLLMService: sinon.stub().returns({
            generate: mockGenerate,
            isInitialized: sinon.stub().returns(true)
          }),
          getEnvironment: sinon.stub().returns(mockEnvironment),
          connector: {
            messageToGameClient: sinon.stub()
          }
        },
        getPosition: sinon.stub().returns({ x: 100, y: 100 }),
        getSize: sinon.stub().returns({ x: 50, y: 50 }),
        orientation: 0,
        isAlive: true,
        isVisible: true,
        isSolid: true,
        worldRectangle: { size: { x: 800, y: 600 } },
        moveRight: sinon.stub().returns(true),
        moveUp: sinon.stub().returns(true),
        moveDown: sinon.stub().returns(true),
        moveLeft: sinon.stub().returns(true),
        move: sinon.stub().returns(true),
        setPosition: sinon.stub().returns(true),
        behavior: function () {}
      };
      
      HasBehavior.call(testAgent, function() {});
      Intelligence.call(testAgent, {});
      
      // Start first thinking cycle
      const firstThink = testAgent.intelligence.think();
      
      // Try to start second thinking cycle immediately
      const secondThink = testAgent.intelligence.think();
      
      await Promise.all([firstThink, secondThink]);
      
      // Only one LLM call should have been made
      assert.strictEqual(mockGenerate.callCount, 1);
    });
  });

  describe("Behavior Integration", function () {
    it("should add thinking behavior to agent", function () {
      Intelligence.call(mockAgent, {});
      
      assert(mockAgent.behavior);
      assert(typeof mockAgent.behavior === "function");
    });

    it("should integrate with existing behavior", function () {
      const existingBehavior = sinon.stub();
      mockAgent.behavior = existingBehavior;
      
      Intelligence.call(mockAgent, {});
      
      assert(mockAgent.behavior !== existingBehavior);
      assert(typeof mockAgent.behavior === "function");
    });
  });

  // Demo Integration Tests
  describe("Demo Scenarios", function () {
    describe("Basic Intelligent Agent", function () {
      it("should create an intelligent agent with basic perception", function () {
        const agent = createIntelligentAgent(mockBEServer, "TestAgent");
        
        assert(agent.intelligence);
        assert.strictEqual(agent.intelligence.agentName, "TestAgent");
        assert(agent.intelligence.gatherState);
        assert(agent.intelligence.discoverActions);
      });

      it("should use default agent name if not provided", function () {
        const agent = createIntelligentAgent(mockBEServer);
        
        assert.strictEqual(agent.intelligence.agentName, "Agent");
      });

      it("should enable messages by default", function () {
        const agent = createIntelligentAgent(mockBEServer);
        
        const actions = agent.intelligence.discoverActions();
        const actionNames = actions.map(a => a.name);
        assert(actionNames.includes("say"));
        assert(actionNames.includes("listen"));
      });
    });

    describe("Enhanced Intelligent Agent", function () {
      it("should create an agent with enhanced perception", function () {
        const agent = createEnhancedIntelligentAgent(mockBEServer, "EnhancedAgent");
        
        assert(agent.intelligence);
        assert.strictEqual(agent.intelligence.agentName, "EnhancedAgent");
        
        // Check that enhanced perception is used
        const state = agent.intelligence.gatherState();
        assert(Array.isArray(state.perceptions));
        assert.strictEqual(state.perceptions.length, 1);
        assert.strictEqual(state.perceptions[0].name, "NearbyAgent");
      });

      it("should use custom system prompt", function () {
        const agent = createEnhancedIntelligentAgent(mockBEServer);
        
        const prompt = agent.intelligence.buildPrompt();
        assert(prompt.includes("You are an intelligent agent in a 2D world with enhanced perception"));
        assert(prompt.includes("Your goal is to explore the environment"));
      });
    });

    describe("Intelligent Agent Group", function () {
      it("should create multiple agents with different personalities", function () {
        const agents = createIntelligentAgentGroup(mockBEServer);
        
        assert.strictEqual(agents.length, 3);
        
        const agentNames = agents.map(a => a.intelligence.agentName);
        assert(agentNames.includes("Explorer"));
        assert(agentNames.includes("Communicator"));
        assert(agentNames.includes("Guard"));
      });

      it("should set different goals for each agent", function () {
        const agents = createIntelligentAgentGroup(mockBEServer);
        
        // Each agent should have intelligence capabilities
        agents.forEach(agent => {
          assert(agent.intelligence);
          assert(agent.intelligence.think);
        });

        // Check that each agent has a different prompt style
        const explorerPrompt = agents[0].intelligence.buildPrompt();
        const communicatorPrompt = agents[1].intelligence.buildPrompt();
        const guardPrompt = agents[2].intelligence.buildPrompt();

        assert(explorerPrompt.includes("Explorer agent"));
        assert(communicatorPrompt.includes("Communicator agent"));
        assert(guardPrompt.includes("Guard agent"));
      });
    });

    describe("Intelligent Game Setup", function () {
      it("should setup a complete intelligent game", function () {
        const agents = setupIntelligentGame(mockBEServer);
        
        assert.strictEqual(agents.length, 3);
        
        // Verify all agents have intelligence
        agents.forEach(agent => {
          assert(agent.intelligence);
          assert(agent.intelligence.agentName);
        });
      });

      it("should return the created agents", function () {
        const agents = setupIntelligentGame(mockBEServer);
        
        assert(Array.isArray(agents));
        assert.strictEqual(agents.length, 3);
      });
    });

    describe("Agent Communication", function () {
      it("should allow agents to communicate with each other", function () {
        // Create mock agents with proper environment setup
        const agent1 = {
          id: 1,
          beServer: {
            getLLMService: () => ({ isInitialized: () => true, generate: () => "" }),
            getEnvironment: sinon.stub().returns({
              getAgents: sinon.stub().returns({
                1: { id: 1, intelligence: { receiveMessage: sinon.stub() } },
                2: { id: 2, intelligence: { receiveMessage: sinon.stub() } }
              })
            }),
            connector: {
              messageToGameClient: sinon.stub()
            }
          },
          getPosition: sinon.stub().returns({ x: 100, y: 100 }),
          getSize: sinon.stub().returns({ x: 50, y: 50 }),
          orientation: 0,
          isAlive: true,
          isVisible: true,
          isSolid: true,
          worldRectangle: { size: { x: 800, y: 600 } },
          behavior: function () {}
        };
        
        HasBehavior.call(agent1, function() {});
        Intelligence.call(agent1, { agentName: "Agent1" });
        
        // Agent1 sends message to Agent2
        agent1.intelligence.say("Hello Agent2!", 2);
        
        // Verify message was sent
        assert(agent1.beServer.connector.messageToGameClient.calledOnce);
      });

      it("should allow broadcast messages", function () {
        // Create mock agents with proper environment setup
        const agent1 = {
          id: 1,
          beServer: {
            getLLMService: () => ({ isInitialized: () => true, generate: () => "" }),
            getEnvironment: sinon.stub().returns({
              getAgents: sinon.stub().returns({
                1: { id: 1, intelligence: { receiveMessage: sinon.stub() } },
                2: { id: 2, intelligence: { receiveMessage: sinon.stub() } }
              })
            }),
            connector: {
              messageToGameClient: sinon.stub()
            }
          },
          getPosition: sinon.stub().returns({ x: 100, y: 100 }),
          getSize: sinon.stub().returns({ x: 50, y: 50 }),
          orientation: 0,
          isAlive: true,
          isVisible: true,
          isSolid: true,
          worldRectangle: { size: { x: 800, y: 600 } },
          behavior: function () {}
        };
        
        HasBehavior.call(agent1, function() {});
        Intelligence.call(agent1, { agentName: "Agent1" });
        
        // Agent1 broadcasts message
        agent1.intelligence.say("Hello everyone!");
        
        // Verify broadcast message was sent
        assert(agent1.beServer.connector.messageToGameClient.calledOnce);
      });
    });

    describe("Perception System", function () {
      it("should gather nearby agents in perception", function () {
        const agent = createIntelligentAgent(mockBEServer);
        
        // Mock nearby agents
        const nearbyAgent = {
          id: 2,
          getPosition: sinon.stub().returns({ x: 150, y: 150 }),
          isUserAgent: sinon.stub().returns(false)
        };
        
        mockEnvironment.getNearbyAgents.returns([nearbyAgent]);
        
        // Override the perception function to use the environment
        Intelligence.call(agent, {
          perceptionFn: function() {
            return this.beServer.getEnvironment().getNearbyAgents().map(agent => ({
              id: agent.id,
              distance: 50
            }));
          }
        });
        
        const state = agent.intelligence.gatherState();
        
        assert(Array.isArray(state.perceptions));
        assert.strictEqual(state.perceptions.length, 1);
        assert.strictEqual(state.perceptions[0].id, 2);
      });

      it("should include distance calculations in perception", function () {
        const agent = createIntelligentAgent(mockBEServer);
        
        const nearbyAgent = {
          id: 2,
          getPosition: sinon.stub().returns({ x: 150, y: 150 }),
          isUserAgent: sinon.stub().returns(false)
        };
        
        mockEnvironment.getNearbyAgents.returns([nearbyAgent]);
        
        // Override the perception function to include distance
        Intelligence.call(agent, {
          perceptionFn: function() {
            return this.beServer.getEnvironment().getNearbyAgents().map(agent => ({
              id: agent.id,
              distance: 50
            }));
          }
        });
        
        const state = agent.intelligence.gatherState();
        
        // Check that distance calculation exists
        assert(state.perceptions[0].hasOwnProperty('distance'));
        assert(typeof state.perceptions[0].distance === 'number');
      });
    });

    describe("Enhanced Perception", function () {
      it("should include more details in enhanced perception", function () {
        const agent = createEnhancedIntelligentAgent(mockBEServer);
        
        const state = agent.intelligence.gatherState();
        
        assert.strictEqual(state.perceptions[0].name, "NearbyAgent");
        assert.strictEqual(state.perceptions[0].isVisible, true);
        assert(state.perceptions[0].position);
      });
    });

    describe("Integration with LLM Service", function () {
      it("should use system-wide LLM service", function () {
        const agent = createIntelligentAgent(mockBEServer);
        
        // Verify agent uses system LLM service
        assert(mockBEServer.getLLMService.called);
      });

      it("should handle LLM service errors gracefully", async function () {
        const agent = createIntelligentAgent(mockBEServer);
        
        // Create a new mock LLM that throws an error
        const mockGenerateError = sinon.stub().rejects(new Error("LLM error"));
        const mockLLMError = createTestLLM({ generate: mockGenerateError });
        
        // Replace the LLM service temporarily
        const originalLLM = mockBEServer.getLLMService().generate;
        mockBEServer.getLLMService().generate = mockLLMError;
        
        // Should not crash
        await agent.intelligence.think("Test goal");
        
        // Should not execute actions due to error
        assert(!agent.moveRight.called);
        
        // Restore original LLM
        mockBEServer.getLLMService().generate = originalLLM;
      });
    });
  });
});

// Helper functions for creating test agents
function createIntelligentAgent(beServer, agentName = "Agent") {
  const agent = {
    id: Math.floor(Math.random() * 1000),
    beServer: beServer,
    getPosition: sinon.stub().returns({ x: 100, y: 100 }),
    getSize: sinon.stub().returns({ x: 50, y: 50 }),
    orientation: 0,
    isAlive: true,
    isVisible: true,
    isSolid: true,
    worldRectangle: { size: { x: 800, y: 600 } },
    moveRight: sinon.stub().returns(true),
    moveUp: sinon.stub().returns(true),
    moveDown: sinon.stub().returns(true),
    moveLeft: sinon.stub().returns(true),
    move: sinon.stub().returns(true),
    setPosition: sinon.stub().returns(true),
    behavior: function () {}
  };
  
  HasBehavior.call(agent, function() {});
  Intelligence.call(agent, { agentName });
  
  return agent;
}

function createEnhancedIntelligentAgent(beServer, agentName = "EnhancedAgent") {
  const agent = createIntelligentAgent(beServer, agentName);
  
  // Override with enhanced perception
  Intelligence.call(agent, {
    agentName,
    systemPrompt: "You are an intelligent agent in a 2D world with enhanced perception. Your goal is to explore the environment and interact with other agents.",
    perceptionFn: function() {
      return [{
        id: 2,
        name: "NearbyAgent",
        position: { x: 150, y: 150 },
        distance: 70.7,
        isVisible: true
      }];
    }
  });
  
  return agent;
}

function createIntelligentAgentGroup(beServer) {
  const agents = [];
  
  // Explorer agent
  const explorer = createIntelligentAgent(beServer, "Explorer");
  Intelligence.call(explorer, {
    agentName: "Explorer",
    systemPrompt: "You are an Explorer agent. Your goal is to explore the environment and discover new areas."
  });
  agents.push(explorer);
  
  // Communicator agent
  const communicator = createIntelligentAgent(beServer, "Communicator");
  Intelligence.call(communicator, {
    agentName: "Communicator",
    systemPrompt: "You are a Communicator agent. Your goal is to facilitate communication between other agents."
  });
  agents.push(communicator);
  
  // Guard agent
  const guard = createIntelligentAgent(beServer, "Guard");
  Intelligence.call(guard, {
    agentName: "Guard",
    systemPrompt: "You are a Guard agent. Your goal is to protect the area and monitor for threats."
  });
  agents.push(guard);
  
  return agents;
}

function setupIntelligentGame(beServer) {
  return createIntelligentAgentGroup(beServer);
} 