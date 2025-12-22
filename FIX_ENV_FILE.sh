#!/bin/bash
# Fix .env file on server

set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

echo "🔧 FIXING .env FILE..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/domains/humancatalystbeacon.com/public_html/app

# Check if .env exists
if [ -f ".env" ]; then
    echo "📋 Current .env file:"
    cat .env
    echo ""
    echo "⚠️  If the Supabase keys are missing or have placeholders, you need to update them!"
else
    echo "❌ .env file is MISSING!"
    echo "   Creating template..."
    cat > .env << 'ENV'
REACT_APP_SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE

REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID=price_YOUR_ID_HERE
REACT_APP_STRIPE_STUDENT_YEARLY_PRICE_ID=price_YOUR_ID_HERE
REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID=price_YOUR_ID_HERE
REACT_APP_STRIPE_TEACHER_YEARLY_PRICE_ID=price_YOUR_ID_HERE

REACT_APP_SITE_NAME=The Human Catalyst University
REACT_APP_SITE_URL=https://app.humancatalystbeacon.com

NODE_ENV=production
ENV
    chmod 644 .env
    echo "   ✅ Template created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your actual Supabase keys!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 To fix the error:"
echo ""
echo "1. Edit the .env file:"
echo "   nano ~/domains/humancatalystbeacon.com/public_html/app/.env"
echo ""
echo "2. Make sure these lines have your ACTUAL keys (not placeholders):"
echo "   REACT_APP_SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co"
echo "   REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here"
echo ""
echo "3. After updating, rebuild:"
echo "   npm run build"
echo "   pm2 restart hcuniversity-app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

