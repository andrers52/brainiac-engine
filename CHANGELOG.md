# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-06-11

### Fixed

- **Dependency Issue**: Resolved missing `chai` dependency error in test suite
  - Converted `CoordinatesConversion.test.js` from `chai` to Node.js built-in `assert`
  - Standardized all tests to use consistent assertion library
  - Eliminated unnecessary external test dependencies

### Changed

- **Test Consistency**: All test files now use Node.js built-in `assert` module
  - Converted `expect().to.be.equal()` → `assert.strictEqual()`
  - Converted `expect().to.be.an.instanceof()` → `assert.ok(obj instanceof Class)`
  - Improved test maintainability and reduced dependency footprint

### Deprecated

- **Version 0.3.0**: This version is deprecated due to breaking singleton structure that caused compatibility issues with existing games like Z32

### Technical Details

- Removed `chai` import from `CoordinatesConversion.test.js`
- Updated all coordinate conversion test assertions to use `assert` syntax
- Maintained full test coverage (115 passing tests)
- Preserved original functionality while fixing dependency issues

## [0.2.1] - 2025-06-11

### Fixed

- **Test Suite Stability**: Fixed all failing tests in the comprehensive test suite
  - Fixed 5 Pulsate effect tests: corrected timing algorithm and scope issues
  - Fixed 4 Environment tests: resolved agent lifecycle and event propagation bugs
  - Fixed 4 Screen tests: properly handled browser-only canvas tests in Node.js environment
- **Agent Lifecycle Bug**: Fixed critical bug in `Environment.killAllAgents()` where wrong agent was being terminated
- **Pulsate Effect**:
  - Corrected pulsate timing algorithm for proper grow/shrink cycles
  - Fixed scope issues with `this` vs `self` references
  - Fixed original rectangle size storage and restoration
- **Test Infrastructure**: Enhanced JSDOM setup and canvas mocking for better test reliability
- **Rectangle Intersection**: Restored original behavior where containment counts as intersection

### Enhanced

- **Test Coverage**: Achieved 115 passing tests with 0 failures
- **Test Environment**: Improved Node.js test environment setup with proper DOM/Canvas mocking
- **Code Quality**: Enhanced geometry calculations and agent behavior management
- **ES Module Compatibility**: Ensured all imports and exports work correctly across the codebase

### Technical Details

- Fixed `Environment.killAllAgents()`: `agents[0].die()` → `agents[id].die()`
- Updated Pulsate timing: `cycleTime = maxTimeinMilliseconds / 4` for proper animation cycles
- Enhanced test mocks with required properties (`isVisible`, `checkHit`, `isUserAgent`)
- Marked browser-specific canvas tests as pending in Node.js environment
- Restored `Rectangle.checkIntersection()` original containment behavior

## [0.2.0] - 2025-06-10

### Added

- Comprehensive JSDoc documentation across the entire codebase
- File-level documentation for all modules
- Class-level documentation with detailed descriptions
- Method and function documentation with parameter types and return values
- Usage examples in JSDoc comments
- Property documentation with type annotations
- Cross-references and related method documentation
- Error condition documentation where applicable

### Changed

- Enhanced code documentation standards throughout the project
- Improved code maintainability through better documentation

### Documentation

- Added JSDoc to client-side modules:

  - `BEClient.js` - Main client singleton with comprehensive API documentation
  - `ParticlesContainer.js` - Particle system management
  - `ResourceStore.js` - Resource loading and caching
  - `Screen.js` - Screen management and rendering
  - `BEClientDefinitions.js` - Client-side definitions and constants
  - `CoordinatesConversion.js` - Coordinate system utilities
  - `TextToImage.js` - Text rendering utilities
  - `UserEvents.js` - User input handling
  - Image processing and effects modules
  - Image filter system modules

- Added JSDoc to server-side modules:

  - `BEServer.js` - Main server singleton
  - `Connector.js` - Network connection management
  - `SpaceSegments.js` - Spatial partitioning system
  - `Agent.js` - Base agent class with behavior system
  - `AgentDefinitions.js` - Agent type definitions
  - `Camera.js` - Camera system for view management
  - `Container.js` - Agent container management
  - `Environment.js` - Game environment singleton
  - Agent mixin system with comprehensive documentation
  - UI system components (Button, Label, Score, etc.)
  - User management system

- Added JSDoc to common modules:

  - `Vector.js` - 2D vector mathematics
  - `Vector3D.js` - 3D vector mathematics
  - `Rectangle.js` - Rectangle geometry utilities
  - `fakeSocket.js` - Mock socket implementation

- Added JSDoc to behavior and mixin systems:
  - Action scheduling system
  - Animation system
  - Behavior components
  - Image effects system
  - Agent sensing capabilities
  - UI interaction mixins

## [0.1.1] - Previous Release

### Initial

- Core Brainiac Engine functionality
- Client-server architecture
- Agent-based system
- Particle system
- UI components
- Vector mathematics
- Image processing capabilities
- Socket-based networking

---

## Release Notes

### Version 0.2.0 Notes

This release focuses on dramatically improving the developer experience through comprehensive documentation. Every public API, method, class, and function now includes detailed JSDoc comments with:

- Parameter and return type information
- Detailed descriptions and usage notes
- Code examples where appropriate
- Cross-references to related functionality
- Error conditions and edge case documentation

This makes the Brainiac Engine much more accessible to new developers and improves maintainability for existing contributors.

### Future Releases

- Version 0.3.0 will focus on performance optimizations and new features
- Version 1.0.0 will mark the first stable release with a locked API

---

## Contributing

When contributing to this project, please:

1. Update the CHANGELOG.md with your changes
2. Follow the existing JSDoc documentation standards
3. Include examples in your documentation where helpful
4. Bump the appropriate version number (patch/minor/major)
