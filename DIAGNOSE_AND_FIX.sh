#!/bin/bash
# Comprehensive diagnostic and fix for post-git-pull issues
# Run this on your production server

set -e

echo "🔍 COMPREHENSIVE DIAGNOSTIC & FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/domains/humancatalystbeacon.com/public_html/app

# Step 1: Test if Node.js server is actually working
echo "📋 Step 1: Testing Node.js server directly..."
if curl -s http://localhost:3001/ > /dev/null 2>&1; then
    echo "   ✅ Node.js server is responding on port 3001"
    RESPONSE=$(curl -s http://localhost:3001/ | head -20)
    if echo "$RESPONSE" | grep -q "root\|React\|<!DOCTYPE"; then
        echo "   ✅ Server is returning HTML content"
    else
        echo "   ⚠️  Server response doesn't look like HTML"
        echo "   Response preview: $RESPONSE"
    fi
else
    echo "   ❌ Node.js server is NOT responding on port 3001"
    echo "   Check PM2: pm2 list"
    echo "   Check logs: pm2 logs hcuniversity-app"
fi
echo ""

# Step 2: Check what actually changed in git
echo "📋 Step 2: Analyzing git changes..."
if [ -d ".git" ]; then
    echo "   Recent commits:"
    git log --oneline -3
    echo ""
    
    # Check if server.js changed
    if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q "server.js"; then
        echo "   ⚠️  server.js was modified in recent commit"
        echo "   Changes:"
        git diff HEAD~1 HEAD -- server.js | grep -E "^\+|^\-" | grep -v "^+++\|^---" | head -15
        echo ""
    fi
    
    # Check if package.json changed
    if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q "package.json"; then
        echo "   ⚠️  package.json was modified - dependencies may have changed"
    fi
    
    # Check if config-overrides changed
    if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q "config-overrides"; then
        echo "   ⚠️  config-overrides.js was modified - build config changed"
    fi
else
    echo "   ⚠️  Not a git repository or .git directory missing"
fi
echo ""

# Step 3: Check build directory
echo "📋 Step 3: Checking build directory..."
if [ -d "build" ]; then
    echo "   ✅ Build directory exists"
    
    if [ -f "build/index.html" ]; then
        FILE_SIZE=$(stat -c%s build/index.html 2>/dev/null || stat -f%z build/index.html 2>/dev/null || echo "0")
        echo "   ✅ index.html exists: $FILE_SIZE bytes"
        
        # Check if it references JS files
        if grep -q "static/js" build/index.html; then
            echo "   ✅ index.html contains JavaScript references"
            # Check if those files exist
            FIRST_JS=$(grep -o "static/js/[^\"]*" build/index.html | head -1)
            if [ -n "$FIRST_JS" ] && [ -f "build/$FIRST_JS" ]; then
                echo "   ✅ Referenced JS file exists: $FIRST_JS"
            else
                echo "   ❌ Referenced JS file MISSING: $FIRST_JS"
                echo "   This means the build is incomplete!"
            fi
        else
            echo "   ❌ index.html does NOT contain JavaScript references"
            echo "   This is a template file, not a built file!"
            echo "   First 30 lines of index.html:"
            head -30 build/index.html
        fi
    else
        echo "   ❌ index.html MISSING"
    fi
    
    # Check static directory
    if [ -d "build/static" ]; then
        JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
        CSS_COUNT=$(find build/static/css -name "*.css" 2>/dev/null | wc -l)
        echo "   📊 Static files: $JS_COUNT JS, $CSS_COUNT CSS"
        if [ "$JS_COUNT" -eq 0 ]; then
            echo "   ❌ No JavaScript files found - build is incomplete!"
        fi
    else
        echo "   ❌ build/static directory MISSING"
    fi
else
    echo "   ❌ Build directory does NOT exist"
fi
echo ""

# Step 4: Check PM2 status
echo "📋 Step 4: Checking PM2..."
pm2 list | grep hcuniversity-app || echo "   ⚠️  hcuniversity-app not found in PM2"
echo ""

# Step 5: Check recent PM2 logs
echo "📋 Step 5: Recent PM2 logs..."
pm2 logs hcuniversity-app --lines 15 --nostream 2>/dev/null | tail -15 || echo "   ⚠️  Could not get PM2 logs"
echo ""

# Step 6: Check if Apache is interfering
echo "📋 Step 6: Checking for Apache/nginx interference..."
if [ -f ".htaccess" ]; then
    echo "   ✅ .htaccess file exists"
    if grep -q "RewriteRule.*localhost:3001" .htaccess; then
        echo "   ✅ .htaccess is configured to proxy to Node.js"
    else
        echo "   ⚠️  .htaccess might not be proxying correctly"
        echo "   Check .htaccess for RewriteRule to localhost:3001"
    fi
else
    echo "   ⚠️  No .htaccess file - Apache might be serving files directly"
fi
echo ""

# Step 7: Provide fix options
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 RECOMMENDED FIXES"
echo ""

# Fix 1: If build is incomplete
if [ ! -f "build/index.html" ] || ! grep -q "static/js" build/index.html 2>/dev/null; then
    echo "Fix 1: Rebuild (build appears incomplete)"
    echo "  rm -rf build node_modules/.cache"
    echo "  npm install --legacy-peer-deps"
    echo "  npm run build"
    echo "  pm2 restart hcuniversity-app"
    echo ""
fi

# Fix 2: If server.js might be the issue
if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q "server.js"; then
    echo "Fix 2: Rollback server.js (if my changes broke it)"
    echo "  git checkout HEAD~1 -- server.js"
    echo "  pm2 restart hcuniversity-app"
    echo ""
fi

# Fix 3: If Node.js isn't responding
if ! curl -s http://localhost:3001/ > /dev/null 2>&1; then
    echo "Fix 3: Restart PM2 (server not responding)"
    echo "  pm2 delete hcuniversity-app"
    echo "  export \$(grep -v '^#' server.env | xargs)"
    echo "  pm2 start server.js --name hcuniversity-app"
    echo "  pm2 save"
    echo ""
fi

# Fix 4: Full clean rebuild
echo "Fix 4: Nuclear option - Full clean rebuild"
echo "  rm -rf build node_modules node_modules/.cache"
echo "  npm install --legacy-peer-deps"
echo "  npm run build"
echo "  pm2 delete hcuniversity-app"
echo "  export \$(grep -v '^#' server.env | xargs)"
echo "  pm2 start server.js --name hcuniversity-app"
echo "  pm2 save"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

