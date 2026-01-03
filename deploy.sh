#!/bin/bash
# Complete deployment script - avoids EAGAIN errors
# Usage: bash deploy.sh

set -e

cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🚀 Deploying HC University..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code..."
git pull origin main
echo "   ✅ Code updated"
echo ""

# Step 2: Clean and reinstall dependencies
echo "📦 Step 2: Installing dependencies..."
rm -rf node_modules package-lock.json .cache node_modules/.cache
npm cache clean --force
npm install --legacy-peer-deps --force
echo "   ✅ Dependencies installed"
echo ""

# Step 3: Build without minification (avoids EAGAIN error)
echo "🔨 Step 3: Building (without minification)..."
rm -rf build
npm run build:no-minify
echo ""

# Step 4: Verify build
echo "📋 Step 4: Verifying build..."
if [ ! -f "build/index.html" ]; then
    echo "   ❌ Build failed - index.html missing!"
    exit 1
fi

if ! grep -q "static/js" build/index.html; then
    echo "   ❌ Build incomplete - missing JS references!"
    exit 1
fi

JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
echo "   ✅ Build successful: $JS_COUNT JavaScript files"
echo ""

# Step 5: Fix permissions
echo "🔧 Step 5: Fixing permissions..."
chmod -R 755 build
find build -type f -exec chmod 644 {} \;
echo "   ✅ Permissions fixed"
echo ""

# Step 6: Restart PM2
echo "🔄 Step 6: Restarting PM2..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi
pm2 restart hcuniversity-app
pm2 save
echo "   ✅ PM2 restarted"
echo ""

# Step 7: Check status
echo "📊 Step 7: Checking status..."
sleep 2
pm2 list | grep hcuniversity-app
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Website: https://app.humancatalystbeacon.com"
echo ""
echo "📝 Next time, just run: bash deploy.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

