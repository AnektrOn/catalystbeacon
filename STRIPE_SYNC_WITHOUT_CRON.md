# 🔄 Synchronisation Stripe Sans pg_cron

## ⚠️ Problème : pg_cron n'est pas disponible

Si vous obtenez l'erreur `schema "cron" does not exist`, cela signifie que `pg_cron` n'est pas disponible sur votre instance Supabase.

## ✅ Solutions Alternatives

### Option 1 : Synchronisation Manuelle (Simple)

Appelez la fonction manuellement quand nécessaire :

```sql
-- Synchroniser tous les abonnements
SELECT * FROM sync_all_subscriptions_from_stripe();
```

**Quand l'utiliser :**
- Après un paiement réussi
- Après une modification d'abonnement
- Régulièrement (quotidiennement) en manuel

### Option 2 : Endpoint API (Recommandé)

Créez un endpoint dans votre `server.js` qui appelle la fonction :

```javascript
// Dans server.js
app.post('/api/sync-stripe-subscriptions', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('sync_all_subscriptions_from_stripe');
    
    if (error) {
      console.error('Error syncing subscriptions:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      synced: data[0].synced_count,
      errors: data[0].error_count,
      details: data[0].details
    });
  } catch (error) {
    console.error('Exception syncing subscriptions:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**Appeler depuis le frontend ou un cron externe :**
```javascript
// Depuis le frontend ou un service externe
fetch('/api/sync-stripe-subscriptions', { method: 'POST' });
```

### Option 3 : Service Externe (Cron Job)

Utilisez un service externe pour appeler votre endpoint :

#### Avec GitHub Actions (Gratuit)
```yaml
# .github/workflows/sync-stripe.yml
name: Sync Stripe Subscriptions

on:
  schedule:
    - cron: '0 * * * *'  # Toutes les heures
  workflow_dispatch:  # Permet de déclencher manuellement

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync Stripe
        run: |
          curl -X POST https://votre-app.com/api/sync-stripe-subscriptions
```

#### Avec Vercel Cron (Gratuit)
```javascript
// vercel.json
{
  "crons": [{
    "path": "/api/sync-stripe-subscriptions",
    "schedule": "0 * * * *"
  }]
}
```

#### Avec un Service de Cron Externe
- [cron-job.org](https://cron-job.org) (gratuit)
- [EasyCron](https://www.easycron.com) (gratuit jusqu'à 1 job)
- [Cronitor](https://cronitor.io) (gratuit jusqu'à 5 monitors)

### Option 4 : Déclencher depuis les Webhooks

Synchronisez automatiquement quand un événement Stripe se produit :

```javascript
// Dans server.js, dans votre webhook handler
case 'customer.subscription.updated':
case 'customer.subscription.created':
case 'customer.subscription.deleted':
  // ... votre code existant ...
  
  // Ajouter la synchronisation
  try {
    await supabase.rpc('sync_single_subscription_from_stripe', {
      p_stripe_subscription_id: subscription.id
    });
  } catch (syncError) {
    console.error('Error syncing subscription:', syncError);
    // Ne pas faire échouer le webhook pour ça
  }
  break;
```

## 🎯 Recommandation

Pour votre cas, je recommande **Option 2 + Option 4** :
1. Créer l'endpoint API
2. L'appeler depuis les webhooks Stripe
3. Optionnel : L'appeler manuellement quand nécessaire

## 📝 Exemple Complet : Endpoint + Webhook

### 1. Ajouter l'endpoint dans server.js

```javascript
// Synchroniser les abonnements Stripe
app.post('/api/sync-stripe-subscriptions', async (req, res) => {
  try {
    console.log('🔄 Syncing all subscriptions from Stripe...');
    
    const { data, error } = await supabase.rpc('sync_all_subscriptions_from_stripe');
    
    if (error) {
      console.error('❌ Error syncing subscriptions:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
    
    const result = data[0];
    console.log('✅ Sync completed:', {
      synced: result.synced_count,
      errors: result.error_count
    });
    
    res.json({
      success: true,
      synced: result.synced_count,
      errors: result.error_count,
      details: result.details
    });
  } catch (error) {
    console.error('❌ Exception syncing subscriptions:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
```

### 2. Appeler depuis les webhooks

```javascript
// Dans handleCheckoutSessionCompleted, handleSubscriptionCreated, etc.
// Après avoir mis à jour la DB, synchroniser aussi
try {
  const { data: syncResult } = await supabase.rpc('sync_single_subscription_from_stripe', {
    p_stripe_subscription_id: subscription.id
  });
  
  if (syncResult && syncResult[0] && syncResult[0].success) {
    console.log('✅ Subscription synced via FDW:', syncResult[0].message);
  }
} catch (syncError) {
  console.warn('⚠️ FDW sync failed (non-critical):', syncError.message);
  // Ne pas faire échouer le webhook pour ça
}
```

## 🔍 Vérification

Testez votre endpoint :

```bash
# Depuis le terminal
curl -X POST http://localhost:3001/api/sync-stripe-subscriptions

# Ou depuis le frontend
fetch('/api/sync-stripe-subscriptions', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

## ✅ Avantages de cette Approche

1. ✅ Pas besoin de pg_cron
2. ✅ Synchronisation en temps réel via webhooks
3. ✅ Endpoint disponible pour synchronisation manuelle
4. ✅ Peut être appelé depuis n'importe où
5. ✅ Logs détaillés dans votre serveur

---

**Besoin d'aide ?** Consultez `STRIPE_SYNC_COMPLETE.md` pour plus de détails.
