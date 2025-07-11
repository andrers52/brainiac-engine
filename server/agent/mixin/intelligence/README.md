# Intelligence Mixin

The Intelligence mixin adds LLM-powered decision making capabilities to Brainiac Engine agents. It enables agents to make intelligent decisions based on their internal state, perceptions, and available actions.

## 🏗️ Architecture

The Intelligence system consists of:

- **LLMService**: System-wide service that handles model loading, caching, and generation
- **Intelligence Mixin**: Agent-level mixin that provides decision-making capabilities
- **BEServer Integration**: Centralized LLM service management
- **FileStore Integration**: Persistent caching using arslib's [Browser|Node]FileStore storage

## 🚀 Quick Start

### 1. Initialize LLM Service

```javascript
import { BEServer } from "../../server/BEServer.js";
import { createTestLLM } from "../../server/LLMService.js";

const beServer = new BEServer();

// Option 1: Use pre-loaded LLM function
const testLLM = createTestLLM({
  generate: async (prompt) => "LLM response"
});

await beServer.initializeLLMService({
  llmFunction: testLLM,
  modelName: "test-model"
});

// Option 2: Load model from path (requires specific LLM service)
await beServer.initializeLLMService({
  modelPath: "Xenova/gpt2",
  modelName: "GPT-2",
  maxTokens: 100,
  temperature: 0.7
});
```

### 2. Create Intelligent Agent

```javascript
import { Intelligence } from "./Intelligence.js";

const intelligentAgent = {
  position: { x: 100, y: 100 },
  direction: { x: 1, y: 0 },
  health: 100,
  energy: 50,
  
  // Add Intelligence mixin
  ...Intelligence.create(beServer.getLLMService())
};

// Agent can now make intelligent decisions
const decision = await intelligentAgent.makeIntelligentDecision(perception);
```

## 🔧 LLMService Loading & Caching

The LLMService provides sophisticated **dual-layer caching** using both in-memory and persistent storage:

### Caching Architecture

```javascript
// Two-tier caching system
const llmService = beServer.getLLMService();

// 1. In-Memory Cache (fast access)
// 2. Persistent Cache (FileStore/IndexedDB)
```

### Model Loading Strategies

#### 1. Pre-loaded Function
```javascript
// Load model externally and pass function
const pipeline = await loadModel();
const llmFunction = createTransformersLLM(pipeline);

await beServer.initializeLLMService({
  llmFunction: llmFunction,
  modelName: "Xenova/gpt2"
});
```

#### 2. Automatic Loading with Caching
```javascript
// Let LLMService handle loading with persistent caching
await beServer.initializeLLMService({
  modelPath: "Xenova/gpt2",
  modelName: "GPT-2",
  cacheKey: "gpt2-cache",
  enablePersistentCache: true,  // Use FileStore
  enableMemoryCache: true        // Use in-memory cache
});
```

### FileStore Integration

The LLMService uses **arslib's FileStore** for persistent caching:

```javascript
import { Platform, BrowserFileStore, NodeFileStore } from "arslib";

// Use appropriate FileStore based on environment
const FileStore = Platform.isNode() ? NodeFileStore : BrowserFileStore;

if (FileStore.isAvailable()) {
  console.log("💾 Persistent storage available");
}
```

#### Cache Operations

```javascript
const llmService = beServer.getLLMService();

// Check cache stats
console.log(llmService.getCacheStats());
// {
//   memoryCache: { size: 1, keys: ["Xenova/gpt2"] },
//   persistentStorage: { available: true, enabled: true },
//   memoryCacheEnabled: true
// }

// Clear specific caches
llmService.clearMemoryCache();           // Clear in-memory cache
await llmService.clearPersistentCache(); // Clear persistent cache
await llmService.clearAllCaches();       // Clear both caches

// Check persistent storage availability
console.log("Persistent storage:", llmService.isPersistentStorageAvailable());
```

### Loading Process

The LLMService follows this loading hierarchy:

1. **Check In-Memory Cache** (fastest)
2. **Check Persistent Cache** (FileStore/IndexedDB)
3. **Load from Source** (slowest)
4. **Cache in Both Layers** (for future use)

```javascript
async loadModel(modelPath, options = {}) {
  const { forceReload = false, skipPersistent = false } = options;
  const cacheKey = this._generateCacheKey(modelPath, this.config.cacheKey);
  
  // 1. Check in-memory cache first
  if (!forceReload && this.config.enableMemoryCache && this.modelCache.has(cacheKey)) {
    console.log(`📦 Using in-memory cached model: ${modelPath}`);
    return this.modelCache.get(cacheKey);
  }
  
  // 2. Check persistent cache if enabled
  if (!forceReload && !skipPersistent && this.config.enablePersistentCache) {
    console.log(`🔍 Checking persistent cache for: ${modelPath}`);
    const persistentModel = await this._retrieveModelFromPersistent(cacheKey);
    if (persistentModel) {
      // Add to in-memory cache for faster access
      if (this.config.enableMemoryCache) {
        this.modelCache.set(cacheKey, persistentModel);
      }
      return persistentModel;
    }
  }
  
  // 3. Load model from source
  this.model = await this.loadModelFromPath(modelPath);
  
  // 4. Cache in both layers
  if (this.config.enableMemoryCache) {
    this.modelCache.set(cacheKey, this.model);
  }
  if (this.config.enablePersistentCache) {
    await this._storeModelPersistently(cacheKey, this.model);
  }
  
  return this.model;
}
```

### Loading States

```javascript
// Check if model is loading
if (llmService.isLoading()) {
  console.log("Model is currently loading...");
}

// Check if service is ready
if (llmService.isInitialized()) {
  console.log("LLM service is ready to use");
}
```

## 🎯 Intelligence Mixin Features

### State Gathering
The mixin automatically gathers agent state:
- Position and direction
- Health and energy levels
- Custom properties

### Action Discovery
Discovers available actions from:
- Agent's own methods
- Mixin methods (using JSDoc)
- Custom action definitions

### Decision Making
```javascript
const perception = {
  nearbyObjects: ["tree", "rock"],
  distance: 50,
  direction: "north"
};

const decision = await agent.makeIntelligentDecision(perception);
// Returns: { action: "moveUp", parameters: [2], reasoning: "..." }
```

### Message Processing
```javascript
const response = await agent.processMessage("Hello, agent!");
// Returns: { action: "say", parameters: ["Hello back!"], reasoning: "..." }
```

## 🔌 LLM Service Types

### TransformersLLMService
For transformers.js models:

```javascript
import { TransformersLLMService } from "../../server/LLMService.js";

const transformersService = new TransformersLLMService();
await transformersService.initialize({
  modelPath: "Xenova/gpt2",
  modelName: "GPT-2"
});
```

### Custom LLM Service
Extend LLMService for custom backends:

```javascript
class CustomLLMService extends LLMService {
  async loadModelFromPath(modelPath) {
    // Custom loading logic
    return await loadCustomModel(modelPath);
  }
  
  createLLMFunction(model) {
    return async (prompt, options) => {
      // Custom generation logic
      return await model.generate(prompt, options);
    };
  }
}
```

## 📊 Configuration

### LLM Service Configuration
```javascript
await beServer.initializeLLMService({
  // Model options
  modelPath: "Xenova/gpt2",
  modelName: "GPT-2",
  cacheKey: "custom-cache-key",
  
  // Generation options
  maxTokens: 150,
  temperature: 0.7,
  
  // Caching options
  enablePersistentCache: true,  // Use FileStore
  enableMemoryCache: true,      // Use in-memory cache
  
  // Pre-loaded function (alternative to modelPath)
  llmFunction: customLLM
});
```

### Intelligence Mixin Configuration
```javascript
const intelligenceConfig = {
  // Custom state properties to include
  stateProperties: ["health", "energy", "inventory"],
  
  // Custom action discovery
  actionDiscovery: {
    includeMethods: ["customAction"],
    excludeMethods: ["privateMethod"]
  },
  
  // Custom prompt templates
  promptTemplate: "Custom prompt: {state} {perception} {actions}"
};

const agent = {
  ...Intelligence.create(llmService, intelligenceConfig)
};
```

## 🧪 Testing

### Test LLM Service
```javascript
import { createTestLLM } from "../../server/LLMService.js";

const testLLM = createTestLLM({
  generate: async (prompt) => {
    // Return structured responses for testing
    return JSON.stringify({
      action: "moveUp",
      parameters: [1],
      reasoning: "Test response"
    });
  }
});
```

### Test Intelligence Mixin
```javascript
// Mock LLM service for testing
const mockLLMService = {
  generate: jest.fn().mockResolvedValue("Test response"),
  isInitialized: () => true
};

const agent = {
  ...Intelligence.create(mockLLMService)
};
```

## 📝 Examples

### Basic Intelligent Agent
```javascript
const agent = {
  position: { x: 0, y: 0 },
  direction: { x: 1, y: 0 },
  health: 100,
  
  // Add Intelligence mixin
  ...Intelligence.create(llmService),
  
  // Custom actions
  moveUp(distance) {
    this.position.y -= distance;
  },
  
  moveRight(distance) {
    this.position.x += distance;
  }
};

// Agent makes decisions
const decision = await agent.makeIntelligentDecision({
  nearbyObjects: ["enemy"],
  distance: 10
});
```

### Multiple Agents with Shared Caching
```javascript
// All agents share the same LLM service with caching
const agents = [
  { id: "agent1", ...Intelligence.create(llmService) },
  { id: "agent2", ...Intelligence.create(llmService) },
  { id: "agent3", ...Intelligence.create(llmService) }
];

// Each agent can make independent decisions
for (const agent of agents) {
  const decision = await agent.makeIntelligentDecision(perception);
  console.log(`${agent.id}: ${decision.action}`);
}
```

### Persistent Caching Demo
```javascript
// Initialize with persistent caching
await beServer.initializeLLMService({
  modelPath: "Xenova/gpt2",
  modelName: "GPT-2",
  enablePersistentCache: true,
  enableMemoryCache: true,
  cacheKey: "gpt2-persistent-cache"
});

const llmService = beServer.getLLMService();

// Check cache status
console.log("Cache stats:", llmService.getCacheStats());
console.log("Persistent storage:", llmService.isPersistentStorageAvailable());

// Load model (will be cached)
await llmService.loadModel("Xenova/gpt2");

// Reload (will use cache)
await llmService.loadModel("Xenova/gpt2"); // Fast from cache
```

## 🔍 Troubleshooting

### Model Loading Issues
```javascript
// Check if model is loading
if (llmService.isLoading()) {
  console.log("Wait for model to finish loading");
}

// Check cache status
console.log("Cache stats:", llmService.getCacheStats());

// Force reload (bypass cache)
await llmService.loadModel("model-path", { forceReload: true });

// Skip persistent cache check
await llmService.loadModel("model-path", { skipPersistent: true });
```

### Persistent Storage Issues
```javascript
// Check persistent storage availability
if (!llmService.isPersistentStorageAvailable()) {
  console.warn("Persistent storage not available");
}

// Disable persistent caching if needed
await beServer.initializeLLMService({
  modelPath: "Xenova/gpt2",
  enablePersistentCache: false,  // Disable persistent cache
  enableMemoryCache: true        // Keep memory cache
});
```

### Decision Making Issues
```javascript
// Check if LLM service is initialized
if (!llmService.isInitialized()) {
  console.error("LLM service not initialized");
}

// Check agent state
console.log("Agent state:", agent.getState());

// Check available actions
console.log("Available actions:", agent.getAvailableActions());
```

## 🚀 Performance Tips

1. **Use Dual Caching**: Enable both memory and persistent cache for optimal performance
2. **Shared Service**: Multiple agents can share the same LLM service
3. **Async Loading**: Models load asynchronously without blocking
4. **Error Handling**: Graceful fallbacks for LLM errors
5. **Configuration**: Tune parameters for your use case
6. **Cache Management**: Clear caches when needed to free memory

## 📚 API Reference

### LLMService Methods
- `initialize(config)`: Initialize the service
- `loadModel(path, options)`: Load a model with caching
- `generate(prompt)`: Generate response
- `isInitialized()`: Check if ready
- `isLoading()`: Check if loading
- `clearMemoryCache()`: Clear in-memory cache
- `clearPersistentCache()`: Clear persistent cache
- `clearAllCaches()`: Clear all caches
- `getCacheStats()`: Get cache statistics
- `isPersistentStorageAvailable()`: Check persistent storage

### Intelligence Mixin Methods
- `makeIntelligentDecision(perception)`: Make decision
- `processMessage(message)`: Process message
- `getState()`: Get current state
- `getAvailableActions()`: Get available actions
- `executeAction(action, parameters)`: Execute action

## 🤝 Contributing

When adding new LLM backends:

1. Extend `LLMService` class
2. Implement `loadModelFromPath()` method
3. Implement `createLLMFunction()` method
4. Add tests for the new service
5. Update documentation

## 📄 License

This module is part of the Brainiac Engine project. 