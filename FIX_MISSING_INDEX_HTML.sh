#!/bin/bash
# Fix missing index.html issue
# Run this on your production server

set -e

echo "🔧 FIXING MISSING INDEX.HTML"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/domains/humancatalystbeacon.com/public_html/app

# Step 1: Check current state
echo "📋 Step 1: Checking current state..."
if [ -d "build" ]; then
    echo "   ✅ Build directory exists"
    if [ -f "build/index.html" ]; then
        echo "   ✅ index.html exists"
        FILE_SIZE=$(stat -c%s build/index.html 2>/dev/null || stat -f%z build/index.html 2>/dev/null || echo "0")
        echo "   📊 index.html size: $FILE_SIZE bytes"
        if [ "$FILE_SIZE" -lt 1000 ]; then
            echo "   ⚠️  WARNING: index.html is too small - might be incomplete"
        fi
    else
        echo "   ❌ index.html MISSING!"
    fi
    
    JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
    echo "   📊 JavaScript files: $JS_COUNT"
else
    echo "   ❌ Build directory does NOT exist"
fi
echo ""

# Step 2: Clean everything
echo "📋 Step 2: Cleaning old build and cache..."
rm -rf build
rm -rf node_modules/.cache
echo "   ✅ Cleaned"
echo ""

# Step 3: Verify dependencies
echo "📋 Step 3: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules missing, installing..."
    npm install --legacy-peer-deps
else
    echo "   ✅ node_modules exists"
fi
echo ""

# Step 4: Build with verbose output
echo "📋 Step 4: Building application..."
echo "   (This may take 3-5 minutes)"
echo "   Building with increased memory limit..."
NODE_OPTIONS='--max-old-space-size=4096' npm run build 2>&1 | tee build.log

# Step 5: Verify build
echo ""
echo "📋 Step 5: Verifying build..."
if [ ! -d "build" ]; then
    echo "   ❌ ERROR: Build directory not created!"
    echo "   Check build.log for errors:"
    grep -i error build.log | head -10
    exit 1
fi

if [ ! -f "build/index.html" ]; then
    echo "   ❌ ERROR: index.html not created!"
    echo "   Check build.log for errors:"
    grep -i error build.log | head -10
    exit 1
fi

FILE_SIZE=$(stat -c%s build/index.html 2>/dev/null || stat -f%z build/index.html 2>/dev/null || echo "0")
if [ "$FILE_SIZE" -lt 1000 ]; then
    echo "   ⚠️  WARNING: index.html is very small ($FILE_SIZE bytes)"
    echo "   Checking contents..."
    head -20 build/index.html
else
    echo "   ✅ index.html created: $FILE_SIZE bytes"
fi

# Check for JS files
JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
if [ "$JS_COUNT" -eq 0 ]; then
    echo "   ❌ ERROR: No JavaScript files found!"
    echo "   Build is incomplete. Check build.log for errors:"
    grep -i error build.log | head -10
    exit 1
else
    echo "   ✅ JavaScript files: $JS_COUNT"
fi

# Check if index.html references JS files
if grep -q "static/js" build/index.html; then
    echo "   ✅ index.html contains JavaScript references"
else
    echo "   ⚠️  WARNING: index.html doesn't reference JavaScript files!"
    echo "   First 50 lines of index.html:"
    head -50 build/index.html
fi
echo ""

# Step 6: Fix permissions
echo "📋 Step 6: Fixing permissions..."
chmod -R 755 build
find build -type f -exec chmod 644 {} \;
echo "   ✅ Permissions fixed"
echo ""

# Step 7: Restart PM2
echo "📋 Step 7: Restarting PM2 server..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi

pm2 delete hcuniversity-app 2>/dev/null || true
pm2 start server.js --name hcuniversity-app
pm2 save

echo "   ✅ PM2 restarted"
echo ""

# Step 8: Wait a moment and check logs
echo "📋 Step 8: Checking PM2 logs..."
sleep 2
pm2 logs hcuniversity-app --lines 10 --nostream

# Check for the warning
if pm2 logs hcuniversity-app --lines 50 --nostream | grep -q "index.html not found"; then
    echo ""
    echo "   ⚠️  WARNING: Still seeing 'index.html not found' in logs"
    echo "   Checking if file actually exists:"
    ls -la build/index.html
    echo "   File path PM2 sees:"
    pm2 logs hcuniversity-app --lines 5 --nostream | grep "Serving React app"
else
    echo ""
    echo "   ✅ No 'index.html not found' errors in logs"
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE!"
echo ""
echo "📊 Summary:"
echo "   ✅ Build directory: $(test -d build && echo 'EXISTS' || echo 'MISSING')"
echo "   ✅ index.html: $(test -f build/index.html && echo "EXISTS ($(stat -c%s build/index.html 2>/dev/null || stat -f%z build/index.html 2>/dev/null || echo 0) bytes)" || echo 'MISSING')"
echo "   ✅ JavaScript files: $(find build/static/js -name "*.js" 2>/dev/null | wc -l)"
echo "   ✅ PM2 status: $(pm2 list | grep hcuniversity-app | awk '{print $10}')"
echo ""
echo "🌐 Next steps:"
echo "   1. Visit your website"
echo "   2. Check browser console (F12) for errors"
echo "   3. Check PM2 logs: pm2 logs hcuniversity-app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

