# Brainiac Engine Manual 📚

Documentation for the Brainiac Engine - a JavaScript framework for building interactive applications and games.

## Table of Contents

- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [Configuration](#configuration)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Examples](#examples)
- [Testing](#testing)

## 📁 Project Structure

```
brainiac-engine/
├── client/          # Client-side modules
│   ├── singleton/   # Screen, etc.
│   ├── image/       # Image processing and effects
│   └── ...
├── server/          # Server-side modules
│   ├── agent/       # Entity system
│   ├── singleton/   # Server management
│   └── ...
├── common/          # Shared utilities
│   ├── geometry/    # Vector, Rectangle, etc.
│   └── ...
└── examples/        # Usage examples
```

## 🎮 Core Concepts

### Agent System

The engine uses an agent-based architecture where game entities inherit from the base `Agent` class:

```javascript
import { Agent } from "brainiac-engine/server/agent/Agent";

class MyGameObject extends Agent {
  constructor(data) {
    super(data);
    this.velocity = new Vector(0, 0);
  }

  step() {
    super.step();
    this.position.add(this.velocity);
  }
}
```

### Mixins

Extend agent functionality with mixins:

```javascript
import { HasEnergy } from "brainiac-engine/server/agent/mixin/HasEnergy";
import { Turnable } from "brainiac-engine/server/agent/mixin/Turnable";

class EnergyShip extends Agent {
  constructor(data) {
    super(data);
    HasEnergy.call(this, data);
    Turnable.call(this, data);
  }
}
```

### Event System

Handle user input and game events:

```javascript
import { UserEvents } from "brainiac-engine/client/UserEvents";

UserEvents.onMouseClick((mouseData) => {
  console.log("Click at:", mouseData.worldPosition);
});
```

## ⚙️ Configuration

### Configuration Methods

#### Option A: Config File (Node.js)

Create `config/config.json` in your project root:

```json
{
  "buildType": "dev",
  "playProceduralSoundInClient": true,
  "userAlwaysAtCenterOfCamera": true,
  "localApp": false
}
```

```javascript
// Config loaded automatically
BEServer.startApp("my-game", new MyGameServer());
```

#### Option B: Config Object (Browser/Node.js)

```javascript
const config = {
  buildType: "dev",
  playProceduralSoundInClient: true,
  userAlwaysAtCenterOfCamera: true,
  localApp: true,
};

BEServer.startApp("my-game", new MyGameServer(), config);
```

### Configuration Parameters

| Parameter                     | Type                          | Default | Description                                      |
| ----------------------------- | ----------------------------- | ------- | ------------------------------------------------ |
| `buildType`                   | `"dev" \| "deploy" \| "test"` | `"dev"` | Build environment type                           |
| `playProceduralSoundInClient` | `boolean`                     | `false` | Enable procedural audio                          |
| `userAlwaysAtCenterOfCamera`  | `boolean`                     | `true`  | Camera follows user vs independent               |
| `localApp`                    | `boolean`                     | `true`  | Single-player (browser) vs multiplayer (Node.js) |

## 🛠️ Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/andrers52/brainiac-engine.git
cd brainiac-engine

# Quick setup (installs dependencies)
npm run setup

# Or manual installation
npm install
```

### Available Scripts

| Script          | Description                            |
| --------------- | -------------------------------------- |
| `npm run setup` | Complete development environment setup |
| `npm test`      | Run unit tests                         |
| `npm run build` | Build the library                      |
| `npm run docs`  | Generate API documentation             |

### Testing

```bash
# Run all tests
npm test

# Run specific test files
npm test -- --grep "Vector"
```

### Project Setup Verification

After installation, verify everything works:

```bash
npm test
# All tests should pass ✅
```

## 📖 API Documentation

### Core Modules

#### Client-side

- **Screen** - Canvas management and rendering
- **BEClient** - Client application lifecycle
- **UserEvents** - Input handling (mouse, keyboard, touch)
- **ResourceStore** - Asset loading and management

#### Server-side

- **BEServer** - Server application lifecycle
- **Environment** - Game world management
- **Agent** - Base entity class
- **Connector** - Network communication

#### Common

- **Vector** - 2D vector mathematics
- **Rectangle** - Rectangle geometry and collision
- **BECommonDefinitions** - Shared constants

### Examples

Check the `examples/` directory for complete usage examples:

- Basic setup
- Agent creation
- Input handling
- Multiplayer setup

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and add tests
4. **Run tests** (`npm test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: Full API docs available in code comments
- 🐛 **Issues**: [GitHub Issues](https://github.com/andrers52/brainiac-engine/issues)
- � **Questions**: Use GitHub Issues for questions and feature requests

---

**For basic getting started guide, see [README.md](README.md)**
