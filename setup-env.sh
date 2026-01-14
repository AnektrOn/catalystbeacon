#!/bin/bash
# ============================================================
# SCRIPT DE CONFIGURATION ENVIRONNEMENT
# ============================================================
# Ce script vous guide pour créer vos fichiers .env et server.env
# ============================================================

set -e

echo "🚀 Configuration des fichiers d'environnement"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fonction pour demander une valeur avec validation optionnelle
ask_value() {
    local prompt=$1
    local var_name=$2
    local required=${3:-true}
    local default_value=${4:-""}
    
    if [ -n "$default_value" ]; then
        read -p "$prompt [$default_value]: " value
        value=${value:-$default_value}
    else
        read -p "$prompt: " value
    fi
    
    if [ "$required" = "true" ] && [ -z "$value" ]; then
        echo "❌ Cette valeur est requise!"
        ask_value "$prompt" "$var_name" "$required" "$default_value"
    else
        eval "$var_name='$value'"
    fi
}

# Collecte des informations
echo "📋 Veuillez fournir vos identifiants:"
echo ""

# Supabase
ask_value "Supabase URL" SUPABASE_URL
ask_value "Supabase Anon Key" SUPABASE_ANON_KEY
ask_value "Supabase Service Role Key" SUPABASE_SERVICE_ROLE_KEY

# Stripe
ask_value "Stripe Publishable Key (pk_live_... ou pk_test_...)" STRIPE_PUBLISHABLE_KEY
ask_value "Stripe Secret Key (sk_live_... ou sk_test_...)" STRIPE_SECRET_KEY
ask_value "Stripe Webhook Secret (whsec_...)" STRIPE_WEBHOOK_SECRET

# Stripe Price IDs
ask_value "Student Monthly Price ID (price_...)" STUDENT_MONTHLY_PRICE_ID
ask_value "Student Yearly Price ID (price_...)" STUDENT_YEARLY_PRICE_ID
ask_value "Teacher Monthly Price ID (price_...)" TEACHER_MONTHLY_PRICE_ID
ask_value "Teacher Yearly Price ID (price_...)" TEACHER_YEARLY_PRICE_ID

# N8N (optionnel)
read -p "N8N Webhook URL (optionnel, appuyez sur Entrée pour ignorer): " N8N_WEBHOOK_URL

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Création des fichiers..."
echo ""

# Création du fichier .env (Frontend)
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

echo "✅ Fichier .env créé"

# Création du fichier server.env (Backend)
cat > server.env << EOF
# Supabase Configuration (Backend - Service Role Key)
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Stripe Configuration (Secret Key - Private)
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# Stripe Price IDs (Backend - same as frontend)
STRIPE_STUDENT_MONTHLY_PRICE_ID=$STUDENT_MONTHLY_PRICE_ID
STRIPE_STUDENT_YEARLY_PRICE_ID=$STUDENT_YEARLY_PRICE_ID
STRIPE_TEACHER_MONTHLY_PRICE_ID=$TEACHER_MONTHLY_PRICE_ID
STRIPE_TEACHER_YEARLY_PRICE_ID=$TEACHER_YEARLY_PRICE_ID

# Server Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
ALLOWED_ORIGINS=https://app.humancatalystbeacon.com,https://humancatalystbeacon.com

# Email Configuration (N8N Webhook)
N8N_WEBHOOK_URL=$N8N_WEBHOOK_URL

# Site Configuration
SITE_URL=https://app.humancatalystbeacon.com
FROM_EMAIL=noreply@humancatalystbeacon.com
EOF

echo "✅ Fichier server.env créé"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuration terminée!"
echo ""
echo "📋 Fichiers créés:"
echo "   - .env (Frontend)"
echo "   - server.env (Backend)"
echo ""
echo "🔒 Sécurité: Assurez-vous que ces fichiers sont dans .gitignore"
echo "   (Ils ne doivent JAMAIS être commités sur GitHub)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
