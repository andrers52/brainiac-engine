"use strict";

import { Assert, Platform, BrowserFileStore, NodeFileStore } from "arslib";

// Use appropriate FileStore based on environment
const FileStore = Platform.isNode() ? NodeFileStore : BrowserFileStore;

/**
 * @fileoverview System-wide LLM service for the Brainiac Engine.
 * Provides a centralized LLM service that can be used by all intelligent agents.
 * Handles model loading, caching (both in-memory and persistent), and provides a unified interface for all agents.
 * 
 * @module LLMService
 */

/**
 * System-wide LLM service function constructor.
 * Manages LLM initialization, loading, caching (in-memory and persistent), configuration, and provides a unified interface for all agents.
 * 
 * @constructor
 */
function LLMService() {
  /** @type {Function|null} The LLM function for generating responses */
  this.llm = null;
  /** @type {Object|null} The loaded model instance */
  this.model = null;
  /** @type {boolean} Whether the service is initialized */
  this.initialized = false;
  /** @type {boolean} Whether model is currently loading */
  this.loading = false;
  /** @type {Object} Service configuration */
  this.config = {
    maxTokens: 100,
    temperature: 0.7,
    modelName: null,
    modelPath: null,
    cacheKey: null,
    enablePersistentCache: true,
    enableMemoryCache: true
  };
  /** @type {Map<string, Object>} In-memory model cache */
  this.modelCache = new Map();
  /** @type {boolean} Whether persistent storage is available */
  this.persistentStorageAvailable = false;
  
  // Check if persistent storage is available
  this._checkPersistentStorage = function() {
    try {
      this.persistentStorageAvailable = FileStore.isAvailable();
      console.log(`💾 Persistent storage available: ${this.persistentStorageAvailable}`);
    } catch (error) {
      console.warn("⚠️ Persistent storage not available:", error.message);
      this.persistentStorageAvailable = false;
    }
  };

  // Initialize persistent storage check
  this._checkPersistentStorage();

  /**
   * Generates a cache key for model storage.
   * @memberof LLMService
   * @param {string} modelPath - Path to the model
   * @param {string} [customKey] - Custom cache key
   * @returns {string} Generated cache key
   * @private
   */
  this._generateCacheKey = function(modelPath, customKey = null) {
    if (customKey) return customKey;
    return `llm-model-${modelPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
  };

  /**
   * Serializes a model for persistent storage.
   * @memberof LLMService
   * @param {Object} model - Model to serialize
   * @returns {Blob|null} Serialized model blob or null if failed
   * @private
   */
  this._serializeModel = function(model) {
    try {
      const serialized = JSON.stringify(model);
      return new Blob([serialized], { type: 'application/json' });
    } catch (error) {
      console.warn("⚠️ Could not serialize model for persistent storage:", error.message);
      return null;
    }
  };

  /**
   * Deserializes a model from persistent storage.
   * @memberof LLMService
   * @param {Blob} blob - Model blob to deserialize
   * @returns {Promise<Object|null>} Deserialized model or null if failed
   * @private
   */
  this._deserializeModel = function(blob) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const model = JSON.parse(reader.result);
            resolve(model);
          } catch (error) {
            reject(new Error("Failed to deserialize model"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read model blob"));
        reader.readAsText(blob);
      });
    } catch (error) {
      console.warn("⚠️ Could not deserialize model from persistent storage:", error.message);
      return Promise.resolve(null);
    }
  };

  /**
   * Stores a model in persistent storage.
   * @memberof LLMService
   * @param {string} cacheKey - Cache key for the model
   * @param {Object} model - Model to store
   * @returns {Promise<void>}
   * @private
   */
  this._storeModelPersistently = async function(cacheKey, model) {
    if (!this.persistentStorageAvailable || !this.config.enablePersistentCache) {
      return;
    }
    try {
      const blob = this._serializeModel(model);
      if (!blob) return;
      return new Promise((resolve, reject) => {
        FileStore.putFile(
          cacheKey,
          blob,
          () => {
            console.log(`💾 Model cached persistently: ${cacheKey}`);
            resolve();
          },
          (error) => {
            console.warn("⚠️ Failed to cache model persistently:", error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.warn("⚠️ Error storing model persistently:", error.message);
    }
  };

  /**
   * Retrieves a model from persistent storage.
   * @memberof LLMService
   * @param {string} cacheKey - Cache key for the model
   * @returns {Promise<Object|null>} Retrieved model or null if not found
   * @private
   */
  this._retrieveModelFromPersistent = async function(cacheKey) {
    if (!this.persistentStorageAvailable || !this.config.enablePersistentCache) {
      return null;
    }
    try {
      return new Promise((resolve, reject) => {
        FileStore.getFile(
          cacheKey,
          (blob) => {
            if (blob) {
              this._deserializeModel(blob)
                .then(model => {
                  console.log(`📦 Retrieved model from persistent cache: ${cacheKey}`);
                  resolve(model);
                })
                .catch(error => {
                  console.warn("⚠️ Failed to deserialize model from persistent cache:", error.message);
                  resolve(null);
                });
            } else {
              resolve(null);
            }
          },
          (error) => {
            console.warn("⚠️ Failed to retrieve model from persistent cache:", error);
            resolve(null);
          }
        );
      });
    } catch (error) {
      console.warn("⚠️ Error retrieving model from persistent storage:", error.message);
      return null;
    }
  };

  /**
   * Initializes the LLM service with configuration.
   * @memberof LLMService
   * @param {Object} config - Configuration object
   * @param {Function} [config.llmFunction] - LLM function to use
   * @param {string} [config.modelPath] - Path to model to load
   */
  this.initialize = async function(config) {
    Assert.assert(config.llmFunction || config.modelPath, "LLMService requires either llmFunction or modelPath");
    this.config = {
      ...this.config,
      ...config
    };
    if (config.llmFunction) {
      this.llm = config.llmFunction;
      this.initialized = true;
      
      // Cache the LLM function if memory caching is enabled
      if (this.config.enableMemoryCache && this.config.modelName) {
        const cacheKey = this._generateCacheKey(this.config.modelName, this.config.cacheKey);
        this.modelCache.set(cacheKey, { llmFunction: config.llmFunction, modelName: this.config.modelName });
        console.log(`📦 Cached LLM function: ${cacheKey}`);
      }
    } else if (config.modelPath) {
      await this.loadModel(config.modelPath);
    }
    console.log(`🤖 LLM Service initialized with model: ${this.config.modelName || 'Unknown'}`);
    console.log(`💾 Caching: Memory=${this.config.enableMemoryCache}, Persistent=${this.config.enablePersistentCache}`);
  };

  /**
   * Loads a model from the specified path with caching.
   * @memberof LLMService
   * @param {string} modelPath - Path to the model
   * @param {Object} [options] - Loading options
   * @param {boolean} [options.forceReload=false] - Force reload even if cached
   * @param {boolean} [options.skipPersistent=false] - Skip persistent cache check
   * @returns {Promise<Object>} Loaded model
   */
  this.loadModel = async function(modelPath, options = {}) {
    const { forceReload = false, skipPersistent = false } = options;
    const cacheKey = this._generateCacheKey(modelPath, this.config.cacheKey);
    if (!forceReload && this.config.enableMemoryCache && this.modelCache.has(cacheKey)) {
      console.log(`📦 Using in-memory cached model: ${modelPath}`);
      this.model = this.modelCache.get(cacheKey);
      this.llm = this.createLLMFunction(this.model);
      this.initialized = true;
      return this.model;
    }
    if (!forceReload && !skipPersistent && this.config.enablePersistentCache) {
      console.log(`🔍 Checking persistent cache for: ${modelPath}`);
      const persistentModel = await this._retrieveModelFromPersistent(cacheKey);
      if (persistentModel) {
        this.model = persistentModel;
        this.llm = this.createLLMFunction(this.model);
        this.initialized = true;
        if (this.config.enableMemoryCache) {
          this.modelCache.set(cacheKey, this.model);
        }
        return this.model;
      }
    }
    if (this.loading) {
      throw new Error("Model is already loading");
    }
    this.loading = true;
    console.log(`🔄 Loading model: ${modelPath}`);
    try {
      this.model = await this.loadModelFromPath(modelPath);
      if (this.config.enableMemoryCache) {
        this.modelCache.set(cacheKey, this.model);
      }
      if (this.config.enablePersistentCache) {
        await this._storeModelPersistently(cacheKey, this.model);
      }
      this.llm = this.createLLMFunction(this.model);
      this.initialized = true;
      this.loading = false;
      console.log(`✅ Model loaded successfully: ${modelPath}`);
      return this.model;
    } catch (error) {
      this.loading = false;
      console.error(`❌ Failed to load model: ${modelPath}`, error);
      throw error;
    }
  };

  /**
   * Loads a model from a specific path (to be implemented by subclasses).
   * @memberof LLMService
   * @param {string} modelPath - Path to the model
   * @returns {Promise<Object>} Loaded model
   */
  this.loadModelFromPath = async function(modelPath) {
    throw new Error(`Model loading not implemented for path: ${modelPath}`);
  };

  /**
   * Creates an LLM function from a loaded model (to be implemented by subclasses).
   * @memberof LLMService
   * @param {Object} model - Loaded model
   * @returns {Function} LLM function
   */
  this.createLLMFunction = function(model) {
    return async (prompt, options = {}) => {
      throw new Error("LLM function creation not implemented");
    };
  };

  /**
   * Generates a response using the loaded LLM.
   * @memberof LLMService
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>} Generated response
   */
  this.generate = async function(prompt) {
    Assert.assert(this.initialized, "LLMService must be initialized before use");
    Assert.assert(this.llm, "LLM function is not available");
    try {
      const response = await this.llm(prompt, {
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stop: ['\n\n', '```']
      });
      return response;
    } catch (error) {
      console.error("LLM generation error:", error);
      return JSON.stringify({
        action: "moveUp",
        parameters: [1],
        reasoning: "Default action due to LLM error"
      });
    }
  };

  /**
   * Checks if the service is initialized.
   * @memberof LLMService
   * @returns {boolean} True if initialized
   */
  this.isInitialized = function() {
    return this.initialized && this.llm !== null;
  };

  /**
   * Checks if a model is currently loading.
   * @memberof LLMService
   * @returns {boolean} True if loading
   */
  this.isLoading = function() {
    return this.loading;
  };

  /**
   * Gets the current configuration.
   * @memberof LLMService
   * @returns {Object} Configuration object
   */
  this.getConfig = function() {
    return { ...this.config };
  };

  /**
   * Updates the configuration.
   * @memberof LLMService
   * @param {Object} newConfig - New configuration values
   */
  this.updateConfig = function(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
  };

  /**
   * Clears the in-memory cache.
   * @memberof LLMService
   */
  this.clearMemoryCache = function() {
    this.modelCache.clear();
    console.log("🗑️ In-memory cache cleared");
  };

  /**
   * Clears the persistent cache.
   * @memberof LLMService
   * @returns {Promise<void>}
   */
  this.clearPersistentCache = async function() {
    if (!this.persistentStorageAvailable) {
      console.warn("⚠️ Persistent storage not available");
      return;
    }
    try {
      // Get all cache keys from memory cache to know what to clear
      const cacheKeys = Array.from(this.modelCache.keys());
      
      // Clear each cached model from persistent storage
      for (const cacheKey of cacheKeys) {
        try {
          await new Promise((resolve, reject) => {
            FileStore.putFile(
              cacheKey,
              null, // Set to null to effectively delete
              () => {
                console.log(`🗑️ Cleared persistent cache for: ${cacheKey}`);
                resolve();
              },
              (error) => {
                console.warn(`⚠️ Failed to clear persistent cache for: ${cacheKey}`, error);
                resolve(); // Continue with other keys even if one fails
              }
            );
          });
        } catch (error) {
          console.warn(`⚠️ Error clearing persistent cache for: ${cacheKey}:`, error.message);
        }
      }
      
      console.log("🗑️ Persistent cache cleared");
    } catch (error) {
      console.warn("⚠️ Error clearing persistent cache:", error.message);
    }
  };

  /**
   * Clears all caches (memory and persistent).
   * @memberof LLMService
   * @returns {Promise<void>}
   */
  this.clearAllCaches = async function() {
    this.clearMemoryCache();
    await this.clearPersistentCache();
  };

  /**
   * Gets cache statistics.
   * @memberof LLMService
   * @returns {Object} Cache statistics
   */
  this.getCacheStats = function() {
    return {
      memoryCache: {
        size: this.modelCache.size,
        keys: Array.from(this.modelCache.keys())
      },
      persistentStorage: {
        available: this.persistentStorageAvailable,
        enabled: this.config.enablePersistentCache
      },
      memoryCacheEnabled: this.config.enableMemoryCache
    };
  };

  /**
   * Checks if persistent storage is available.
   * @memberof LLMService
   * @returns {boolean} True if persistent storage is available
   */
  this.isPersistentStorageAvailable = function() {
    return this.persistentStorageAvailable;
  };
}

/**
 * Transformers.js LLM service function constructor.
 * Extends LLMService with transformers.js specific functionality.
 * @constructor
 */
function TransformersLLMService() {
  // Call parent constructor
  LLMService.call(this);
  
  /** @type {Object|null} Transformers.js pipeline */
  this.pipeline = null;

  /**
   * Loads a model using transformers.js.
   * @memberof TransformersLLMService
   * @param {string} modelPath - Path to the model
   * @returns {Promise<Object>} Loaded pipeline
   */
  this.loadModelFromPath = async function(modelPath) {
    try {
      const { pipeline } = await import('@xenova/transformers');
      console.log(`🔄 Loading transformers.js model: ${modelPath}`);
      this.pipeline = await pipeline('text-generation', modelPath);
      return this.pipeline;
    } catch (error) {
      console.error(`❌ Failed to load transformers.js model: ${modelPath}`, error);
      throw error;
    }
  };

  /**
   * Creates an LLM function from a transformers.js pipeline.
   * @memberof TransformersLLMService
   * @param {Object} pipeline - Transformers.js pipeline
   * @returns {Function} LLM function
   */
  this.createLLMFunction = function(pipeline) {
    return async (prompt, options = {}) => {
      try {
        const result = await pipeline(prompt, {
          max_length: options.max_tokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
          do_sample: true,
          ...options
        });
        return result[0].generated_text;
      } catch (error) {
        console.error("Transformers.js error:", error);
        throw error;
      }
    };
  };
}

// Utility/test functions remain as regular functions
export { LLMService, TransformersLLMService };

/**
 * Creates a transformers.js LLM function (legacy support).
 * @param {Object} pipeline - Transformers.js pipeline instance
 * @returns {Function} LLM function for transformers.js
 */
export function createTransformersLLM(pipeline) {
  return async function(prompt, options = {}) {
    try {
      const result = await pipeline(prompt, {
        max_length: options.max_tokens || 100,
        temperature: options.temperature || 0.7,
        do_sample: true,
        ...options
      });
      
      return result[0].generated_text;
    } catch (error) {
      console.error("Transformers.js error:", error);
      throw error;
    }
  };
}

/**
 * Creates a simple LLM function for testing.
 * @param {Object} config - Configuration for the test LLM
 * @param {Function} config.generate - Function that takes a prompt and returns a response
 * @param {number} [config.maxTokens=100] - Maximum tokens for response
 * @param {number} [config.temperature=0.7] - Temperature for generation
 * @returns {Function} LLM function for testing
 */
export function createTestLLM(config) {
  const { generate, maxTokens = 100, temperature = 0.7 } = config;
  
  return async function(prompt, options = {}) {
    try {
      const response = await generate(prompt, {
        max_tokens: options.max_tokens || maxTokens,
        temperature: options.temperature || temperature,
        stop: options.stop || ['\n\n', '```']
      });
      
      return response;
    } catch (error) {
      console.error("Test LLM generation error:", error);
      throw error;
    }
  };
} 