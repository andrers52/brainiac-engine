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
