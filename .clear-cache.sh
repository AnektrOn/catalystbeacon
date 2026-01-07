#!/bin/bash
echo "Clearing all caches..."
rm -rf node_modules/.cache
rm -rf .eslintcache
rm -rf build
rm -rf .next
find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null
find . -name "*.cache" -delete 2>/dev/null
echo "✅ All caches cleared!"
echo "Please restart your dev server with: npm start"
