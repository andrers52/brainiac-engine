# Brainiac Engine 🧠

A JavaScript framework for building interactive applications and games with modern web technologies.

[![npm version](https://img.shields.io/npm/v/brainiac-engine.svg)](https://www.npmjs.com/package/brainiac-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/andrers52/brainiac-engine)

## ✨ Features

- ⚡ **Pure JavaScript** - No transpilation time
- 🎨 **2D Graphics Engine** - Comprehensive tools for rendering and visual effects
- 🎮 **Input Management** - Robust user input handling (mouse, keyboard, touch)
- 🌐 **Network Communication** - Built-in Socket.IO integration for multiplayer support
- 🏗️ **Agent System** - Flexible entity management with mixins and behaviors
- 📐 **Geometry Utilities** - Vector math and collision detection
- 🤖 **LLM Integration** - Built-in support for Large Language Models with centralized arslib service
- 🔄 **Modular Architecture** - Clean separation of concerns with arslib integration for shared utilities

## 🎮 Games Built with Brainiac Engine

- **[Z32](https://andrers52.github.io/z32/)** - A space combat game showcasing the engine's capabilities

## 🚀 Quick Start

### Installation

```bash
npm install brainiac-engine
```

### Basic Usage

```javascript
import { BEServer, BEClient } from "brainiac-engine";
import { MyGameServer } from "./MyGameServer.js";

// Server-side (Node.js or browser for single-player)
BEServer.startApp("my-game", new MyGameServer());

// Client-side (browser)
import { myGameClient } from "./myGameClient.js";
BEClient.start(myGameClient);
```

### Simple Example

```javascript
import { Screen } from "brainiac-engine/client/Screen";
import { Vector } from "brainiac-engine/common/geometry/Vector";

// Initialize the screen
const screen = new Screen();
screen.start({
  canvasIdInput: "gameCanvas",
  worldWidth: 800,
  worldHeight: 600,
});

// Create and use geometry
const position = new Vector(100, 200);
const velocity = new Vector(5, -3);
position.add(velocity);
```

## 🧪 Testing

### LLM Testing

The system includes comprehensive LLM testing with both mock and real model support, powered by arslib's centralized LLM service:

```bash
# Fast testing with mock LLM (recommended for CI/CD)
npm run test:llm:mock

# Full testing with real LLM (tests actual model inference)
npm run test:llm:real

# Run both mock and real tests
npm run test:llm:both
```

**Testing Modes:**
- **Mock Mode**: Fast execution (5s timeout), no real model loading, suitable for CI/CD
- **Real Mode**: Slow execution (60s timeout), loads actual models, tests real LLM functionality
- **Both**: Runs both mock and real tests sequentially

**Environment Variables:**
- `TEST_REAL_LLM=true` - Force real LLM testing
- `TEST_REAL_LLM=false` - Force mock LLM testing

**Note**: ONNX runtime warnings are automatically filtered for cleaner test output when using real models. The LLM service is now centralized in arslib for better maintainability and consistency.

### Test Scripts

```bash
# LLM-specific tests
npm run test:llm          # Default (mock mode)
npm run test:llm:mock     # Mock LLM testing
npm run test:llm:real     # Real LLM testing  
npm run test:llm:both     # Both modes

# General testing
npm test                  # All tests
npm run test:watch        # Watch mode
```

## 📖 Documentation

- 📚 **[Complete Manual](docs/MANUAL.md)** - Detailed documentation, configuration, and examples
- 🎯 **[API Reference](docs/MANUAL.md#api-documentation)** - Full API documentation
- 🛠️ **[Development Guide](docs/MANUAL.md#development)** - Setup and contribution guidelines
- ⚙️ **[Configuration](docs/MANUAL.md#configuration)** - Configuration options and setup

## 🤝 Contributing

We welcome contributions! See the [development guide](docs/MANUAL.md#development) for detailed instructions.

## 📄 License

MIT License. See [LICENSE](LICENSE) file for details.

## 🆘 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/andrers52/brainiac-engine/issues)
- 📖 **Documentation**: See [MANUAL.md](docs/MANUAL.md) for detailed guides

---

**Happy coding with Brainiac Engine!** 🚀
