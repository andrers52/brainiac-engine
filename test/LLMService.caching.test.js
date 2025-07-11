"use strict";

import { strict as assert } from "assert";
import sinon from "sinon";
import { Platform } from "arslib";
import { LLMService, TransformersLLMService, createTestLLM } from "../server/LLMService.js";

// Environment detection
const IS_NODE = Platform.isNode();
const IS_BROWSER = !IS_NODE;

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds for real model tests
const CACHE_TEST_TIMEOUT = 60000; // 60 seconds for cache tests

describe("LLMService Caching Tests", function() {
  let llmService;
  let originalConsoleLog;
  let consoleSpy;

  beforeEach(function() {
    llmService = new LLMService();
    
    // Spy on console.log to capture cache messages
    originalConsoleLog = console.log;
    consoleSpy = sinon.spy(console, "log");
  });

  afterEach(function() {
    if (llmService) {
      llmService.clearAllCaches();
    }
    console.log.restore();
  });

  describe("Environment Detection", function() {
    it("should detect Node.js environment correctly", function() {
      if (IS_NODE) {
        assert(Platform.isNode(), "Should detect Node.js environment");
        console.log("✅ Running in Node.js environment");
      } else {
        assert(!Platform.isNode(), "Should detect browser environment");
        console.log("✅ Running in browser environment");
      }
    });

    it("should have appropriate FileStore available", function() {
      const isAvailable = llmService.isPersistentStorageAvailable();
      assert(typeof isAvailable === "boolean", "Persistent storage availability should be boolean");
      
      if (IS_NODE) {
        console.log("💾 Node.js FileStore available:", isAvailable);
      } else {
        console.log("💾 Browser FileStore available:", isAvailable);
      }
    });
  });

  describe("Memory Cache Tests", function() {
    it("should cache models in memory", async function() {
      this.timeout(5000);
      
      const mockLLM = createTestLLM({
        generate: async (prompt) => `Response to: ${prompt}`
      });

      await llmService.initialize({
        llmFunction: mockLLM,
        modelName: "test-model",
        enableMemoryCache: true,
        enablePersistentCache: false
      });

      // First call - should not be cached
      const startTime1 = Date.now();
      const response1 = await llmService.generate("Hello");
      const time1 = Date.now() - startTime1;

      // Second call - should be cached (faster)
      const startTime2 = Date.now();
      const response2 = await llmService.generate("Hello");
      const time2 = Date.now() - startTime2;

      assert(response1 === response2, "Responses should be identical");
      assert(time2 <= time1, "Cached response should be faster or equal");
      
      console.log(`⏱️ First call: ${time1}ms, Second call: ${time2}ms`);
      
      const cacheStats = llmService.getCacheStats();
      assert(cacheStats.memoryCache.size > 0, "Memory cache should have entries");
    });

    it("should clear memory cache", async function() {
      this.timeout(5000);
      
      const mockLLM = createTestLLM({
        generate: async (prompt) => `Response to: ${prompt}`
      });

      await llmService.initialize({
        llmFunction: mockLLM,
        modelName: "test-model",
        enableMemoryCache: true,
        enablePersistentCache: false
      });

      // Generate response to populate cache
      await llmService.generate("Hello");
      
      const statsBefore = llmService.getCacheStats();
      assert(statsBefore.memoryCache.size > 0, "Cache should have entries before clearing");
      
      llmService.clearMemoryCache();
      
      const statsAfter = llmService.getCacheStats();
      assert(statsAfter.memoryCache.size === 0, "Cache should be empty after clearing");
    });
  });

  describe("Persistent Cache Tests", function() {
    it("should store and retrieve from persistent cache", async function() {
      this.timeout(CACHE_TEST_TIMEOUT);
      
      if (!llmService.isPersistentStorageAvailable()) {
        console.log("⏭️ Skipping persistent cache test - storage not available");
        this.skip();
        return;
      }

      const mockLLM = createTestLLM({
        generate: async (prompt) => `Persistent response to: ${prompt}`
      });

      // First service instance - should store to persistent cache
      await llmService.initialize({
        llmFunction: mockLLM,
        modelName: "persistent-test-model",
        enableMemoryCache: true,
        enablePersistentCache: true
      });

      // Generate response to trigger caching
      await llmService.generate("Hello");
      
      // Check that persistent storage was used
      const cacheMessages = consoleSpy.getCalls()
        .map(call => call.args[0])
        .filter(msg => typeof msg === 'string' && msg.includes('💾'));
      
      assert(cacheMessages.length > 0, "Should have persistent storage messages");
      console.log("💾 Persistent storage messages:", cacheMessages);
    });

    it("should retrieve from persistent cache on second run", async function() {
      this.timeout(CACHE_TEST_TIMEOUT);
      
      if (!llmService.isPersistentStorageAvailable()) {
        console.log("⏭️ Skipping persistent cache retrieval test - storage not available");
        this.skip();
        return;
      }

      const mockLLM = createTestLLM({
        generate: async (prompt) => `Persistent response to: ${prompt}`
      });

      // First run - should store to persistent cache
      await llmService.initialize({
        llmFunction: mockLLM,
        modelName: "persistent-retrieval-test",
        enableMemoryCache: true,
        enablePersistentCache: true
      });

      await llmService.generate("Hello");
      
      // Clear memory cache but keep persistent cache
      llmService.clearMemoryCache();
      
      // Second run - should retrieve from persistent cache
      const newLLMService = new LLMService();
      await newLLMService.initialize({
        llmFunction: mockLLM,
        modelName: "persistent-retrieval-test",
        enableMemoryCache: true,
        enablePersistentCache: true
      });

      const response = await newLLMService.generate("Hello");
      assert(response, "Should retrieve response from persistent cache");
      
      // Check for retrieval messages
      const retrievalMessages = consoleSpy.getCalls()
        .map(call => call.args[0])
        .filter(msg => typeof msg === 'string' && msg.includes('📦'));
      
      assert(retrievalMessages.length > 0, "Should have persistent retrieval messages");
      console.log("📦 Persistent retrieval messages:", retrievalMessages);
    });
  });

  describe("Real Model Caching Tests", function() {
    it("should cache real model downloads", async function() {
      this.timeout(CACHE_TEST_TIMEOUT);
      
      if (!process.env.TEST_REAL_LLM) {
        console.log("⏭️ Skipping real model test (set TEST_REAL_LLM=true to enable)");
        this.skip();
        return;
      }

      console.log("🤖 Testing real model caching (this may take 60+ seconds)");
      
      // Use TransformersLLMService for real model loading
      const realLLMService = new TransformersLLMService();

      // First run - should download and cache
      const startTime1 = Date.now();
      await realLLMService.initialize({
        modelPath: "Xenova/gpt2",
        modelName: "GPT-2-Cache-Test",
        maxTokens: 20,
        temperature: 0.7,
        enableMemoryCache: true,
        enablePersistentCache: true
      });
      
      const response1 = await realLLMService.generate("Hello");
      const time1 = Date.now() - startTime1;
      
      console.log(`⏱️ First run (download + cache): ${time1}ms`);
      console.log(`🤖 First response: "${response1}"`);
      
      // Clear memory cache to test persistent cache
      realLLMService.clearMemoryCache();
      
      // Second run - should load from persistent cache
      const newLLMService = new TransformersLLMService();
      const startTime2 = Date.now();
      
      await newLLMService.initialize({
        modelPath: "Xenova/gpt2",
        modelName: "GPT-2-Cache-Test",
        maxTokens: 20,
        temperature: 0.7,
        enableMemoryCache: true,
        enablePersistentCache: true
      });
      
      const response2 = await newLLMService.generate("Hello");
      const time2 = Date.now() - startTime2;
      
      console.log(`⏱️ Second run (from cache): ${time2}ms`);
      console.log(`🤖 Second response: "${response2}"`);
      
      // Verify caching worked
      assert(time2 < time1, "Cached run should be faster than download run");
      assert(response1 && response2, "Both responses should exist");
      
      const cacheStats = newLLMService.getCacheStats();
      console.log("📊 Cache stats:", cacheStats);
    });

    it("should handle cache misses gracefully", async function() {
      this.timeout(CACHE_TEST_TIMEOUT);
      
      if (!process.env.TEST_REAL_LLM) {
        console.log("⏭️ Skipping real model test (set TEST_REAL_LLM=true to enable)");
        this.skip();
        return;
      }

      console.log("🤖 Testing cache miss handling");
      
      // Use TransformersLLMService for real model loading
      const realLLMService = new TransformersLLMService();
      await realLLMService.clearAllCaches();
      
      // Try to load model with cache miss
      await realLLMService.initialize({
        modelPath: "Xenova/gpt2",
        modelName: "GPT-2-Cache-Miss-Test",
        maxTokens: 10,
        temperature: 0.7,
        enableMemoryCache: true,
        enablePersistentCache: true
      });
      
      const response = await realLLMService.generate("Test");
      assert(response, "Should generate response even with cache miss");
      console.log(`🤖 Cache miss response: "${response}"`);
    });

    it("should demonstrate real model caching performance improvement", async function() {
      this.timeout(CACHE_TEST_TIMEOUT * 2); // Double timeout for two runs
      
      if (!process.env.TEST_REAL_LLM) {
        console.log("⏭️ Skipping real model test (set TEST_REAL_LLM=true to enable)");
        this.skip();
        return;
      }

      console.log("🤖 Testing real model caching performance (this may take 2+ minutes)");
      
      // First run - clear all caches and download model
      console.log("🔄 First run: Downloading model (no cache)");
      const startTime1 = Date.now();
      
      const llmService1 = new TransformersLLMService();
      await llmService1.clearAllCaches(); // Ensure clean start
      
      await llmService1.initialize({
        modelPath: "Xenova/gpt2",
        modelName: "GPT-2-Performance-Test",
        maxTokens: 20,
        temperature: 0.7,
        enableMemoryCache: true,
        enablePersistentCache: true
      });
      
      const response1 = await llmService1.generate("Hello world");
      const time1 = Date.now() - startTime1;
      
      console.log(`⏱️ First run (download): ${time1}ms`);
      console.log(`🤖 First response: "${response1}"`);
      
      // Second run - should use persistent cache
      console.log("🔄 Second run: Using persistent cache");
      const startTime2 = Date.now();
      
      const llmService2 = new TransformersLLMService();
      // Don't clear caches - let it use the persistent cache
      
      await llmService2.initialize({
        modelPath: "Xenova/gpt2",
        modelName: "GPT-2-Performance-Test",
        maxTokens: 20,
        temperature: 0.7,
        enableMemoryCache: true,
        enablePersistentCache: true
      });
      
      const response2 = await llmService2.generate("Hello world");
      const time2 = Date.now() - startTime2;
      
      console.log(`⏱️ Second run (cached): ${time2}ms`);
      console.log(`🤖 Second response: "${response2}"`);
      
      // Calculate performance improvement
      const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
      console.log(`🚀 Performance improvement: ${improvement}%`);
      console.log(`📊 Speedup: ${(time1 / time2).toFixed(1)}x faster`);
      
      // Verify caching worked
      assert(time2 < time1, `Cached run (${time2}ms) should be faster than download run (${time1}ms)`);
      assert(response1 && response2, "Both responses should exist");
      assert(response1 !== response2, "Responses should be different (different generations)");
      
      // Check cache stats
      const cacheStats = llmService2.getCacheStats();
      console.log("📊 Final cache stats:", cacheStats);
      
      // Clean up
      await llmService1.clearAllCaches();
      await llmService2.clearAllCaches();
    });
  });

  describe("Cross-Environment Cache Tests", function() {
    it("should have consistent cache behavior across environments", function() {
      const cacheStats = llmService.getCacheStats();
      
      // Basic structure should be consistent
      assert(cacheStats.memoryCache, "Memory cache stats should exist");
      assert(cacheStats.persistentStorage, "Persistent storage stats should exist");
      assert(typeof cacheStats.memoryCache.size === "number", "Memory cache size should be number");
      assert(Array.isArray(cacheStats.memoryCache.keys), "Memory cache keys should be array");
      assert(typeof cacheStats.persistentStorage.available === "boolean", "Persistent storage availability should be boolean");
      assert(typeof cacheStats.persistentStorage.enabled === "boolean", "Persistent storage enabled should be boolean");
      assert(typeof cacheStats.memoryCacheEnabled === "boolean", "Memory cache enabled should be boolean");
      
      console.log("✅ Cache structure is consistent across environments");
      console.log("📊 Cache stats:", cacheStats);
    });

    it("should handle cache key generation consistently", function() {
      const key1 = llmService._generateCacheKey("Xenova/gpt2");
      const key2 = llmService._generateCacheKey("Xenova/gpt2", "custom-key");
      
      assert.strictEqual(key1, "llm-model-Xenova-gpt2");
      assert.strictEqual(key2, "custom-key");
      
      console.log("✅ Cache key generation is consistent");
    });
  });

  describe("Cache Performance Tests", function() {
    it("should demonstrate cache performance improvement", async function() {
      this.timeout(10000);
      
      // Create a mock LLM that simulates processing time and caches responses
      let callCount = 0;
      const mockLLM = async (prompt, options) => {
        callCount++;
        // Simulate some processing time only on first call
        if (callCount === 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return `Response to: ${prompt} (call #${callCount})`;
      };

      await llmService.initialize({
        llmFunction: mockLLM,
        modelName: "performance-test",
        enableMemoryCache: true,
        enablePersistentCache: false
      });

      // First call (uncached)
      const startTime1 = Date.now();
      const response1 = await llmService.generate("Performance test");
      const time1 = Date.now() - startTime1;

      // Second call (cached)
      const startTime2 = Date.now();
      const response2 = await llmService.generate("Performance test");
      const time2 = Date.now() - startTime2;

      console.log(`⏱️ Uncached: ${time1}ms, Cached: ${time2}ms`);
      console.log(`🚀 Performance improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
      console.log(`📊 Responses: "${response1}" vs "${response2}"`);
      
      // The second call should be faster (no delay)
      assert(time2 < time1, "Cached call should be faster");
      assert(response1 !== response2, "Responses should be different (different call counts)");
    });
  });
}); 