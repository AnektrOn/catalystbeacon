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
    
    # Create PM2 ecosystem file to pass env vars
    cat > ecosystem.config.js << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'hcuniversity-app',
    script: 'server.js',
    env_file: './server.env',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
ECOSYSTEM
    echo "✅ PM2 ecosystem.config.js created"
else
    echo "⚠️  server.env not found, PM2 will use process.env"
fi

# Start PM2 with environment file
echo ""
echo "Starting PM2 server..."

# Delete existing process if it exists
pm2 delete hcuniversity-app 2>/dev/null || true

# Load env vars into current shell
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
    echo "✅ Environment variables exported to shell"
    echo "   STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:7}... (length: ${#STRIPE_SECRET_KEY})"
fi

# Start PM2 - it will inherit env vars from shell, and server.js will also load from server.env
pm2 start server.js --name hcuniversity-app --update-env
pm2 save

echo ""
echo "📋 Verifying PM2 process..."
pm2 describe hcuniversity-app | grep -E "(status|pid|pm2 env|exec cwd)" || true

echo ""
echo "✅ Server started!"
pm2 status hcuniversity-app

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Website: https://app.humancatalystbeacon.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

