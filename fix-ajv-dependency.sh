#!/bin/bash
# Fix missing ajv dependency issue
# Run this on your production server

set -e

cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🔧 FIXING AJV DEPENDENCY ISSUE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check if ajv is installed
echo "📋 Step 1: Checking ajv installation..."
if [ -d "node_modules/ajv" ]; then
    echo "   ✅ ajv directory exists"
    if [ -f "node_modules/ajv/dist/compile/codegen.js" ]; then
        echo "   ✅ ajv/dist/compile/codegen.js exists"
    else
        echo "   ❌ ajv/dist/compile/codegen.js MISSING!"
        echo "   This is the problem - ajv is corrupted or wrong version"
    fi
else
    echo "   ❌ ajv NOT installed!"
fi
echo ""

# Step 2: Clean and reinstall ajv specifically
echo "📋 Step 2: Reinstalling ajv and related packages..."
echo "   Removing corrupted packages..."
rm -rf node_modules/ajv
rm -rf node_modules/ajv-keywords
rm -rf node_modules/ajv-formats
echo "   ✅ Removed"
echo ""

echo "   Installing ajv@^8.12.0 (compatible version)..."
npm install ajv@^8.12.0 ajv-keywords@^5.1.0 --legacy-peer-deps --save-dev
echo "   ✅ Installed"
echo ""

# Step 3: Verify ajv installation
echo "📋 Step 3: Verifying ajv installation..."
if [ -f "node_modules/ajv/dist/compile/codegen.js" ]; then
    echo "   ✅ ajv/dist/compile/codegen.js now exists"
else
    echo "   ❌ Still missing! Trying full reinstall..."
    echo ""
    
    # Full clean reinstall
    echo "   Cleaning everything..."
    rm -rf node_modules package-lock.json .cache node_modules/.cache
    npm cache clean --force
    echo "   ✅ Cleaned"
    echo ""
    
    echo "   Reinstalling all dependencies..."
    npm install --legacy-peer-deps --force
    echo "   ✅ Reinstalled"
    echo ""
    
    # Check again
    if [ -f "node_modules/ajv/dist/compile/codegen.js" ]; then
        echo "   ✅ ajv/dist/compile/codegen.js now exists"
    else
        echo "   ❌ Still missing after full reinstall!"
        echo "   This might be a version compatibility issue"
        exit 1
    fi
fi
echo ""

# Step 4: Test build
echo "📋 Step 4: Testing build..."
rm -rf build
echo "   Running test build..."
NODE_ENV=production npm run build:no-minify 2>&1 | head -50

BUILD_EXIT=${PIPESTATUS[0]}

if [ $BUILD_EXIT -eq 0 ] && [ -f "build/index.html" ]; then
    echo ""
    echo "   ✅ Build successful!"
    JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
    echo "   📊 Found $JS_COUNT JavaScript files"
else
    echo ""
    echo "   ❌ Build still failing!"
    echo "   Check the error above"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ AJV DEPENDENCY FIXED!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: bash deploy.sh (to do full deployment)"
echo "   2. Or: pm2 restart hcuniversity-app (if build is already done)"
echo ""

