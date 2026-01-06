#!/bin/bash
# Fix production environment variables for sign up/sign in
# Run this on the production server: ~/domains/humancatalystbeacon.com/public_html/app

set -e

echo "🔧 Fixing Production Environment Variables..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to production directory
cd ~/domains/humancatalystbeacon.com/public_html/app

# Check for .env file
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    echo "   ❌ ERROR: No .env or .env.production file found!"
    echo "   Please create .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY"
    exit 1
fi

# Verify .env has required variables
if [ -f ".env" ]; then
    echo "   ✅ Found .env file"
    if ! grep -q "REACT_APP_SUPABASE_URL" .env || ! grep -q "REACT_APP_SUPABASE_ANON_KEY" .env; then
        echo "   ❌ ERROR: .env file missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY"
        exit 1
    fi
    echo "   ✅ .env contains required Supabase variables"
elif [ -f ".env.production" ]; then
    echo "   ✅ Found .env.production file"
    if ! grep -q "REACT_APP_SUPABASE_URL" .env.production || ! grep -q "REACT_APP_SUPABASE_ANON_KEY" .env.production; then
        echo "   ❌ ERROR: .env.production missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY"
        exit 1
    fi
    echo "   ✅ .env.production contains required Supabase variables"
fi

echo ""
echo "🔨 Rebuilding with environment variables..."
echo "   (Create React App will automatically load .env during build)"
echo ""

# Rebuild the application
echo "   Building application..."
rm -rf build
NODE_ENV=production npm run build:no-minify

# Verify build
if [ ! -f "build/index.html" ]; then
    echo "   ❌ Build failed!"
    exit 1
fi

echo "   ✅ Build successful!"
echo ""

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart hcuniversity-app
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE!"
echo ""
echo "🌐 Test sign up/sign in at: https://humancatalystbeacon.com"
echo ""
echo "📝 If issues persist, check browser console for errors"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

