#!/bin/bash
# Rollback server.js to previous version if my changes broke it
# Run this on your production server

cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🔄 Rolling back server.js to previous version..."
echo ""

# Check if git is available
if [ -d ".git" ]; then
    # Show what changed
    echo "Changes I made to server.js:"
    git diff HEAD~1 HEAD -- server.js | head -30
    echo ""
    
    # Rollback
    echo "Rolling back..."
    git checkout HEAD~1 -- server.js
    
    if [ $? -eq 0 ]; then
        echo "✅ server.js rolled back"
        echo ""
        echo "Restarting PM2..."
        pm2 restart hcuniversity-app
        echo "✅ Done"
    else
        echo "❌ Rollback failed"
        echo "Try manually: git checkout HEAD~1 -- server.js"
    fi
else
    echo "❌ Not a git repository"
    echo "Cannot rollback automatically"
    echo ""
    echo "Manual fix: Restore server.js from backup or previous commit"
fi

