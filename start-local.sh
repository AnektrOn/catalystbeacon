#!/bin/bash
# Start both frontend and backend locally for development

echo "🚀 Starting Local Development Environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file is missing!"
    echo "   Create .env file with your Supabase keys"
    echo ""
fi

# Check if server.env exists
if [ ! -f "server.env" ]; then
    echo "⚠️  server.env file is missing!"
    echo "   Create server.env file with your server keys"
    echo ""
fi

echo "📦 Installing dependencies (if needed)..."
npm install --legacy-peer-deps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Ready to start!"
echo ""
echo "📝 You need to run TWO terminals:"
echo ""
echo "Terminal 1 (Frontend):"
echo "   npm start"
echo "   → Opens http://localhost:3000"
echo ""
echo "Terminal 2 (Backend):"
echo "   export \$(grep -v '^#' server.env | xargs)"
echo "   node server.js"
echo "   → Runs on http://localhost:3001"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if they want to start frontend now
read -p "Start frontend now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting frontend..."
    npm start
fi

