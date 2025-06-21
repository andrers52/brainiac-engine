# Brainiac Engine Interactive Demo

This demo showcases the interactive features and capabilities of the Brainiac Engine through various demonstrations of visual effects, agent behaviors, UI widgets, and more.

## What's Included

The demo features six different interactive demonstrations:

- **Visual Effects** - Pulsate, Spin, and Fade mixins in action
- **Collision & Sensing** - Agent collision detection and world boundary sensing
- **UI Widgets** - Interactive buttons, labels, and basic widgets
- **Draggable Objects** - Click and drag functionality for game objects
- **Layout Containers** - Horizontal and vertical layout management
- **Grid Movement** - Raster-based movement constrained to grid positions

## Project Structure

```
demo/
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── css/
│   └── style.css      # Styling for the demo interface
├── js/
│   ├── main.js        # Main initialization
│   ├── server.js      # Server-side logic
│   ├── client.js      # Client-side logic
│   └── demos/         # Individual demo implementations
│       ├── mixins.js
│       ├── sensing.js
│       ├── widgets.js
│       ├── draggable.js
│       ├── containers.js
│       └── raster.js
└── media/
    └── images/        # Demo assets (sprites, images)
```

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## How to Run

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

   This will:

   - Change to the brainiac-engine project root directory
   - Start http-server on port 8080 serving from the project root
   - Automatically open the demo at `/demo/index.html`

   **Note:** The server starts from the brainiac-engine project root (parent directory) to allow direct access to the engine source code without requiring symbolic links.

3. **Alternative manual start:**

   From the brainiac-engine root directory:

   ```bash
   npx http-server -p 8080 --symlinks -o /demo/index.html
   ```

## Using the Demo

Once the demo is running:

1. **Select Demos** - Use the control panel on the right to switch between different demonstrations
2. **Interact** - Click, drag, and observe the various interactive features
3. **Monitor Info** - Check the info panel at the bottom-left for descriptions of what each demo demonstrates

## Technologies Used

- **Brainiac Engine** - Game engine providing the core functionality (accessed directly from source)
- **arslib** - Utility library for additional features (accessed via brainiac-engine's node_modules)
- **ES Modules** - Modern JavaScript module system with import maps
- **http-server** - Simple HTTP server for development

## Development

The demo is organized with modern JavaScript practices:

- **Modular Structure** - Each demo is in its own file
- **ES6 Imports/Exports** - Clean dependency management
- **Separation of Concerns** - Server, client, and demo logic are separated
- **Reusable Components** - Demo functions can be used independently

## Features Demonstrated

### Engine Capabilities

- Agent creation and management
- Visual effects and animations
- Collision detection and sensing
- UI widget system
- Drag and drop functionality
- Layout containers
- Grid-based movement

### Code Organization

- Modular demo implementations
- Clean separation between client and server logic
- Modern JavaScript ES modules
- Reusable and maintainable code structure

## Troubleshooting

- **Port already in use**: Change the port in the dev script: `-p 8081`
- **Module not found**: Ensure you're in the correct directory and dependencies are installed
- **Import errors**: Verify that the brainiac-engine project has arslib available in its node_modules

## Learn More

This demo serves as both a showcase and a learning resource for the Brainiac Engine. Explore the source code to understand how to implement similar features in your own projects.
