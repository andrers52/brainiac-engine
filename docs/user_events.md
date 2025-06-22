# User Events System Documentation

This document explains how user input events (mouse, keyboard, touch) flow through the Brainiac Engine from client to server.

## Overview

The Brainiac Engine processes user events through a multi-stage pipeline:

1. **Browser Events** → Raw DOM events (mousedown, mousemove, keydown, etc.)
2. **UserEvents (Client)** → Conversion to engine-specific events with world coordinates
3. **Environment (Server)** → Event propagation to relevant agents with hit detection
4. **Agent Handlers** → Individual agent responses to events

## Improved Event System Features

The Brainiac Engine now supports an improved event system with:

### 1. Universal Event Broadcasting with Viewport Filtering

All mouse events are broadcast to agents visible in the relevant client's viewport/camera view rather than just spatially nearby agents. This is especially important for multiplayer scenarios where different players may have different camera views.

### 2. Event Subscription System

Agents can register to receive specific events they need:

```javascript
// Register agent to receive specific events
environment.subscribeAgentToEvents(agent, ["onMouseDown", "onKeyDown"]);

// Unregister when no longer needed
environment.unsubscribeAgentFromEvents(agent, ["onMouseDown"]);
```

### 3. State-Based Event Routing

The system tracks agents in interactive states (e.g., being dragged, pressed) to ensure they always receive relevant events regardless of spatial position:

```javascript
// Mark agent as interactive (e.g., when dragging starts)
environment.setAgentInteractive(agent);

// Mark agent as non-interactive (e.g., when dragging ends)
environment.setAgentNonInteractive(agent);
```

### 4. Client-to-Agent Mapping for Multiplayer

The system tracks which agents belong to which clients for proper viewport filtering:

```javascript
// Associate an agent with a specific client
environment.setAgentClient(agent, clientCamera);
```

### 5. Viewport-Based Event Filtering

Events are filtered based on what's visible to the client that generated the event:

```javascript
// Get agents visible to a specific client's camera
const visibleAgents = environment.getAgentsVisibleToClient(clientCamera);
```

## Event Flow Diagram

```
Browser DOM Events
        ↓
    UserEvents.js (Client)
    ┌─────────────────────┐
    │ • Capture DOM events│
    │ • Convert to world  │
    │   coordinates       │
    │ • Throttle mouse    │
    │   move events       │
    └─────────────────────┘
        ↓
    Environment.js (Server)
    ┌─────────────────────┐
    │ • Find target agents│
    │ • Hit detection     │
    │ • Event propagation │
    └─────────────────────┘
        ↓
    Agent Event Handlers
    ┌─────────────────────┐
    │ • onMouseDown       │
    │ • onMouseDownHit    │
    │ • onMouseUp         │
    │ • onMouseUpHit      │
    │ • onMouseMove       │
    │ • onMouseMoveHit    │
    │ • onKeyDown         │
    └─────────────────────┘
```

## Stage 1: UserEvents (Client-Side)

**File**: `client/UserEvents.js`

### Responsibilities

- Capture raw browser events (mouse, keyboard, touch)
- Convert mouse coordinates from canvas space to world coordinates
- Throttle mouse move events to prevent flooding
- Handle mobile touch events
- Propagate events to the server

### Event Types Generated

**Base Events** (sent to Environment):

- `onMouseDown(mouseWorldPosition)`
- `onMouseUp(mouseWorldPosition)`
- `onMouseMove(mouseWorldPosition)`
- `onKeyDown(key)`
- `onResizeCanvas(size)`

**Note**: The UserEvents client generates the base events above. The Environment then creates additional "Hit" and "NoAgentHit" variants - see [Stage 2: Environment](#stage-2-environment-server-side) for the complete event list that agents can receive.

### Key Features

#### Coordinate Conversion

```javascript
// Convert from canvas coordinates to world coordinates
this.mouseWorldPosition = function () {
  return CoordinatesConversion.canvasToWorld(
    mouseCanvasPosition,
    camera.rectangle,
    screen.getSize(),
  );
};
```

#### Mouse Move Throttling

Mouse move events are throttled using `setInterval` to prevent overwhelming the system:

```javascript
function propagateMouseMoveOnInterval() {
  if (mousePositionChanged) {
    propagate("onMouseMove", self.mouseWorldPosition());
    mousePositionChanged = false;
  }
}
```

#### Touch Support

Mobile touch events are converted to mouse events:

```javascript
function treatTouchMove(event) {
  event.preventDefault();
  mouseCanvasPosition = getMouseCanvasPosition(event);
  propagate("onMouseMove", self.mouseWorldPosition());
}
```

## Stage 2: Environment (Server-Side Event Propagation)

**File**: `server/agent/Environment.js`

The Environment is responsible for determining which agents should receive user events and performing hit detection for mouse events.

### Improved Event Propagation Logic

The `propagateUserEvent` method now uses a three-stage filtering system:

#### 1. Event Subscription Filtering

Agents that have subscribed to specific events always receive them:

```javascript
// Agents subscribed to this event type get it
if (eventSubscriptions.has(event)) {
  eventSubscriptions.get(event).forEach((agent) => {
    targetAgents.push(agent);
  });
}
```

#### 2. Interactive State Filtering

For mouse events, agents in interactive states (dragging, pressed) always receive them:

```javascript
// Interactive agents always get mouse events
if (["onMouseMove", "onMouseUp"].includes(event)) {
  interactiveAgents.forEach((agent) => {
    targetAgents.push(agent);
  });
}
```

#### 3. Viewport-Based Filtering

All events are sent to agents visible to the client that generated the event:

```javascript
// All visible agents get the event
if (clientCamera) {
  const visibleAgents = this.getAgentsVisibleToClient(clientCamera);
  visibleAgents.forEach((agent) => {
    targetAgents.push(agent);
  });
}
```

**Implementation Note**: The new three-stage filtering system eliminates the need for special cases that existed in previous versions. Agents in interactive states (like being dragged) are automatically tracked and receive relevant events regardless of their spatial position, while viewport-based filtering ensures proper event delivery in multiplayer scenarios.

### Hit Detection and Event Delivery

For each target agent, the system:

1. **Checks for event handlers**: `agent[event]` or `agent[event + "Hit"]`
2. **Performs hit detection** for mouse events: `agent.checkHit(mousePosition)`
3. **Calls appropriate handler**:
   - `agent[event + "Hit"](arg)` if mouse is over the agent
   - `agent[event](arg)` for general events

```javascript
// Hit detection for mouse events
if (agent.checkHit(arg)) {
  agent[event + "Hit"] && agent[event + "Hit"](arg);

  // Update interactive state
  if (event === "onMouseDown") {
    this.setAgentInteractive(agent);
  }
} else {
  // General event handler
  agent[event] && agent[event](arg);
}
```

### Event Types Generated by Environment

For each mouse event, the Environment generates up to two versions:

**General Events** (all nearby agents receive these):

- `onMouseDown(mouseWorldPosition)`
- `onMouseUp(mouseWorldPosition)`
- `onMouseMove(mouseWorldPosition)`

**Hit Events** (only agents under the mouse receive these):

- `onMouseDownHit(mouseWorldPosition)`
- `onMouseUpHit(mouseWorldPosition)`
- `onMouseMoveHit(mouseWorldPosition)`

**No-Agent-Hit Events** (mentioned in UserEvents.js but not currently implemented):

- `onMouseDownNoAgentHit`
- `onMouseUpNoAgentHit`
- `onMouseMoveNoAgentHit`

## Stage 3: Agent Event Handlers

### Complete Event Reference

Agents can receive any of these events depending on their position and the user interaction:

#### Mouse Events (Position-Based)

- `onMouseDown(mouseWorldPosition)` - Mouse pressed near this agent
- `onMouseUp(mouseWorldPosition)` - Mouse released near this agent
- `onMouseMove(mouseWorldPosition)` - Mouse moved near this agent

#### Mouse Hit Events (Direct Interaction)

- `onMouseDownHit(mouseWorldPosition)` - Mouse pressed directly on this agent
- `onMouseUpHit(mouseWorldPosition)` - Mouse released directly over this agent
- `onMouseMoveHit(mouseWorldPosition)` - Mouse moved directly over this agent

#### Mouse No-Hit Events (Mentioned in UserEvents.js but not currently implemented)

- `onMouseDownNoAgentHit` - Mouse pressed but no agent was hit
- `onMouseUpNoAgentHit` - Mouse released but no agent was hit
- `onMouseMoveNoAgentHit` - Mouse moved but no agent was hit

#### Keyboard Events

- `onKeyDown(key)` - Key was pressed

#### System Events

- `onResizeCanvas(size)` - Canvas/window was resized

### Available Event Handlers

Agents can implement any combination of these event handlers:

#### Mouse Events

```javascript
// General mouse events (all nearby agents receive)
onMouseDown(mouseWorldPosition) { /* handle mouse press */ }
onMouseUp(mouseWorldPosition) { /* handle mouse release */ }
onMouseMove(mouseWorldPosition) { /* handle mouse movement */ }

// Hit-specific events (only when mouse is over this agent)
onMouseDownHit(mouseWorldPosition) { /* handle click on this agent */ }
onMouseUpHit(mouseWorldPosition) { /* handle release over this agent */ }
onMouseMoveHit(mouseWorldPosition) { /* handle hover over this agent */ }
```

#### Keyboard Events

```javascript
onKeyDown(key) { /* handle key press */ }
```

#### Other Events

```javascript
onResizeCanvas(size) { /* handle window/canvas resize */ }
```

### Event Handler Patterns

#### Basic Button Response

```javascript
onMouseDownHit(mouseWorldPosition) {
  console.log("Button clicked!");
  this.onClick && this.onClick();
}
```

#### Visual Feedback (used by ChangeOnMouseDown mixin)

```javascript
onMouseDownHit(mouseWorldPosition) {
  this.originalSize = this.getSize().clone();
  this.rectangle.shrink(0.1); // Shrink by 10%
}

onMouseUp(mouseWorldPosition) {
  if (this.originalSize) {
    this.setSize(this.originalSize);
  }
}
```

#### Drag Handling

```javascript
onMouseDownHit(mouseWorldPosition) {
  this.isBeingDragged = true;
  this.dragOffset = mouseWorldPosition.subtract(this.getPosition());
}

onMouseMove(mouseWorldPosition) {
  if (this.isBeingDragged) {
    this.setPosition(mouseWorldPosition.subtract(this.dragOffset));
  }
}

onMouseUp(mouseWorldPosition) {
  this.isBeingDragged = false;
}
```

## Key Design Decisions

### 1. Three-Stage Event Filtering System

The event system now uses a sophisticated filtering approach that combines:

1. **Event Subscriptions**: Agents can explicitly subscribe to events they need
2. **Interactive State Tracking**: Agents in interactive states (dragging, pressed) automatically receive relevant events
3. **Viewport-Based Filtering**: Events are filtered by what's visible to the client generating them

This approach provides excellent performance while properly handling multiplayer scenarios:

- Player A's mouse events only affect agents visible in Player A's viewport
- Player B's mouse events only affect agents visible in Player B's viewport
- No cross-contamination of events between players viewing different areas
- Interactive agents (like dragged objects) receive events regardless of spatial position

### 2. Hit vs Non-Hit Events

The dual event system allows agents to:

- Respond to general mouse activity in their area (`onMouseMove`)
- Respond specifically when the mouse is over them (`onMouseMoveHit`)

### 3. Coordinate System

All mouse positions are converted to world coordinates, making it easy for agents to work with positions regardless of camera zoom/position.

### 4. Event Throttling

Mouse move events are throttled on the client side to prevent performance issues during rapid mouse movement.

## Common Issues and Solutions

### Issue: Button Doesn't Return to Normal Size

**Problem**: Button shrinks on mouse down but stays shrunk if mouse is released outside the button.

**Cause**: Button only receives `onMouseUpHit` when mouse is released over it, not `onMouseUp` when released elsewhere.

**Solution**: Use both `onMouseUp` and `onMouseUpHit` handlers:

```javascript
// In ChangeOnMouseDown mixin
this.onMouseUp = returnToOriginalSize; // Handle release anywhere
this.onMouseUpHit = returnToOriginalSize; // Handle release over button
```

### Issue: Dragging Stops When Mouse Moves Fast

**Problem**: Dragged agents stop following the mouse during rapid movement.

**Root Cause**: The spatial indexing system only sends events to agents "near" the mouse position. When dragging, the mouse can move far from the agent's current position, causing the agent to not receive mouse events.

**Solution (Implemented)**: The new event system uses interactive state tracking to ensure agents being dragged always receive `onMouseMove` and `onMouseUp` events regardless of spatial position. This is handled through the three-stage filtering system:

1. **Event Subscriptions**: Agents can subscribe to specific events
2. **Interactive State Tracking**: Dragged agents are marked as interactive and always receive mouse events
3. **Viewport-Based Filtering**: Events are filtered by what's visible to the client

This approach eliminates special cases while maintaining performance and logical consistency, especially for multiplayer scenarios.

### Issue: Events Not Firing

**Problem**: Agent event handlers are not being called.

**Debugging Steps**:

1. Check if agent is visible: `agent.isVisible`
2. Check if agent is in the right location for spatial indexing
3. Verify event handler method names (case-sensitive)
4. Add console.log in event handlers to verify they're being called

## Performance Considerations

1. **Spatial Indexing**: Only agents near mouse events are processed
2. **Mouse Move Throttling**: Client-side throttling prevents event flooding
3. **Event Handler Checking**: Environment checks if handlers exist before calling them
4. **Early Returns**: Hit detection uses early returns to avoid unnecessary processing

## Configuration

### Mouse Move Throttling

Configure the mouse move event interval when starting UserEvents:

```javascript
userEvents.start(
  16, // 16ms = ~60fps mouse move updates
  propagateCallback,
  camera,
  screen,
);
```

### Event Subscription

Enable/disable specific event types:

```javascript
userEvents.enableEvent("onMouseDown");
userEvents.enableEvent("onMouseMove");
userEvents.disableEvent("onKeyDown"); // Disable keyboard events
```
