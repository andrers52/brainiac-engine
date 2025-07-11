import { strict as assert } from "assert";
import sinon from "sinon";
import { BEServer } from "../server/BEServer.js";
import { LLMService, TransformersLLMService, createTestLLM } from "../server/LLMService.js";

// Environment variable to control real vs mock LLM testing
const USE_REAL_LLM = process.env.TEST_REAL_LLM === "true";
const TEST_TIMEOUT = USE_REAL_LLM ? 60000 : 5000; // 60s for real, 5s for mock

describe("LLMService Integration", function () {
  let beServer;
  let llmService;

  beforeEach(function () {
    beServer = new BEServer();
    // Set timeout based on whether we're using real or mock LLM
    this.timeout(TEST_TIMEOUT);
  });

  afterEach(function () {
    if (beServer) {
      beServer.stop();
    }
  });

  describe("BEServer LLM Integration", function () {
    it("should load LLM config from config.json", async function () {
      // Set timeout for this specific test
      this.timeout(USE_REAL_LLM ? 60000 : 5000);
      
      if (USE_REAL_LLM) {
        console.log("🤖 Testing with REAL LLM (this may take 30+ seconds)");
        // Use real LLM service initialization
        await beServer.start();
      } else {
        console.log("🧪 Testing with MOCK LLM (fast test)");
        // Override the initializeLLMService method BEFORE starting the server
        const originalInitializeLLMService = beServer.initializeLLMService;
        beServer.initializeLLMService = async function(config) {
          const mockLLM = createTestLLM({
            generate: async (prompt) => `Mock response to: ${prompt}`
          });
          
          this.llmService = new LLMService();
          await this.llmService.initialize({
            llmFunction: mockLLM,
            modelName: config.modelName || "Test-Model"
          });
        };
        
        await beServer.start();
        
        // Restore original method
        beServer.initializeLLMService = originalInitializeLLMService;
      }
      
      const llmService = beServer.getLLMService();
      assert(llmService, "LLM service should be available");
      assert(llmService.isInitialized(), "LLM service should be initialized");
    });

    it("should initialize LLM service with config", async function () {
      // Set timeout for this specific test
      this.timeout(USE_REAL_LLM ? 60000 : 5000);
      
      if (USE_REAL_LLM) {
        console.log("🤖 Testing with REAL LLM (this may take 30+ seconds)");
        // Use real LLM service initialization
        await beServer.start();
      } else {
        console.log("🧪 Testing with MOCK LLM (fast test)");
        // Override the initializeLLMService method BEFORE starting the server
        const originalInitializeLLMService = beServer.initializeLLMService;
        beServer.initializeLLMService = async function(config) {
          const mockLLM = createTestLLM({
            generate: async (prompt) => `Mock response to: ${prompt}`
          });
          
          this.llmService = new LLMService();
          await this.llmService.initialize({
            llmFunction: mockLLM,
            modelName: config.modelName || "Test-Model"
          });
        };
        
        await beServer.start();
        
        // Restore original method
        beServer.initializeLLMService = originalInitializeLLMService;
      }
      
      const llmService = beServer.getLLMService();
      assert(llmService, "LLM service should be available");
      assert(llmService.isInitialized(), "LLM service should be initialized");
      
      // Check that it's the right type based on mode
      if (USE_REAL_LLM) {
        // In real mode, it should be a TransformersLLMService
        assert(llmService.hasOwnProperty("pipeline"), "Should have pipeline property in real mode");
      } else {
        // In mock mode, it should be a base LLMService
        assert(typeof llmService.generate === "function", "Should have generate method");
      }
    });

    it("should provide LLM service status information", async function () {
      // Set timeout for this specific test
      this.timeout(USE_REAL_LLM ? 60000 : 5000);
      
      if (USE_REAL_LLM) {
        console.log("🤖 Testing with REAL LLM (this may take 30+ seconds)");
        // Use real LLM service initialization
        await beServer.start();
      } else {
        console.log("🧪 Testing with MOCK LLM (fast test)");
        // Override the initializeLLMService method BEFORE starting the server
        const originalInitializeLLMService = beServer.initializeLLMService;
        beServer.initializeLLMService = async function(config) {
          const mockLLM = createTestLLM({
            generate: async (prompt) => `Mock response to: ${prompt}`
          });
          
          this.llmService = new LLMService();
          await this.llmService.initialize({
            llmFunction: mockLLM,
            modelName: config.modelName || "Test-Model"
          });
        };
        
        await beServer.start();
        
        // Restore original method
        beServer.initializeLLMService = originalInitializeLLMService;
      }
      
      const llmService = beServer.getLLMService();
      
      // Check individual status properties
      assert(typeof llmService.isInitialized() === "boolean", "isInitialized should be boolean");
      assert(typeof llmService.isLoading() === "boolean", "isLoading should be boolean");
      
      const config = llmService.getConfig();
      assert(config, "Config should be available");
      assert(typeof config.modelName === "string", "modelName should be string");
      assert(config.modelName.length > 0, "modelName should not be empty");
    });

    it("should provide cache statistics", async function () {
      // Set timeout for this specific test
      this.timeout(USE_REAL_LLM ? 60000 : 5000);
      
      if (USE_REAL_LLM) {
        console.log("🤖 Testing with REAL LLM (this may take 30+ seconds)");
        // Use real LLM service initialization
        await beServer.start();
      } else {
        console.log("🧪 Testing with MOCK LLM (fast test)");
        // Override the initializeLLMService method BEFORE starting the server
        const originalInitializeLLMService = beServer.initializeLLMService;
        beServer.initializeLLMService = async function(config) {
          const mockLLM = createTestLLM({
            generate: async (prompt) => `Mock response to: ${prompt}`
          });
          
          this.llmService = new LLMService();
          await this.llmService.initialize({
            llmFunction: mockLLM,
            modelName: config.modelName || "Test-Model"
          });
        };
        
        await beServer.start();
        
        // Restore original method
        beServer.initializeLLMService = originalInitializeLLMService;
      }
      
      const llmService = beServer.getLLMService();
      const cacheStats = llmService.getCacheStats();
      
      assert(cacheStats, "Cache stats should be available");
      assert(cacheStats.memoryCache, "Memory cache stats should be present");
      assert(cacheStats.persistentStorage, "Persistent storage stats should be present");
      assert(typeof cacheStats.memoryCache.size === "number", "Memory cache size should be number");
      assert(Array.isArray(cacheStats.memoryCache.keys), "Memory cache keys should be array");
    });

    it("should check persistent storage availability", async function () {
      // Set timeout for this specific test
      this.timeout(USE_REAL_LLM ? 60000 : 5000);
      
      if (USE_REAL_LLM) {
        console.log("🤖 Testing with REAL LLM (this may take 30+ seconds)");
        // Use real LLM service initialization
        await beServer.start();
      } else {
        console.log("🧪 Testing with MOCK LLM (fast test)");
        // Override the initializeLLMService method BEFORE starting the server
        const originalInitializeLLMService = beServer.initializeLLMService;
        beServer.initializeLLMService = async function(config) {
          const mockLLM = createTestLLM({
            generate: async (prompt) => `Mock response to: ${prompt}`
          });
          
          this.llmService = new LLMService();
          await this.llmService.initialize({
            llmFunction: mockLLM,
            modelName: config.modelName || "Test-Model"
          });
        };
        
        await beServer.start();
        
        // Restore original method
        beServer.initializeLLMService = originalInitializeLLMService;
      }
      
      const llmService = beServer.getLLMService();
      const isAvailable = llmService.isPersistentStorageAvailable();
      
      assert(typeof isAvailable === "boolean", "Persistent storage availability should be boolean");
    });

    it("should generate responses with LLM service", async function () {
      // Set timeout for this specific test
      this.timeout(USE_REAL_LLM ? 60000 : 5000);
      
      if (USE_REAL_LLM) {
        console.log("🤖 Testing with REAL LLM (this may take 30+ seconds)");
        // Use real LLM service initialization
        await beServer.start();
      } else {
        console.log("🧪 Testing with MOCK LLM (fast test)");
        // Override the initializeLLMService method BEFORE starting the server
        const originalInitializeLLMService = beServer.initializeLLMService;
        beServer.initializeLLMService = async function(config) {
          const mockLLM = createTestLLM({
            generate: async (prompt) => `Mock response to: ${prompt}`
          });
          
          this.llmService = new LLMService();
          await this.llmService.initialize({
            llmFunction: mockLLM,
            modelName: config.modelName || "Test-Model"
          });
        };
        
        await beServer.start();
        
        // Restore original method
        beServer.initializeLLMService = originalInitializeLLMService;
      }
      
      const llmService = beServer.getLLMService();
      assert(llmService.isInitialized(), "LLM service should be initialized");
      
      const response = await llmService.generate("Hello, world!");
      assert(response, "Should generate a response");
      assert(typeof response === "string", "Response should be a string");
      assert(response.length > 0, "Response should not be empty");
      
      if (USE_REAL_LLM) {
        console.log(`🤖 Real LLM response: "${response}"`);
      } else {
        assert(response.includes("Mock response to: Hello, world!"), "Should return mock response");
      }
    });
  });

  describe("TransformersLLMService Model Loading", function () {
    it("should create TransformersLLMService instance", function () {
      const service = new TransformersLLMService();
      assert(service, "Service should be created");
      assert(typeof service.generate === "function", "Should have generate method");
      assert(typeof service.loadModelFromPath === "function", "Should have loadModelFromPath method");
      assert(typeof service.createLLMFunction === "function", "Should have createLLMFunction method");
      assert(service.hasOwnProperty("pipeline"), "Should have pipeline property");
    });

    it("should have pipeline property", function () {
      const service = new TransformersLLMService();
      assert(service.hasOwnProperty("pipeline"));
    });

    it("should load real model when requested", async function () {
      if (!USE_REAL_LLM) {
        console.log("⏭️ Skipping real model test (use TEST_REAL_LLM=true to enable)");
        this.skip();
        return;
      }

      // Set timeout for real model loading test
      this.timeout(60000);
      console.log("🤖 Loading real Transformers.js model (this may take 30+ seconds)");
      
      const service = new TransformersLLMService();
      await service.initialize({
        modelPath: "Xenova/gpt2",
        modelName: "GPT-2",
        maxTokens: 50,
        temperature: 0.7
      });
      
      assert(service.isInitialized(), "Service should be initialized");
      assert(service.pipeline, "Pipeline should be loaded");
      
      const response = await service.generate("Hello");
      assert(response, "Should generate a response");
      assert(typeof response === "string", "Response should be a string");
      assert(response.length > 0, "Response should not be empty");
      
      console.log(`🤖 Real Transformers.js response: "${response}"`);
    });
  });

  describe("LLMService Configuration", function () {
    it("should update configuration", function () {
      const service = new LLMService();
      const newConfig = { maxTokens: 200, temperature: 0.8 };
      
      service.updateConfig(newConfig);
      const config = service.getConfig();
      
      assert.strictEqual(config.maxTokens, 200);
      assert.strictEqual(config.temperature, 0.8);
    });

    it("should clear memory cache", function () {
      const service = new LLMService();
      
      // Mock the console.log to avoid output during tests
      const consoleSpy = sinon.spy(console, "log");
      
      service.clearMemoryCache();
      
      assert(consoleSpy.calledWith("🗑️ In-memory cache cleared"));
      
      consoleSpy.restore();
    });

    it("should clear all caches", async function () {
      const service = new LLMService();
      
      // Mock the console methods
      const consoleSpy = sinon.spy(console, "log");
      const consoleWarnSpy = sinon.spy(console, "warn");
      
      await service.clearAllCaches();
      
      assert(consoleSpy.calledWith("🗑️ In-memory cache cleared"));
      
      consoleSpy.restore();
      consoleWarnSpy.restore();
    });
  });
}); 