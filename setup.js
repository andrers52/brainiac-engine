#!/usr/bin/env node

/**
 * @file Setup script for Brainiac Engine
 * Automatically installs dependencies and prepares the development environment
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Brainiac Engine...\n");

// Check if package.json exists
if (!fs.existsSync("package.json")) {
  console.error(
    "❌ Error: package.json not found. Make sure you are in the correct directory.",
  );
  process.exit(1);
}

try {
  // Install dependencies
  console.log("📦 Installing dependencies...");
  execSync("npm install", { stdio: "inherit" });

  // Check if examples directory exists and setup if needed
  if (fs.existsSync("examples")) {
    console.log("\n🎮 Setting up examples...");

    // Setup widgets example if it has its own package.json
    const widgetsPath = path.join("examples", "widgets");
    if (fs.existsSync(path.join(widgetsPath, "package.json"))) {
      console.log("  - Setting up widgets example...");
      execSync("npm install", {
        cwd: widgetsPath,
        stdio: "inherit",
      });
    }
  }

  // Run tests to verify everything is working
  console.log("\n🧪 Running tests to verify setup...");
  execSync("npm test", { stdio: "inherit" });

  console.log("\n✅ Brainiac Engine setup completed successfully!");
  console.log("\n📖 Quick start:");
  console.log("   - Check the examples/ directory for usage examples");
  console.log("   - Run `npm test` to run the test suite");
  console.log("   - Visit the repository for full documentation");
} catch (error) {
  console.error("\n❌ Setup failed:", error.message);
  console.log("\n🔧 Try running the following commands manually:");
  console.log("   npm install");
  console.log("   npm test");
  process.exit(1);
}
