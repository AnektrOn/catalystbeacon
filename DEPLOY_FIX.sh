#!/bin/bash
# Fix deployment issues - 404/405/dummy index.html
# Run this on your production server

set -e

echo "🔧 FIXING DEPLOYMENT ISSUES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to project directory
cd ~/domains/humancatalystbeacon.com/public_html/app

echo "📋 Step 1: Checking current directory..."
pwd
echo "   ✅ Current directory: $(pwd)"
echo ""

# Step 2: Check if build directory exists and what's in it
echo "📋 Step 2: Checking build directory..."
if [ -d "build" ]; then
    echo "   ✅ Build directory exists"
    echo "   📊 Build directory contents:"
    ls -la build/ | head -20
    echo ""
    
    # Check if index.html exists
    if [ -f "build/index.html" ]; then
        echo "   ✅ index.html exists"
        # Check if it has the React app script tags
        if grep -q "static/js" build/index.html; then
            echo "   ✅ index.html contains bundled JavaScript references"
        else
            echo "   ⚠️  WARNING: index.html exists but doesn't contain bundled JS!"
            echo "   This means the build didn't complete properly."
        fi
    else
        echo "   ❌ ERROR: index.html NOT found in build directory!"
    fi
    
    # Check if static directory exists
    if [ -d "build/static" ]; then
        echo "   ✅ static directory exists"
        JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
        CSS_COUNT=$(find build/static/css -name "*.css" 2>/dev/null | wc -l)
        echo "   📊 Found $JS_COUNT JS files and $CSS_COUNT CSS files"
        if [ "$JS_COUNT" -eq 0 ]; then
            echo "   ❌ ERROR: No JavaScript files found! Build is incomplete."
        fi
    else
        echo "   ❌ ERROR: static directory NOT found in build!"
    fi
else
    echo "   ❌ ERROR: Build directory does NOT exist!"
fi
echo ""

# Step 3: Clean build directory
echo "📋 Step 3: Cleaning old build..."
rm -rf build
echo "   ✅ Old build removed"
echo ""

# Step 4: Check Node.js version
echo "📋 Step 4: Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js version: $NODE_VERSION"
else
    echo "   ❌ ERROR: Node.js not found!"
    exit 1
fi

# Check npm version
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm version: $NPM_VERSION"
else
    echo "   ❌ ERROR: npm not found!"
    exit 1
fi
echo ""

# Step 5: Install dependencies
echo "📋 Step 5: Installing dependencies..."
echo "   (This may take a few minutes)"
npm install --legacy-peer-deps
echo "   ✅ Dependencies installed"
echo ""

# Step 6: Build the application
echo "📋 Step 6: Building application..."
echo "   (This may take 3-5 minutes)"
echo "   Building with increased memory limit..."
NODE_OPTIONS='--max-old-space-size=4096' npm run build

# Verify build succeeded
if [ ! -d "build" ]; then
    echo "   ❌ ERROR: Build failed - build directory not created!"
    exit 1
fi

if [ ! -f "build/index.html" ]; then
    echo "   ❌ ERROR: Build failed - index.html not created!"
    exit 1
fi

# Check if static files were created
if [ ! -d "build/static" ]; then
    echo "   ❌ ERROR: Build failed - static directory not created!"
    exit 1
fi

JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
if [ "$JS_COUNT" -eq 0 ]; then
    echo "   ❌ ERROR: Build failed - no JavaScript files created!"
    exit 1
fi

echo "   ✅ Build completed successfully"
echo "   📊 Build contains:"
echo "      - index.html: ✅"
echo "      - JavaScript files: $JS_COUNT"
CSS_COUNT=$(find build/static/css -name "*.css" 2>/dev/null | wc -l)
echo "      - CSS files: $CSS_COUNT"
echo ""

# Step 7: Fix permissions
echo "📋 Step 7: Fixing permissions..."
chmod -R 755 build
find build -type f -exec chmod 644 {} \;
echo "   ✅ Permissions fixed"
echo ""

# Step 8: Check PM2 status
echo "📋 Step 8: Checking PM2 status..."
if command -v pm2 &> /dev/null; then
    pm2 list
    echo ""
    
    # Check if hcuniversity-app is running
    if pm2 list | grep -q "hcuniversity-app"; then
        echo "   ✅ PM2 process 'hcuniversity-app' found"
        
        # Get the working directory of the PM2 process
        PM2_CWD=$(pm2 jlist | grep -A 10 "hcuniversity-app" | grep "cwd" | cut -d'"' -f4 || echo "")
        if [ -n "$PM2_CWD" ]; then
            echo "   📁 PM2 working directory: $PM2_CWD"
            CURRENT_DIR=$(pwd)
            if [ "$PM2_CWD" != "$CURRENT_DIR" ]; then
                echo "   ⚠️  WARNING: PM2 is running from different directory!"
                echo "   Current: $CURRENT_DIR"
                echo "   PM2: $PM2_CWD"
            fi
        fi
    else
        echo "   ⚠️  PM2 process 'hcuniversity-app' not found"
    fi
else
    echo "   ⚠️  PM2 not found"
fi
echo ""

# Step 9: Check server.js location
echo "📋 Step 9: Verifying server.js..."
if [ -f "server.js" ]; then
    echo "   ✅ server.js exists in current directory"
    # Check if server.js references build directory correctly
    if grep -q "path.join(__dirname, 'build')" server.js; then
        echo "   ✅ server.js correctly references build directory"
    else
        echo "   ⚠️  WARNING: server.js might not reference build directory correctly"
    fi
else
    echo "   ❌ ERROR: server.js not found in current directory!"
    exit 1
fi
echo ""

# Step 10: Check server.env
echo "📋 Step 10: Checking server.env..."
if [ -f "server.env" ]; then
    echo "   ✅ server.env exists"
    if grep -q "PORT" server.env; then
        PORT=$(grep "^PORT=" server.env | cut -d'=' -f2)
        echo "   📊 PORT: ${PORT:-3001 (default)}"
    fi
else
    echo "   ⚠️  WARNING: server.env not found"
fi
echo ""

# Step 11: Restart PM2 with proper environment
echo "📋 Step 11: Restarting PM2 server..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi

# Delete old process if it exists
pm2 delete hcuniversity-app 2>/dev/null || true

# Start fresh
echo "   Starting PM2 from: $(pwd)"
pm2 start server.js --name hcuniversity-app
pm2 save

echo "   ✅ PM2 server restarted"
echo ""

# Step 12: Check PM2 logs
echo "📋 Step 12: Checking PM2 logs (last 20 lines)..."
pm2 logs hcuniversity-app --lines 20 --nostream
echo ""

# Step 13: Verify build directory is accessible
echo "📋 Step 13: Verifying build files..."
if [ -f "build/index.html" ]; then
    # Check file size (should be more than a few bytes)
    FILE_SIZE=$(stat -f%z build/index.html 2>/dev/null || stat -c%s build/index.html 2>/dev/null || echo "0")
    if [ "$FILE_SIZE" -lt 1000 ]; then
        echo "   ⚠️  WARNING: index.html is very small ($FILE_SIZE bytes) - might be empty!"
    else
        echo "   ✅ index.html size: $FILE_SIZE bytes"
    fi
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT FIX COMPLETE!"
echo ""
echo "📊 Summary:"
echo "   ✅ Build directory cleaned and rebuilt"
echo "   ✅ Permissions fixed"
echo "   ✅ PM2 server restarted"
echo ""
echo "🌐 Next steps:"
echo "   1. Check PM2 status: pm2 list"
echo "   2. Check PM2 logs: pm2 logs hcuniversity-app"
echo "   3. Visit your website and check browser console (F12)"
echo "   4. If still having issues, check:"
echo "      - Is Apache/nginx proxying correctly to port 3001?"
echo "      - Are there any errors in PM2 logs?"
echo "      - Is the build directory accessible?"
echo ""
echo "🔍 Debug commands:"
echo "   pm2 logs hcuniversity-app --lines 50"
echo "   ls -la build/"
echo "   cat build/index.html | head -50"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

