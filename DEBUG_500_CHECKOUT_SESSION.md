# 🐛 Debug Error 500 - create-checkout-session

## 📋 Étape 1 : Vérifier les Logs Détaillés dans Supabase

Le log que vous avez partagé montre une erreur 500, mais pas le message d'erreur. Pour voir l'erreur exacte :

1. **Allez dans Supabase Dashboard** :
   - https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
   - Cliquez sur **create-checkout-session**
   - Cliquez sur l'onglet **Logs**

2. **Cherchez la dernière erreur** (celle avec le timestamp `1768041312548000`)

3. **Regardez les logs de console** - vous devriez voir :
   - `❌ STRIPE_SECRET_KEY is missing or empty` (si secret manquant)
   - `❌ Error creating checkout session:` (si autre erreur)
   - `Error details:` avec le message exact

## 🔍 Causes Probables

### Cause 1 : Secret Manquant (Le Plus Probable)

La fonction vérifie 5 secrets. Si l'un manque, elle retourne 500 avec un message clair :

- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `SUPABASE_URL` - URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service role
- `SUPABASE_ANON_KEY` - Clé anon
- `SITE_URL` - URL de votre site

**Solution** : Vérifiez dans Supabase Dashboard → Edge Functions → create-checkout-session → Settings → Secrets

### Cause 2 : Erreur Stripe API

Si tous les secrets sont configurés, l'erreur peut venir de Stripe :

- Clé Stripe invalide ou expirée
- Price ID invalide
- Problème réseau avec Stripe

**Solution** : Les logs améliorés montreront maintenant l'erreur Stripe exacte

### Cause 3 : Erreur de Parsing du Body

Si le body de la requête n'est pas valide JSON ou manque de champs.

**Solution** : Les logs améliorés montreront maintenant cette erreur

## ✅ Solution : Vérifier les Secrets

### Méthode 1 : Via Supabase Dashboard (Recommandé)

1. Allez sur : https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Cliquez sur **create-checkout-session**
3. Cliquez sur **Settings** (ou **Secrets**)
4. Vérifiez que ces 5 secrets existent :

```
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (longue clé JWT)
SUPABASE_ANON_KEY=eyJ... (clé JWT plus courte)
SITE_URL=https://app.humancatalystbeacon.com
```

### Méthode 2 : Via CLI

```bash
# Lister les secrets (si vous avez accès CLI)
supabase secrets list --project-ref mbffycgrqfeesfnhhcdm
```

## 🔧 Améliorations Apportées

J'ai amélioré la fonction pour :

1. ✅ **Meilleur logging** - Logs plus détaillés de chaque étape
2. ✅ **Gestion d'erreur améliorée** - Capture toutes les erreurs possibles
3. ✅ **Logs de parsing** - Montre si le body est mal formé
4. ✅ **Logs Stripe** - Montre les erreurs Stripe API en détail

## 📤 Déployer la Version Améliorée

### Option A : Via Dashboard (Le Plus Simple)

1. Ouvrez `supabase/functions/create-checkout-session/index.ts`
2. Copiez tout le code
3. Allez dans Supabase Dashboard → Edge Functions → create-checkout-session
4. Collez le code dans l'éditeur
5. Cliquez sur **Deploy**

### Option B : Via CLI

```bash
cd /Users/conesaleo/hcuniversity/hcuniversity
supabase functions deploy create-checkout-session --project-ref mbffycgrqfeesfnhhcdm
```

## 🧪 Test Après Déploiement

1. **Déployez la fonction améliorée**
2. **Vérifiez les secrets** (étape ci-dessus)
3. **Testez un checkout** depuis votre application
4. **Vérifiez les logs** dans Supabase Dashboard
5. **Regardez le message d'erreur exact** dans les logs

Les nouveaux logs vous diront exactement quel est le problème ! 🎯
