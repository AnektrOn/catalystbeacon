# Instructions pour corriger le problème de mise à jour du rôle après paiement

## Problème identifié
Le webhook Stripe n'est pas appelé, donc le rôle utilisateur n'est pas mis à jour après un paiement réussi.

## Solutions implémentées

### 1. Nouvelle Edge Function `update-role-from-session`
- **Fichier**: `supabase/functions/update-role-from-session/index.ts`
- **Fonction**: Met à jour directement le rôle depuis la session Stripe
- **Status**: ✅ Créée mais **NON DÉPLOYÉE**

### 2. Amélioration du Dashboard
- **Fichier**: `src/pages/Dashboard.jsx`
- **Changements**: 
  - Ajout de fallbacks multiples pour mettre à jour le rôle
  - Appel à l'API serveur `/api/payment-success` en priorité
  - Appel à l'Edge Function `update-role-from-session` en fallback
  - Logs améliorés pour le débogage
- **Status**: ✅ Code modifié mais nécessite un **rebuild et redéploiement**

## Actions requises

### Étape 1: Déployer l'Edge Function `update-role-from-session`

```bash
cd /Users/conesaleo/hcuniversity/hcuniversity
supabase functions deploy update-role-from-session --no-verify-jwt
```

**OU** via Supabase Dashboard:
1. Aller dans Supabase Dashboard → Edge Functions
2. Cliquer sur "Deploy new function"
3. Sélectionner le dossier `supabase/functions/update-role-from-session`
4. Déployer

### Étape 2: Configurer les secrets de l'Edge Function

Dans Supabase Dashboard → Edge Functions → Secrets, s'assurer que ces secrets sont configurés:
- `STRIPE_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Étape 3: Rebuild et redéployer l'application frontend

```bash
npm run build
# Puis déployer le build sur votre serveur
```

### Étape 4: Configurer le webhook Stripe (RECOMMANDÉ)

Pour que le webhook fonctionne automatiquement:

1. Aller dans Stripe Dashboard → Developers → Webhooks
2. Cliquer sur "Add endpoint"
3. URL: `https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/stripe-webhook`
4. Sélectionner les événements:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copier le "Signing secret" (commence par `whsec_`)
6. Dans Supabase Dashboard → Edge Functions → Secrets:
   - Ajouter `STRIPE_WEBHOOK_SECRET` avec la valeur copiée

## Test

1. Effectuer un nouveau paiement test
2. Vérifier les logs dans la console du navigateur
3. Vérifier que le rôle passe de "Free" à "Student" ou "Teacher"
4. Si ça ne fonctionne pas, vérifier les logs de l'API serveur et des Edge Functions

## Fallbacks en place

Le système a maintenant plusieurs mécanismes de secours:
1. **RPC Function** `sync_single_subscription_from_stripe` (si elle existe)
2. **Edge Function** `get-subscription-from-session` + RPC sync
3. **API Serveur** `/api/payment-success` (le plus fiable)
4. **Edge Function** `update-role-from-session` (nouvelle, si déployée)
5. **Webhook Stripe** (si configuré)

## Notes importantes

- L'API serveur (`/api/payment-success`) est la méthode la plus fiable car elle existe déjà et fonctionne
- L'Edge Function `update-role-from-session` doit être déployée pour être utilisée
- Le webhook Stripe est la solution idéale pour une mise à jour automatique
