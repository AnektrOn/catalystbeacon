#!/bin/bash

# Comprehensive Test Suite Runner
# This script runs all tests in the correct order

echo "🚀 Starting Comprehensive Test Suite..."
echo "========================================"

# Check if app is running
echo ""
echo "Step 1: Checking if application is running..."
node scripts/checkAppRunning.js
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Application is not running!"
    echo "Please start it with: npm start"
    echo "Then run this script again."
    exit 1
fi

echo ""
echo "Step 2: Running code verification..."
node scripts/verifyFixes.js

echo ""
echo "Step 3: Running comprehensive UX/UI tests..."
node scripts/comprehensiveUXTest.js

echo ""
echo "✅ Test suite complete!"
echo "Check the reports in testsprite_tests/ directory"
