# 🔧 Fix "Error creating checkout session" (500)

## Problème
L'Edge Function `create-checkout-session` retourne **500** car des secrets ne sont pas configurés.

## Solution : Configurer les secrets dans Supabase

### Étape 1 : Aller dans Supabase Dashboard

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet
3. Allez dans **Edge Functions** → **create-checkout-session**
4. Cliquez sur **Settings** (ou **Secrets**)

### Étape 2 : Configurer les secrets requis

L'Edge Function nécessite ces 5 secrets :

#### 1. `STRIPE_SECRET_KEY`
- **Valeur** : Votre clé secrète Stripe (commence par `sk_test_` ou `sk_live_`)
- **Où la trouver** : Stripe Dashboard → Developers → API keys → Secret key

#### 2. `SUPABASE_URL`
- **Valeur** : L'URL de votre projet Supabase
- **Format** : `https://mbffycgrqfeesfnhhcdm.supabase.co`
- **Où la trouver** : Supabase Dashboard → Settings → API → Project URL

#### 3. `SUPABASE_SERVICE_ROLE_KEY`
- **Valeur** : La clé service_role (⚠️ SECRÈTE, ne jamais exposer au frontend)
- **Où la trouver** : Supabase Dashboard → Settings → API → service_role key

#### 4. `SUPABASE_ANON_KEY`
- **Valeur** : La clé anon (publishable)
- **Où la trouver** : Supabase Dashboard → Settings → API → anon public key

#### 5. `SITE_URL`
- **Valeur** : L'URL de votre site de production
- **Format** : `https://app.humancatalystbeacon.com`
- **Note** : Utilisée pour les URLs de redirection après paiement

### Étape 3 : Vérifier la configuration

Après avoir ajouté tous les secrets, testez l'Edge Function :

1. Allez dans **Edge Functions** → **create-checkout-session** → **Logs**
2. Essayez de créer un checkout depuis votre application
3. Vérifiez les logs pour voir si l'erreur persiste

### Étape 4 : Vérifier les logs

Si l'erreur persiste, les logs vous diront quel secret manque :

- `❌ STRIPE_SECRET_KEY is missing or empty`
- `❌ SUPABASE_URL is missing or empty`
- `❌ SUPABASE_SERVICE_ROLE_KEY is missing or empty`
- `❌ SUPABASE_ANON_KEY is missing or empty`
- `❌ SITE_URL is missing or empty`

## Alternative : Utiliser l'API Server (Fallback)

Si vous ne pouvez pas configurer les secrets maintenant, l'application utilise automatiquement l'API server en fallback (ce qui fonctionne déjà d'après vos logs).

Mais pour une meilleure performance et fiabilité, configurez les secrets Supabase.

## Vérification

Après configuration, testez à nouveau le paiement. Vous devriez voir dans les logs :
- `✅ Checkout session created successfully`
- Pas d'erreur 500
