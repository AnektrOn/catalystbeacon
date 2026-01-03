#!/bin/bash
# Fix npm install issues that cause 404/405 errors
# Run this on your production server

set -e

echo "🔧 FIXING NPM INSTALL ISSUES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/domains/humancatalystbeacon.com/public_html/app

# Step 1: Check Node.js and npm versions
echo "📋 Step 1: Checking Node.js and npm versions..."
node --version
npm --version
echo ""

# Step 2: Clean everything
echo "📋 Step 2: Cleaning node_modules and caches..."
rm -rf node_modules
rm -rf node_modules/.cache
rm -rf .cache
rm -f package-lock.json
echo "   ✅ Cleaned"
echo ""

# Step 3: Clear npm cache
echo "📋 Step 3: Clearing npm cache..."
npm cache clean --force
echo "   ✅ Cache cleared"
echo ""

# Step 4: Reinstall with legacy peer deps
echo "📋 Step 4: Installing dependencies..."
echo "   (This may take 5-10 minutes)"
npm install --legacy-peer-deps --verbose 2>&1 | tee npm-install.log

# Check for errors
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "   ❌ npm install failed!"
    echo "   Checking for common errors..."
    grep -i "error\|failed\|ERR" npm-install.log | tail -20
    echo ""
    echo "   Try: npm install --legacy-peer-deps --force"
    exit 1
fi

echo "   ✅ Dependencies installed"
echo ""

# Step 5: Verify critical dependencies
echo "📋 Step 5: Verifying critical dependencies..."
MISSING_DEPS=0

check_dep() {
    if [ -d "node_modules/$1" ]; then
        echo "   ✅ $1 installed"
    else
        echo "   ❌ $1 MISSING!"
        MISSING_DEPS=1
    fi
}

check_dep "express"
check_dep "react"
check_dep "react-dom"
check_dep "react-router-dom"
check_dep "@supabase/supabase-js"
check_dep "react-app-rewired"

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    echo "   ⚠️  Some dependencies are missing!"
    echo "   Try: npm install --legacy-peer-deps --force"
    exit 1
fi
echo ""

# Step 6: Rebuild
echo "📋 Step 6: Rebuilding application..."
NODE_OPTIONS='--max-old-space-size=4096' npm run build 2>&1 | tee build.log

# Check if build succeeded
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    echo ""
    echo "   ❌ Build failed!"
    echo "   Checking build.log for errors..."
    grep -i "error\|failed\|ERR" build.log | tail -20
    exit 1
fi

echo "   ✅ Build successful"
echo ""

# Step 7: Restart PM2
echo "📋 Step 7: Restarting PM2..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi

pm2 delete hcuniversity-app 2>/dev/null || true
pm2 start server.js --name hcuniversity-app
pm2 save

echo "   ✅ PM2 restarted"
echo ""

# Step 8: Check logs
echo "📋 Step 8: Checking PM2 logs..."
sleep 2
pm2 logs hcuniversity-app --lines 10 --nostream
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE!"
echo ""
echo "If you still have issues, check:"
echo "  - npm-install.log for installation errors"
echo "  - build.log for build errors"
echo "  - pm2 logs hcuniversity-app for runtime errors"
echo ""

