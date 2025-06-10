# Brainiac Engine (be)

Brainiac Engine is a JavaScript library designed to provide a robust and flexible framework for building interactive applications and games. It leverages modern web technologies and provides utilities for managing graphics, user input, and network communication.

## Features

- Comprehensive set of tools for 2D graphics
- Support for user input handling
- Network communication utilities using Socket.IO
- Easy-to-use API for rapid development
- Full JSDoc documentation for all APIs

## Quick Start

### Option 1: Install via npm (Recommended)

```bash
npm install brainiac-engine
```

### Option 2: Clone from GitHub

```bash
git clone https://github.com/andrers52/brainiac-engine.git
cd brainiac-engine
npm run setup
```

**Note:** The `npm run setup` command will automatically install all dependencies and prepare the development environment.

## Installation & Setup

### For Library Users

If you're using Brainiac Engine as a dependency in your project:

```bash
# Install the package
npm install brainiac-engine

# Dependencies will be installed automatically via npm
```

### For Contributors/Developers

If you're contributing to Brainiac Engine or want to run examples:

```bash
# Clone the repository
git clone https://github.com/andrers52/brainiac-engine.git
cd brainiac-engine

# Quick setup (recommended)
npm run setup

# Or manual setup
npm install
```

### Verification

After installation, verify everything is working:

```bash
npm test
```

## Usage

Import the necessary modules and start building your application:

```javascript
import { Screen } from "brainiac-engine/client/singleton/Screen";
import { Vector } from "brainiac-engine/common/geometry/Vector";
const screen = new Screen();
screen.start({
  canvasIdInput: "gameCanvas",
  worldWidth: 800,
  worldHeight: 600,
  // Other initialization parameters...
});
const position = new Vector(100, 200);
console.log(position);
```

## Development

To set up the development environment, clone the repository and install dependencies:

```bash
git clone https://github.com/andrers52/brainiac-engine.git
cd brainiac-engine
npm install
```

## Running Unit Tests

To run tests, use the following command:

```bash
npm test
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or feature requests.

## Development instructions

### CONFIG

#### Config can be set two ways

a - config file
If you do BEServer.startApp without the third parameter, the configuration, in node (multiplayer), the system will
look for a file at <project_root>/config/config.json
b - config object
If you provide the third parameter to BEServer.startApp the configuration will be read from there. This can
be done in node (multiplayer) or the browser (singleplayer)

#### Config parameters

buildType : ["dev"|"deploy"|"test"],
playProceduralSoundInClient : [true | false],
userAlwaysAtCenterOfCamera : [true | false],
true: camera follows user, false, camera is independent
localApp: [true: false]
true (default) means server and client on the browser, false means server in node and client in the browser
