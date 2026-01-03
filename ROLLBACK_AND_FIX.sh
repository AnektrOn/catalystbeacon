#!/bin/bash
# Rollback to working state and identify what broke
# Run this on your production server

set -e

echo "🔍 DIAGNOSING POST-GIT-PULL ISSUES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/domains/humancatalystbeacon.com/public_html/app

# Step 1: Check git status and recent commits
echo "📋 Step 1: Checking git history..."
echo "   Recent commits:"
git log --oneline -5
echo ""

# Step 2: Check what files changed
echo "📋 Step 2: Checking what changed in recent commits..."
RECENT_COMMIT=$(git log -1 --format="%H")
echo "   Files changed in latest commit:"
git diff --name-only HEAD~1 HEAD | head -20
echo ""

# Step 3: Check if server.js was modified
if git diff HEAD~1 HEAD --name-only | grep -q "server.js"; then
    echo "   ⚠️  server.js was modified in recent commit"
    echo "   Changes to server.js:"
    git diff HEAD~1 HEAD -- server.js | head -30
    echo ""
fi

# Step 4: Check current build state
echo "📋 Step 3: Checking current build state..."
if [ -d "build" ]; then
    echo "   ✅ Build directory exists"
    if [ -f "build/index.html" ]; then
        FILE_SIZE=$(stat -c%s build/index.html 2>/dev/null || stat -f%z build/index.html 2>/dev/null || echo "0")
        echo "   ✅ index.html exists: $FILE_SIZE bytes"
        
        # Check if it has the bundled JS
        if grep -q "static/js" build/index.html; then
            echo "   ✅ index.html contains JavaScript references"
            JS_REFS=$(grep -o "static/js/[^\"]*" build/index.html | head -3)
            echo "   📊 JS files referenced:"
            for ref in $JS_REFS; do
                if [ -f "build/$ref" ]; then
                    echo "      ✅ $ref exists"
                else
                    echo "      ❌ $ref MISSING!"
                fi
            done
        else
            echo "   ❌ index.html does NOT contain JavaScript references!"
            echo "   This means the build didn't bundle the JS properly"
        fi
    else
        echo "   ❌ index.html MISSING"
    fi
else
    echo "   ❌ Build directory does NOT exist"
fi
echo ""

# Step 5: Check PM2 status
echo "📋 Step 4: Checking PM2 status..."
pm2 list
echo ""

# Step 6: Check PM2 logs for errors
echo "📋 Step 5: Checking PM2 error logs..."
if pm2 logs hcuniversity-app --lines 10 --err --nostream 2>/dev/null | grep -q "."; then
    echo "   Recent errors:"
    pm2 logs hcuniversity-app --lines 10 --err --nostream
else
    echo "   ✅ No recent errors in logs"
fi
echo ""

# Step 7: Check if node_modules needs update
echo "📋 Step 6: Checking dependencies..."
if [ -f "package.json" ] && [ -f "package-lock.json" ]; then
    # Check if package.json changed
    if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
        echo "   ⚠️  package.json was modified - dependencies may have changed"
        echo "   Changes to package.json:"
        git diff HEAD~1 HEAD -- package.json | grep -E "^\+|^\-" | grep -v "^+++\|^---" | head -20
        echo ""
        echo "   💡 You may need to run: npm install"
    fi
fi
echo ""

# Step 8: Check config-overrides.js
if [ -f "config-overrides.js" ]; then
    echo "📋 Step 7: Checking config-overrides.js..."
    if git diff HEAD~1 HEAD --name-only | grep -q "config-overrides.js"; then
        echo "   ⚠️  config-overrides.js was modified"
        echo "   This could affect the build output!"
    fi
    echo "   Current config-overrides.js:"
    head -15 config-overrides.js
    echo ""
fi

# Step 9: Provide fix options
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 RECOMMENDED FIXES"
echo ""
echo "Option 1: Clean rebuild (if build is the issue)"
echo "  rm -rf build node_modules/.cache"
echo "  npm install --legacy-peer-deps"
echo "  npm run build"
echo "  pm2 restart hcuniversity-app"
echo ""

echo "Option 2: Rollback server.js (if server.js changes broke it)"
echo "  git checkout HEAD~1 -- server.js"
echo "  pm2 restart hcuniversity-app"
echo ""

echo "Option 3: Full rollback to previous commit"
echo "  git log --oneline -5  # Find the working commit"
echo "  git checkout <commit-hash>"
echo "  npm install --legacy-peer-deps"
echo "  npm run build"
echo "  pm2 restart hcuniversity-app"
echo ""

echo "Option 4: Check if it's an Apache vs Node.js conflict"
echo "  # Test if Node.js is serving correctly:"
echo "  curl http://localhost:3001/"
echo "  # If this works, the issue is Apache configuration"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

