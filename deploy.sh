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

# Step 3: Ensure environment variables are available for build
echo "🔧 Step 3a: Checking environment variables..."
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    echo "   ❌ ERROR: No .env or .env.production file found!"
    echo "   Please create .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY"
    exit 1
fi

# Create React App automatically loads .env files, but we'll verify they exist
if [ -f ".env" ]; then
    echo "   ✅ Found .env file"
    # Verify critical variables exist in .env (without exposing values)
    if grep -q "REACT_APP_SUPABASE_URL" .env && grep -q "REACT_APP_SUPABASE_ANON_KEY" .env; then
        echo "   ✅ .env contains required Supabase variables"
    else
        echo "   ❌ ERROR: .env file missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY"
        exit 1
    fi
elif [ -f ".env.production" ]; then
    echo "   ✅ Found .env.production file"
    if grep -q "REACT_APP_SUPABASE_URL" .env.production && grep -q "REACT_APP_SUPABASE_ANON_KEY" .env.production; then
        echo "   ✅ .env.production contains required Supabase variables"
    else
        echo "   ❌ ERROR: .env.production missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY"
        exit 1
    fi
fi
echo ""

# Step 3: Build without minification (avoids EAGAIN error)
echo "🔨 Step 3b: Building (without minification)..."
rm -rf build
echo "   Building with NODE_ENV=production..."
echo "   (This may take 3-5 minutes, please wait...)"
echo ""

# Run build and capture output
BUILD_OUTPUT=$(NODE_ENV=production npm run build:no-minify 2>&1)
BUILD_EXIT_CODE=$?

# Display build output
echo "$BUILD_OUTPUT"

# Check if build failed
if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "   ❌ Build failed with exit code: $BUILD_EXIT_CODE"
    echo "   📋 Last 20 lines of build output:"
    echo "$BUILD_OUTPUT" | tail -20
    echo ""
    echo "   💡 Common fixes:"
    echo "      - Check for syntax errors in the code"
    echo "      - Verify all dependencies are installed"
    echo "      - Try: rm -rf node_modules/.cache && npm run build:no-minify"
    exit 1
fi

echo ""
echo "   ✅ Build command completed"
echo ""

# Step 4: Verify build
echo "📋 Step 4: Verifying build..."
if [ ! -f "build/index.html" ]; then
    echo "   ❌ Build failed - index.html missing!"
    echo ""
    echo "   🔍 Troubleshooting steps:"
    echo "      1. Check if build directory exists: ls -la build/"
    echo "      2. Check build errors above"
    echo "      3. Try running: bash diagnose-build.sh"
    echo "      4. Check for syntax errors in recent code changes"
    echo ""
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

