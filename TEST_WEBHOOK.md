# 🧪 Guide de Test du Webhook Stripe

## Test Rapide

### 1. Vérifier que la fonction est déployée

```bash
supabase functions list
```

Vous devriez voir `stripe-webhook` dans la liste.

### 2. Tester avec Stripe CLI

```bash
# Installer Stripe CLI (si nécessaire)
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter et forwarder les événements
stripe listen --forward-to https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/stripe-webhook
```

Dans un autre terminal :

```bash
# Déclencher un événement de test
stripe trigger checkout.session.completed
```

### 3. Vérifier les logs

Dans **Supabase Dashboard** → **Edge Functions** → **stripe-webhook** → **Logs**, vous devriez voir :

```
📥 Webhook event received: checkout.session.completed
🔄 Processing checkout.session.completed: {...}
✅ Profile updated successfully
```

### 4. Test avec un Paiement Réel

1. Allez sur `https://app.humancatalystbeacon.com/pricing`
2. Cliquez sur "Subscribe" (plan Student ou Teacher)
3. Utilisez la carte de test : `4242 4242 4242 4242`
4. Date d'expiration : n'importe quelle date future (ex: `12/34`)
5. CVC : n'importe quel 3 chiffres (ex: `123`)
6. Complétez le paiement
7. Vérifiez dans Supabase Dashboard → Table Editor → `profiles` que le rôle a été mis à jour

## Vérification dans la Base de Données

Après un paiement réussi, vérifiez dans Supabase SQL Editor :

```sql
-- Vérifier le profil de l'utilisateur
SELECT 
  id,
  email,
  role,
  subscription_status,
  subscription_id,
  stripe_customer_id
FROM profiles
WHERE id = 'VOTRE_USER_ID';

-- Vérifier la table subscriptions
SELECT 
  user_id,
  stripe_subscription_id,
  status,
  plan_type,
  current_period_end
FROM subscriptions
WHERE user_id = 'VOTRE_USER_ID';
```

Le `role` devrait être `Student` ou `Teacher` (pas `Free`), et `subscription_status` devrait être `active`.
