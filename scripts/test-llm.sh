#!/bin/bash

# LLM Test Runner Script
# Allows easy switching between mock and real LLM testing

set -e

echo "🧪 Brainiac Engine LLM Test Runner"
echo "=================================="

# Default to mock testing
MODE=${1:-mock}

# Function to run tests with ONNX warnings filtered out
run_tests_with_filter() {
    local test_command="$1"
    local mode_description="$2"
    
    echo "$mode_description"
    echo "   - Filtering ONNX runtime warnings for cleaner output"
    echo ""
    
    # Run the test command and filter out ONNX warnings
    # Keep test output but suppress the verbose ONNX messages
    eval "$test_command" 2>&1 | grep -v "onnxruntime.*CleanUnusedInitializersAndNodeArgs" | grep -v "node.*onnxruntime.*graph.cc"
}

case $MODE in
  "mock"|"fast")
    echo "🧪 Running tests with MOCK LLM (fast mode)"
    echo "   - Fast execution (5s timeout)"
    echo "   - No real model loading"
    echo "   - Suitable for CI/CD"
    echo ""
    run_tests_with_filter "npm test -- --grep \"LLMService Integration\"" "🧪 Testing with MOCK LLM (fast test)"
    ;;
  "real"|"full")
    echo "🤖 Running tests with REAL LLM (full mode)"
    echo "   - Slow execution (60s timeout)"
    echo "   - Real model loading and generation"
    echo "   - Tests actual LLM functionality"
    echo "   - Requires internet connection"
    echo "   - ONNX warnings will be filtered for cleaner output"
    echo ""
    run_tests_with_filter "TEST_REAL_LLM=true npm test -- --grep \"LLMService Integration\"" "🤖 Testing with REAL LLM (this may take 30+ seconds)"
    ;;
  "both")
    echo "🔄 Running tests in both modes"
    echo ""
    echo "=== MOCK MODE ==="
    run_tests_with_filter "npm test -- --grep \"LLMService Integration\"" "🧪 Testing with MOCK LLM (fast test)"
    echo ""
    echo "=== REAL MODE ==="
    run_tests_with_filter "TEST_REAL_LLM=true npm test -- --grep \"LLMService Integration\"" "🤖 Testing with REAL LLM (this may take 30+ seconds)"
    ;;
  "help"|"-h"|"--help")
    echo "Usage: $0 [mode]"
    echo ""
    echo "Modes:"
    echo "  mock|fast  - Run with mock LLM (default, fast)"
    echo "  real|full  - Run with real LLM (slow, tests actual functionality)"
    echo "  both       - Run both mock and real tests"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Run mock tests (fast)"
    echo "  $0 mock         # Run mock tests (fast)"
    echo "  $0 real         # Run real LLM tests (slow)"
    echo "  $0 both         # Run both modes"
    echo ""
    echo "Environment Variables:"
    echo "  TEST_REAL_LLM=true  - Force real LLM testing"
    echo "  TEST_REAL_LLM=false - Force mock LLM testing"
    echo ""
    echo "Note: ONNX runtime warnings are automatically filtered for cleaner output"
    ;;
  *)
    echo "❌ Unknown mode: $MODE"
    echo "Run '$0 help' for usage information"
    exit 1
    ;;
esac 