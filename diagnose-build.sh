#!/bin/bash
# Diagnose build failures on production server
# Run this on the production server to see what's going wrong

set -e

cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🔍 BUILD DIAGNOSTIC TOOL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check environment
echo "📋 Step 1: Environment Check..."
echo "   Current directory: $(pwd)"
echo "   Node version: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "   NPM version: $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo "   NODE_ENV: ${NODE_ENV:-not set}"
echo ""

# Step 2: Check .env file
echo "📋 Step 2: Environment Variables Check..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    if grep -q "REACT_APP_SUPABASE_URL" .env; then
        echo "   ✅ REACT_APP_SUPABASE_URL found in .env"
    else
        echo "   ❌ REACT_APP_SUPABASE_URL NOT found in .env"
    fi
    if grep -q "REACT_APP_SUPABASE_ANON_KEY" .env; then
        echo "   ✅ REACT_APP_SUPABASE_ANON_KEY found in .env"
    else
        echo "   ❌ REACT_APP_SUPABASE_ANON_KEY NOT found in .env"
    fi
else
    echo "   ❌ .env file NOT found!"
fi
echo ""

# Step 3: Check dependencies
echo "📋 Step 3: Dependencies Check..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
    if [ -f "node_modules/.bin/react-app-rewired" ]; then
        echo "   ✅ react-app-rewired installed"
    else
        echo "   ❌ react-app-rewired NOT found in node_modules"
    fi
else
    echo "   ❌ node_modules directory NOT found!"
    echo "   Run: npm install --legacy-peer-deps"
fi
echo ""

# Step 4: Check package.json
echo "📋 Step 4: Package.json Check..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json exists"
    if grep -q "build:no-minify" package.json; then
        echo "   ✅ build:no-minify script found"
    else
        echo "   ❌ build:no-minify script NOT found in package.json"
    fi
else
    echo "   ❌ package.json NOT found!"
fi
echo ""

# Step 5: Try a test build with verbose output
echo "📋 Step 5: Attempting test build (this will show errors)..."
echo "   Cleaning old build..."
rm -rf build
echo "   ✅ Cleaned"
echo ""

echo "   Running build command..."
echo "   Command: NODE_ENV=production npm run build:no-minify"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run build and capture both stdout and stderr
NODE_ENV=production npm run build:no-minify 2>&1 | tee /tmp/build-output.log
BUILD_EXIT=${PIPESTATUS[0]}

echo ""
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Also check if build directory was created
BUILD_EXISTS=false
if [ -d "build" ] && [ -f "build/index.html" ]; then
    BUILD_EXISTS=true
fi

if [ $BUILD_EXIT -ne 0 ] || [ "$BUILD_EXISTS" = false ]; then
    echo "   ❌ Build failed with exit code: $BUILD_EXIT"
    echo ""
    echo "   📋 Error summary (last 30 lines):"
    tail -30 /tmp/build-output.log
    echo ""
    echo "   💡 Full build log saved to: /tmp/build-output.log"
    echo "   View it with: cat /tmp/build-output.log"
else
    echo "   ✅ Build completed successfully!"
    echo ""
    # Verify build output
    if [ -f "build/index.html" ]; then
        echo "   ✅ build/index.html exists"
        FILE_SIZE=$(stat -c%s build/index.html 2>/dev/null || stat -f%z build/index.html 2>/dev/null || echo "0")
        echo "   📊 File size: $FILE_SIZE bytes"
        
        if grep -q "static/js" build/index.html; then
            echo "   ✅ Contains JavaScript bundle references"
        else
            echo "   ⚠️  WARNING: Missing JavaScript bundle references"
        fi
    else
        echo "   ❌ build/index.html NOT found even though build succeeded!"
    fi
    
    JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
    CSS_COUNT=$(find build/static/css -name "*.css" 2>/dev/null | wc -l)
    echo "   📊 Found $JS_COUNT JS files and $CSS_COUNT CSS files"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Diagnostic complete!"
echo ""

