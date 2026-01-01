#!/bin/bash
# Deploy HC University Roadmap to Production
# Server path: ~/domains/humancatalystbeacon.com/public_html/app

echo "🚀 Deploying Ignition Roadmap to humancatalystbeacon.com..."

# Navigate to project
cd ~/domains/humancatalystbeacon.com/public_html/app

# Pull latest changes from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Restart the application
echo "🔄 Restarting application..."

# Try PM2 first
if command -v pm2 &> /dev/null; then
    echo "Using PM2..."
    pm2 restart hcuniversity || pm2 restart all
elif systemctl list-units --type=service | grep -q hcuniversity; then
    echo "Using systemd..."
    sudo systemctl restart hcuniversity
else
    echo "⚠️  Could not auto-restart. Please restart manually."
    echo "Try: pm2 restart all"
fi

echo "✅ Deployment complete!"
echo ""
echo "🌐 Visit: https://humancatalystbeacon.com/roadmap/ignition"
echo ""
echo "⚠️  Don't forget to update Supabase database!"
echo "Go to: https://supabase.com/dashboard"
echo "Run SQL: UPDATE course_metadata SET masterschool = 'Ignition' WHERE course_id IN (SELECT course_id FROM course_metadata LIMIT 20);"

