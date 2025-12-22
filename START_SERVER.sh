#!/bin/bash
# Start PM2 server

set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

echo "🚀 STARTING SERVER..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/domains/humancatalystbeacon.com/public_html/app

# Check if server.env exists
if [ ! -f "server.env" ]; then
    echo "⚠️  server.env is missing! Creating template..."
    cat > server.env << 'SERVERENV'
PORT=3001
NODE_ENV=production
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
SERVERENV
    echo "   ⚠️  Update server.env with your actual SUPABASE_SERVICE_ROLE_KEY"
    echo ""
fi

# Load environment variables
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
    echo "✅ Environment variables loaded"
fi

# Start PM2
echo ""
echo "Starting PM2 server..."
pm2 start server.js --name hcuniversity-app
pm2 save

echo ""
echo "✅ Server started!"
pm2 status hcuniversity-app

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Website: https://app.humancatalystbeacon.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

