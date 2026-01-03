#!/bin/bash
# Fix EAGAIN build error (resource exhaustion during minification)
# Run this on your production server

set -e

cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🔧 FIXING BUILD EAGAIN ERROR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check system resources
echo "📋 Step 1: Checking system resources..."
echo "   Memory:"
free -h | head -2
echo ""
echo "   Disk space:"
df -h . | tail -1
echo ""

# Step 2: Clean build
echo "📋 Step 2: Cleaning old build..."
rm -rf build
echo "   ✅ Cleaned"
echo ""

# Step 3: Build WITHOUT minification (fixes EAGAIN)
echo "📋 Step 3: Building WITHOUT minification..."
echo "   (This avoids the EAGAIN error during Terser minification)"
echo ""

GENERATE_SOURCEMAP=false BUILD_NO_MINIFY=true NODE_OPTIONS='--max-old-space-size=4096' npm run build 2>&1 | tee build.log

# Check if build succeeded
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    echo ""
    echo "   ❌ Build failed!"
    echo "   Checking build.log for errors..."
    grep -i "error\|failed\|ERR" build.log | tail -20
    exit 1
fi

# Verify build
if grep -q "static/js" build/index.html; then
    echo "   ✅ Build successful (unminified)"
else
    echo "   ⚠️  Build completed but index.html might be incomplete"
fi
echo ""

# Step 4: Alternative - Build with light settings if above fails
if [ ! -f "build/index.html" ] || ! grep -q "static/js" build/index.html; then
    echo "📋 Step 4: Trying light build (no sourcemaps, reduced memory)..."
    rm -rf build
    GENERATE_SOURCEMAP=false NODE_OPTIONS='--max-old-space-size=2048' npm run build:light 2>&1 | tee build-light.log
    
    if [ ! -f "build/index.html" ]; then
        echo "   ❌ Light build also failed"
        exit 1
    fi
    echo "   ✅ Light build successful"
    echo ""
fi

# Step 5: Fix permissions
echo "📋 Step 5: Fixing permissions..."
chmod -R 755 build
find build -type f -exec chmod 644 {} \;
echo "   ✅ Permissions fixed"
echo ""

# Step 6: Restart PM2
echo "📋 Step 6: Restarting PM2..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi
pm2 restart hcuniversity-app
echo "   ✅ PM2 restarted"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE!"
echo ""
echo "Note: Build is unminified (larger files but works)"
echo "To minify later when you have more resources, use:"
echo "  npm run build"
echo ""

