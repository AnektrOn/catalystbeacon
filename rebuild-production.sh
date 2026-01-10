#!/bin/bash
# Rebuild Production App - Fix Missing index.html
# Run this on your production server

set -e

echo "🔧 Rebuilding Production App..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

APP_DIR="/home/u933166613/domains/humancatalystbeacon.com/public_html/app"
cd "$APP_DIR" || exit 1

echo "📂 Working directory: $(pwd)"
echo ""

# Step 1: Check .env file exists
echo "🔍 Step 1: Checking environment files..."
if [ -f ".env" ]; then
    echo "   ✅ Found .env file"
    if grep -q "REACT_APP_SUPABASE_URL" .env && grep -q "REACT_APP_SUPABASE_ANON_KEY" .env; then
        echo "   ✅ .env contains required Supabase variables"
    else
        echo "   ⚠️  WARNING: .env missing some variables"
    fi
else
    echo "   ⚠️  WARNING: .env file not found"
fi

echo ""

# Step 2: Remove old build
echo "🗑️  Step 2: Removing old build..."
rm -rf build
echo "   ✅ Old build removed"

# Step 3: Build the app
echo ""
echo "🔨 Step 3: Building application..."
echo "   (This may take 3-5 minutes, please wait...)"
echo ""

# Use build:no-minify to avoid EAGAIN errors
npm run build:no-minify

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "   ❌ Build failed with exit code: $BUILD_EXIT_CODE"
    echo "   Please check the error messages above"
    exit 1
fi

echo ""
echo "   ✅ Build command completed"

# Step 4: Verify build
echo ""
echo "🔍 Step 4: Verifying build..."
if [ ! -f "build/index.html" ]; then
    echo "   ❌ ERROR: index.html still missing after build!"
    echo "   Build may have failed silently"
    echo ""
    echo "   Checking build directory contents:"
    ls -la build/ 2>/dev/null || echo "   Build directory doesn't exist!"
    exit 1
fi

echo "   ✅ index.html found"
echo "   ✅ Build directory exists"

# Check for static files
if [ -d "build/static" ]; then
    JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
    CSS_COUNT=$(find build/static/css -name "*.css" 2>/dev/null | wc -l)
    echo "   ✅ Found $JS_COUNT JavaScript files"
    echo "   ✅ Found $CSS_COUNT CSS files"
else
    echo "   ⚠️  WARNING: build/static directory missing"
fi

# Step 5: Fix permissions
echo ""
echo "🔧 Step 5: Fixing permissions..."
chmod -R 755 build
find build -type f -exec chmod 644 {} \;
echo "   ✅ Permissions fixed"

# Step 6: Restart PM2
echo ""
echo "🔄 Step 6: Restarting PM2..."
pm2 restart hcuniversity-app
sleep 2

# Step 7: Verify
echo ""
echo "🔍 Step 7: Checking PM2 logs..."
pm2 logs hcuniversity-app --lines 10 --nostream

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "📋 Verification:"
echo "   1. Check logs: pm2 logs hcuniversity-app --lines 20"
echo "   2. Look for: '✅ Found index.html at: ...'"
echo "   3. Test site: https://app.humancatalystbeacon.com"
echo ""
