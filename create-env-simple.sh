#!/bin/bash
cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🚀 Création du fichier .env (Frontend)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Demander les valeurs
echo "🔵 === SUPABASE ==="
echo -n "Supabase URL (ex: https://xxxxx.supabase.co): "
read SUPABASE_URL
echo -n "Supabase Anon Key (commence par eyJ...): "
read SUPABASE_ANON_KEY
echo ""

echo "💳 === STRIPE ==="
echo -n "Stripe Publishable Key (pk_live_... ou pk_test_...): "
read STRIPE_PUBLISHABLE_KEY
echo ""

echo "💰 === STRIPE PRICE IDs ==="
echo -n "Student Monthly Price ID (price_...): "
read STUDENT_MONTHLY_PRICE_ID
echo -n "Student Yearly Price ID (price_...): "
read STUDENT_YEARLY_PRICE_ID
echo -n "Teacher Monthly Price ID (price_...): "
read TEACHER_MONTHLY_PRICE_ID
echo -n "Teacher Yearly Price ID (price_...): "
read TEACHER_YEARLY_PRICE_ID
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Création du fichier .env..."
echo ""

# Créer le fichier .env
cat > .env << EOF
# Supabase Configuration
REACT_APP_SUPABASE_URL=$SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Stripe Configuration (Publishable Key - Public)
REACT_APP_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

# Stripe Price IDs
REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID=$STUDENT_MONTHLY_PRICE_ID
REACT_APP_STRIPE_STUDENT_YEARLY_PRICE_ID=$STUDENT_YEARLY_PRICE_ID
REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID=$TEACHER_MONTHLY_PRICE_ID
REACT_APP_STRIPE_TEACHER_YEARLY_PRICE_ID=$TEACHER_YEARLY_PRICE_ID

# API URL
REACT_APP_API_URL=https://app.humancatalystbeacon.com

# Optional: Logging Level
# REACT_APP_LOG_LEVEL=production
EOF

echo "✅ Fichier .env créé avec succès!"
echo ""
echo "🔍 Vérification:"
cat .env | grep REACT_APP_SUPABASE_URL
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
