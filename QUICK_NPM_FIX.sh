#!/bin/bash
# Quick fix for npm install issues
# Run this on your production server

set -e

cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🔧 FIXING NPM INSTALL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Clean
echo "Step 1: Cleaning..."
rm -rf node_modules package-lock.json .cache node_modules/.cache
echo "✅ Cleaned"
echo ""

# Step 2: Clear cache
echo "Step 2: Clearing npm cache..."
npm cache clean --force
echo "✅ Cache cleared"
echo ""

# Step 3: Install
echo "Step 3: Installing dependencies..."
echo "   (This takes 5-10 minutes)"
npm install --legacy-peer-deps --force

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install failed!"
    echo "Try: npm install --legacy-peer-deps"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Step 4: Verify
echo "Step 4: Verifying installation..."
if [ ! -d "node_modules/react" ]; then
    echo "❌ React not installed!"
    exit 1
fi
if [ ! -d "node_modules/express" ]; then
    echo "❌ Express not installed!"
    exit 1
fi
if [ ! -d "node_modules/react-app-rewired" ]; then
    echo "❌ react-app-rewired not installed!"
    exit 1
fi
echo "✅ All critical packages installed"
echo ""

# Step 5: Rebuild
echo "Step 5: Rebuilding..."
npm run build

if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Step 6: Restart
echo "Step 6: Restarting PM2..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi
pm2 restart hcuniversity-app
echo "✅ PM2 restarted"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DONE!"
echo ""

