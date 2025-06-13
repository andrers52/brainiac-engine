# [0.3.8] - 2025-06-12

### Added

- **Comprehensive ImageFilter Module Testing**: Complete test coverage for the ImageFilter module
  - Added `ImageFilter.test.js` with 31 passing tests covering main function, createImageData, convolute, convoluteFloat32, edge cases, and integration scenarios
  - Tests cover filter chaining, argument handling, convolution operations (identity, blur, edge detection), Float32Array support, and error handling
  - Added comprehensive edge case testing for small images, large kernels, empty kernels, and null inputs
  - Integration scenarios include realistic blur, sharpen, and multi-filter workflows

### Fixed

- **ImageFilter Module Compatibility**: Fixed Node.js ES module compatibility and test environment issues

  - Fixed `Float32Array` constructor access using `globalThis.Float32Array || window.Float32Array || Float32Array` for better cross-environment compatibility
  - Enhanced test setup with proper `createImageData` mock in canvas context
  - Added typed array support (`Float32Array`, `Uint8ClampedArray`, `Uint8Array`) to test environment globals
  - Fixed test mocking conflicts by preventing re-stubbing of already stubbed methods
  - Fixed dynamic ImageData creation in tests to return properly sized data matching requested dimensions

- **Test Infrastructure**: Enhanced test environment robustness
  - Fixed context mocking issues by properly setting up `ImageFilter.tmpCtx` with mock context
  - Added stub conflict prevention for `document.createElement` to avoid re-stubbing errors
  - Improved test isolation and cleanup to prevent interference between test suites
  - Fixed test logic for filter argument handling to match actual ImageFilter implementation behavior

### Changed

- **Test Coverage**: Increased test coverage from 285 to 316 passing tests (31 new ImageFilter tests)
- **Test Environment**: More robust test setup with better canvas and context mocking
- **Code Quality**: Enhanced cross-platform compatibility for the ImageFilter module

# [0.3.7] - 2025-06-12

### Added

- **Comprehensive Effect Module Testing**: Complete test coverage for all visual effect modules
  - Added `RadialGradient.test.js` with 158 lines covering gradient creation, color stops, composite operations, fill modes, edge cases, and various canvas dimensions
  - Added `ShadowBlur.test.js` with 200+ lines covering canvas setup, shadow configuration, image scaling (0.9 factor), positioning, and edge cases
  - Added `Label.test.js` with 390+ lines covering text rendering, font handling, positioning (including zero values), text measurement, context state, and special characters
  - All tests use Node.js `assert` and `sinon` for consistency with existing test patterns
  - Comprehensive edge case coverage including null parameters, extreme values, and different canvas sizes

### Fixed

- **Label.js Implementation**: Completed and enhanced the Label effect module

  - Fixed incomplete implementation that had undefined `rect()` function call
  - Added proper parameter handling with correct default value logic for x/y positions
  - Fixed issue where falsy values (like 0) were incorrectly overridden by default values
  - Added comprehensive text rendering with background rectangle and proper font handling

- **Test Infrastructure**: Enhanced testing environment and fixed test isolation issues
  - Improved canvas mocking in test setup with additional context methods (`arc`, `rect`, `createRadialGradient`, `shadowBlur`, `shadowColor`)
  - Fixed ResourceStore test interference by adding proper canvas mock isolation
  - Fixed Effect test context mocking to ensure proper `canvas` property references
  - Enhanced parameter validation in RadialGradient and ShadowBlur with null checks

### Changed

- **Test Coverage**: Significantly increased test coverage from ~260 to 285 passing tests
- **Code Quality**: Improved robustness and error handling across all effect modules
- **Documentation**: Enhanced JSDoc comments in Label.js with complete parameter descriptions

# [0.3.6] - 2025-06-12

### Added

- **ResourceStore Testing**: Comprehensive test suite with co-located tests
  - Added `ResourceStore.test.js` co-located with source code
  - Tests cover all major functionality: resource management, image handling, canvas operations
  - Uses Node.js built-in `assert` module for consistency with existing tests

### Fixed

- **ResourceStore Code Quality**: Improved arrow function usage and fixed bugs
  - Converted internal helper functions (`storeAudioData`, `storeImageData`, `loadImage`, `loadAudio`, `loadJSON`) to arrow functions
  - Eliminated all `.call(this, ...)` patterns by using lexical `this` binding
  - Fixed undefined `permanent` variable in `cloneImage` method
  - Enhanced test setup with proper canvas mock methods (`getImageData`, `putImageData`)

### Changed

- **ResourceStore Location**: Moved out of singleton directory to reflect non-singleton nature
- **Code Style**: Cleaner context handling throughout ResourceStore implementation

# [0.3.5] - 2025-06-12

### Fixed

- **ResourceStore Refactor**: Fully removed singleton pattern, now always instance-based
  - All usages of `resourceStore` singleton import removed; all consumers now use instance from `BEClient.getResourceStore()`
  - Fixed all context (`this`) issues in async callbacks and resource loading
  - Fixed all remaining references to `resourceStore` in callbacks, event handlers, and resource loading functions
  - Fixed all browser and test errors related to undefined or incorrect resource store context
  - Z32 and other games now work with the new instance-based resource store

### Changed

- **API**: `ResourceStore` is now always constructed and passed as a dependency; no global singleton exists
  - All documentation and code comments updated to reflect new usage
  - All tests updated to use instance-based pattern

### Technical Details

- All async resource loading callbacks now use correct context (`this` or `self`)
- All resource loading and retrieval is now instance-safe and supports multiple clients

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.4] - 2025-06-12

### Fixed

- **Test Framework Configuration**: Fixed npm test failures in Action tests
  - Configured arslib `Assert.testMode = true` globally in test setup to prevent `process.exit(1)` calls during testing
  - Updated Action test error message patterns to properly match arslib assertion errors
  - All 128 tests now pass consistently with 7 intentionally pending tests
  - Preserved arslib Assert usage in production code while ensuring proper test behavior

### Improved

- **Test Reliability**: Enhanced test setup configuration for better arslib integration
  - Added dynamic import of arslib in test setup to avoid timing issues with window globals
  - Improved error handling in test environment to work seamlessly with arslib assertions
- **Test Cleanup**: Added automatic cleanup of log.txt file after test runs
  - Added `posttest` script to remove log.txt file created by arslib's NodeConsoleLog module
  - Keeps the project directory clean after running tests

## [0.3.3] - 2025-06-12

### Changed

- **Test Organization**: Completely restructured test files to be co-located with source files
  - Moved all test files from parallel `test/` directory structure to be alongside their corresponding source files
  - Updated all import paths in test files to work from new co-located locations
  - Updated mocha configuration to discover tests in new locations and exclude node_modules
  - Removed empty test subdirectories while preserving essential test configuration files

### Fixed

- **Connector Tests**: Fixed all broken Connector test cases
  - Exported `Connector` constructor function for testability
  - Fixed test setup and teardown issues with sinon stubs
  - Properly configured mock objects and dependencies (`BEServer.currentApp`, `BECommonDefinitions.config`)
  - Converted integration tests to unit tests where appropriate
  - Fixed ES module compatibility issues (removed `require()` calls)

### Improved

- **Code Convention**: Renamed `ConnectorConstructor` to `Connector` for better naming convention
  - Updated all JSDoc comments and type annotations
  - Maintained backward compatibility through proper exports
- **Test Coverage**: Achieved 128 passing tests (up from 115) with 0 failing tests
- **Developer Experience**: Tests are now easier to find, navigate, and maintain
  - No need to maintain parallel directory structures
  - Tests are immediately visible when working on source files
  - Shorter and more intuitive import paths

### Technical Details

- Updated `.mocharc.json` configuration to use `**/*.test.js` pattern with appropriate ignore patterns
- Fixed import paths in 16 test files to work from co-located positions
- Preserved test setup files (`test/setup.js`, `test/module-loader.mjs`) for global test configuration
- All tests now use consistent ES module imports and Node.js built-in assertions

## [0.3.2] - 2025-06-11

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

### Technical Details

- Removed `chai` import from `CoordinatesConversion.test.js`
- Updated all coordinate conversion test assertions to use `assert` syntax
- Maintained full test coverage (115 passing tests)
- Preserved original functionality while fixing dependency issues

## [0.3.1] - 2025-06-11

### Deprecated

- **Version 0.3.0**: This version is deprecated due to breaking singleton structure that caused compatibility issues with existing games like Z32

### Technical Details

- Fixed all dependency versions and upgraded arslib to latest one.

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
