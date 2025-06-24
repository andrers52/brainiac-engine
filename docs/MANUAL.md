# Brainiac Engine Manual 📚

Documentation for the Brainiac Engine - a JavaScript framework for building interactive applications and games.

## Table of Contents

- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [User Events System](user_events.md) - Complete guide to input handling
- [Configuration](#configuration)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Examples](#examples)
- [Testing](#testing)

## 📁 Project Structure

```
brainiac-engine/
├── client/          # Client-side modules
│   ├── image/       # Image processing and effects
│   └── ...
├── server/          # Server-side modules
│   ├── agent/       # Entity system
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

| Parameter                     | Type                          | Default | Description                                   |
| ----------------------------- | ----------------------------- | ------- | --------------------------------------------- |
| `buildType`                   | `"dev" \| "deploy" \| "test"` | `"dev"` | Build environment type                        |
| `playProceduralSoundInClient` | `boolean`                     | `false` | Enable procedural audio                       |
| `userAlwaysAtCenterOfCamera`  | `boolean`                     | `true`  | Camera follows user vs independent            |
| `localApp`                    | `boolean`                     | `true`  | `true` = single-player, `false` = multiplayer |

## 🌐 Express App Integration

### Overview

Brainiac Engine provides direct access to the underlying Express application, enabling developers to add custom routes, middleware, and API endpoints to their games and applications. This feature is particularly useful for:

- **Single Page Applications (SPAs)** - Client-side routing fallbacks
- **REST APIs** - Game state, user management, leaderboards
- **Authentication** - Login systems, session management
- **File Upload** - Avatar images, level data, save files
- **Real-time Features** - Combined with Socket.IO for comprehensive web apps

### Accessing the Express App

The Express app is created and owned by BEServer, and can be accessed after the server starts:

```javascript
import { BEServer } from "brainiac-engine";
import { MyGameServer } from "./MyGameServer.js";

const beServer = new BEServer();

// Start the server first
await beServer.start();

// Access the Express app
const app = beServer.getExpressApp();

if (app) {
  // Add custom routes
  app.get("/api/status", (req, res) => {
    res.json({
      status: "running",
      players: beServer.getConnector().getUserIds().length,
    });
  });
}

// Start your game
beServer.startApp("my-game", new MyGameServer(beServer));
```

### Common Use Cases

#### SPA Fallback Routes

For single-page applications with client-side routing:

```javascript
import path from "path";

const app = beServer.getExpressApp();

// Serve your SPA for specific routes
const spaRoutes = ["/dashboard", "/game", "/leaderboard"];
spaRoutes.forEach((route) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(process.cwd(), "index.html"));
  });
});
```

#### REST API Endpoints

Add game-specific APIs:

```javascript
const app = beServer.getExpressApp();

// Get game statistics
app.get("/api/stats", (req, res) => {
  const users = beServer.getConnector().getUsers();
  res.json({
    activeUsers: users.length,
    gameState: beServer.getEnvironment().getAgents().length,
  });
});

// Player leaderboard
app.get("/api/leaderboard", (req, res) => {
  // Your leaderboard logic here
  res.json({ leaderboard: getTopPlayers() });
});
```

#### Custom Middleware

Add authentication, logging, or other middleware:

```javascript
import session from "express-session";
import morgan from "morgan";

const app = beServer.getExpressApp();

// Logging middleware
app.use(morgan("combined"));

// Session management
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  }),
);

// Authentication middleware
app.use("/api/protected", (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ error: "Authentication required" });
  }
});
```

#### File Upload for Game Assets

Handle file uploads for user-generated content:

```javascript
import multer from "multer";

const app = beServer.getExpressApp();
const upload = multer({ dest: "uploads/" });

app.post("/api/upload/avatar", upload.single("avatar"), (req, res) => {
  // Process avatar upload
  const userId = req.session.userId;
  const avatarPath = req.file.path;

  // Update user avatar in your game logic
  updateUserAvatar(userId, avatarPath);

  res.json({ success: true, avatarUrl: `/uploads/${req.file.filename}` });
});
```

### Architecture Notes

#### Express App Lifecycle

1. **BEServer.start()** creates the Express app with basic configuration
2. **Default middleware** includes CORS and static file serving
3. **Your custom routes** can be added after server start
4. **Connector.start()** uses the Express app for HTTP server creation

#### Integration with Socket.IO

The Express app and Socket.IO server share the same HTTP server:

```javascript
// Both work together seamlessly
app.get("/api/notify", (req, res) => {
  // HTTP endpoint triggers WebSocket message
  beServer.getConnector().messageToGameClient("notification", {
    message: req.query.message,
  });
  res.json({ sent: true });
});
```

#### Error Handling

Always check if the Express app is available:

```javascript
const app = beServer.getExpressApp();

if (!app) {
  console.error(
    "Express app not available. Ensure BEServer.start() was called.",
  );
  return;
}

// Safe to use app here
app.get("/my-route", handler);
```

### Best Practices

1. **Start Server First**: Always call `beServer.start()` before accessing the Express app
2. **Route Organization**: Group related routes using Express routers
3. **Error Handling**: Implement proper error middleware
4. **Security**: Use appropriate middleware for authentication and validation
5. **Testing**: Test custom routes separately from game logic

### Example: Complete Web Game Setup

```javascript
import { BEServer } from "brainiac-engine";
import express from "express";
import { GameServer } from "./GameServer.js";

const beServer = new BEServer();

async function setupWebGame() {
  // Start BEServer first
  await beServer.start();

  // Get Express app
  const app = beServer.getExpressApp();

  // Add JSON parsing middleware
  app.use(express.json());

  // API routes
  app.get("/api/game-info", (req, res) => {
    res.json({
      name: "My Web Game",
      players: beServer.getConnector().getUserIds().length,
      version: "1.0.0",
    });
  });

  // SPA fallback
  app.get(["/", "/game", "/lobby"], (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
  });

  // Start the game
  beServer.startApp("web-game", new GameServer(beServer));

  console.log("🎮 Web game ready at http://localhost:4000");
}

setupWebGame().catch(console.error);
```

This Express integration makes Brainiac Engine suitable for modern web application development while maintaining its core gaming capabilities.

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
