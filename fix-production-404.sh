#!/bin/bash
# Fix Production 404 Error - Missing Build Directory
# Run this on your production server

set -e

echo "🔧 Fixing Production 404 Error..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get the app directory (adjust path if needed)
APP_DIR="${1:-~/domains/humancatalystbeacon.com/public_html/app}"

echo "📂 App directory: $APP_DIR"
cd "$APP_DIR" || exit 1

echo ""
echo "🔍 Step 1: Checking build directory..."
if [ -d "build" ] && [ -f "build/index.html" ]; then
    echo "   ✅ Build directory exists"
    echo "   ✅ index.html found"
    ls -la build/index.html
else
    echo "   ❌ Build directory missing or incomplete"
    echo "   🔨 Rebuilding..."
    
    # Remove old build
    rm -rf build
    
    # Rebuild
    echo "   Building (this may take 3-5 minutes)..."
    npm run build:no-minify
    
    # Verify
    if [ -f "build/index.html" ]; then
        echo "   ✅ Build successful!"
    else
        echo "   ❌ Build failed - index.html still missing"
        exit 1
    fi
fi

echo ""
echo "🔍 Step 2: Checking PM2 status..."
PM2_INFO=$(pm2 jlist | grep -A 10 "hcuniversity-app" || echo "")
if [ -z "$PM2_INFO" ]; then
    echo "   ⚠️  PM2 process not found"
    echo "   🚀 Starting PM2..."
    pm2 start server.js --name hcuniversity-app --cwd "$(pwd)"
    pm2 save
else
    echo "   ✅ PM2 process found"
    echo "   🔄 Restarting PM2..."
    pm2 restart hcuniversity-app
fi

echo ""
echo "🔍 Step 3: Verifying server is running..."
sleep 2
pm2 logs hcuniversity-app --lines 10 --nostream

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check PM2 logs: pm2 logs hcuniversity-app --lines 50"
echo "   2. Look for: 'Serving React app from: ...'"
echo "   3. Look for: 'Found index.html at: ...'"
echo "   4. Test your site: https://app.humancatalystbeacon.com"
echo ""
