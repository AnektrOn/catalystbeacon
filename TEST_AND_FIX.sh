#!/bin/bash
# Simple test and fix script
# Run this on your production server

cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🔍 QUICK DIAGNOSTIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Is Node.js responding?
echo "Test 1: Node.js server"
if curl -s http://localhost:3001/ | head -5 | grep -q "root\|<!DOCTYPE"; then
    echo "   ✅ Node.js is serving HTML"
else
    echo "   ❌ Node.js is NOT serving correctly"
    echo "   Response: $(curl -s http://localhost:3001/ | head -3)"
fi
echo ""

# Test 2: Does build/index.html exist and have JS?
echo "Test 2: Build files"
if [ -f "build/index.html" ]; then
    if grep -q "static/js" build/index.html; then
        echo "   ✅ index.html has JS references"
    else
        echo "   ❌ index.html is just a template (no JS bundled)"
    fi
else
    echo "   ❌ index.html missing"
fi
echo ""

# Test 3: Check PM2
echo "Test 3: PM2 status"
pm2 list | grep hcuniversity-app
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 APPLYING FIX"
echo ""

# Fix: Clean rebuild
echo "Step 1: Cleaning..."
rm -rf build node_modules/.cache
echo "   ✅ Cleaned"
echo ""

echo "Step 2: Rebuilding..."
npm run build 2>&1 | tail -20
echo ""

echo "Step 3: Verifying build..."
if [ -f "build/index.html" ] && grep -q "static/js" build/index.html; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed or incomplete"
    echo "   Check errors above"
    exit 1
fi
echo ""

echo "Step 4: Restarting PM2..."
pm2 restart hcuniversity-app
sleep 2
pm2 logs hcuniversity-app --lines 5 --nostream
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DONE!"
echo ""
echo "Test if it works:"
echo "  curl http://localhost:3001/"
echo ""

