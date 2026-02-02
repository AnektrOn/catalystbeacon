#!/bin/bash
# Capacitor Setup Script
# This script initializes Capacitor and sets up iOS and Android platforms

set -e

echo "🚀 Setting up Capacitor for HC Beacon..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "📦 Building React app first..."
    npm run build
fi

# Initialize Capacitor if not already initialized
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚙️  Initializing Capacitor..."
    npx cap init "HC Beacon" "com.hcuniversity.beacon" --web-dir=build
else
    echo "✅ Capacitor config already exists"
fi

# Add iOS platform if not exists
if [ ! -d "ios" ]; then
    echo "🍎 Adding iOS platform..."
    npx cap add ios
else
    echo "✅ iOS platform already exists"
fi

# Add Android platform if not exists
if [ ! -d "android" ]; then
    echo "🤖 Adding Android platform..."
    npx cap add android
else
    echo "✅ Android platform already exists"
fi

# Sync web assets to native platforms
echo "🔄 Syncing web assets to native platforms..."
npx cap sync

echo ""
echo "✅ Capacitor setup complete!"
echo ""
echo "Next steps:"
echo "  - iOS:   npm run open:ios"
echo "  - Android: npm run open:android"
echo "  - Build & sync: npm run build:mobile"
