#!/bin/bash

# LLM Caching Test Runner Script
# Tests caching behavior in both Node.js and browser environments

set -e

echo "🧪 Brainiac Engine LLM Caching Test Runner"
echo "=========================================="

# Default to mock testing
MODE=${1:-mock}

# Function to run caching tests with ONNX warnings filtered out
run_caching_tests() {
    local test_command="$1"
    local mode_description="$2"
    
    echo "$mode_description"
    echo "   - Testing memory and persistent caching"
    echo "   - Measuring performance improvements"
    echo "   - Verifying cache persistence across runs"
    echo "   - Filtering ONNX runtime warnings for cleaner output"
    echo ""
    
    # Run the test command and filter out ONNX warnings
    eval "$test_command" 2>&1 | grep -v "onnxruntime.*CleanUnusedInitializersAndNodeArgs" | grep -v "node.*onnxruntime.*graph.cc"
}

case $MODE in
  "mock"|"fast")
    echo "🧪 Running caching tests with MOCK LLM (fast mode)"
    echo "   - Fast execution (5s timeout per test)"
    echo "   - Tests memory caching behavior"
    echo "   - Tests persistent caching (if available)"
    echo "   - Performance measurements"
    echo ""
    run_caching_tests "npm test -- --grep \"LLMService Caching Tests\"" "🧪 Testing caching with MOCK LLM"
    ;;
  "real"|"full")
    echo "🤖 Running caching tests with REAL LLM (full mode)"
    echo "   - Slow execution (60s timeout per test)"
    echo "   - Real model downloading and caching"
    echo "   - Tests actual LLM functionality"
    echo "   - Requires internet connection"
    echo "   - Tests persistent cache across runs"
    echo ""
    run_caching_tests "TEST_REAL_LLM=true npm test -- --grep \"LLMService Caching Tests\"" "🤖 Testing caching with REAL LLM"
    ;;
  "both")
    echo "🔄 Running caching tests in both modes"
    echo ""
    echo "=== MOCK MODE ==="
    run_caching_tests "npm test -- --grep \"LLMService Caching Tests\"" "🧪 Testing caching with MOCK LLM"
    echo ""
    echo "=== REAL MODE ==="
    run_caching_tests "TEST_REAL_LLM=true npm test -- --grep \"LLMService Caching Tests\"" "🤖 Testing caching with REAL LLM"
    ;;
  "performance")
    echo "⚡ Running performance-focused caching tests"
    echo "   - Detailed timing measurements"
    echo "   - Cache hit/miss analysis"
    echo "   - Memory vs persistent cache comparison"
    echo ""
    run_caching_tests "npm test -- --grep \"Cache Performance Tests\"" "⚡ Performance-focused caching tests"
    ;;
  "help"|"-h"|"--help")
    echo "Usage: $0 [mode]"
    echo ""
    echo "Modes:"
    echo "  mock|fast     - Run with mock LLM (default, fast)"
    echo "  real|full     - Run with real LLM (slow, tests actual functionality)"
    echo "  both          - Run both mock and real tests"
    echo "  performance   - Run performance-focused tests only"
    echo "  help          - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Run mock caching tests (fast)"
    echo "  $0 mock         # Run mock caching tests (fast)"
    echo "  $0 real         # Run real LLM caching tests (slow)"
    echo "  $0 both         # Run both modes"
    echo "  $0 performance  # Run performance tests only"
    echo ""
    echo "Environment Variables:"
    echo "  TEST_REAL_LLM=true  - Force real LLM testing"
    echo "  TEST_REAL_LLM=false - Force mock LLM testing"
    echo ""
    echo "Cache Locations:"
    echo "  Node.js: ./.cache/llm-models/"
    echo "  Browser: IndexedDB (mimiFiles database)"
    ;;
  *)
    echo "❌ Unknown mode: $MODE"
    echo "Run '$0 help' for usage information"
    exit 1
    ;;
esac 