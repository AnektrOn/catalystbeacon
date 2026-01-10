# ⚠️ Syntaxe Correcte pour Stripe FDW

## Problème : Colonne "status" n'existe pas

L'erreur `column "status" does not exist` se produit parce que les tables Stripe FDW stockent les données dans une colonne JSONB `attrs`, pas dans des colonnes directes.

## ✅ Solution : Utiliser `attrs->>'field_name'`

### Syntaxe Correcte

```sql
-- ❌ INCORRECT (ne fonctionne pas)
SELECT id, customer, status
FROM stripe.subscriptions
WHERE status = 'active';

-- ✅ CORRECT (fonctionne)
SELECT id, customer, attrs->>'status' as status
FROM stripe.subscriptions
WHERE attrs->>'status' = 'active';
```

## 📋 Champs Disponibles dans les Tables Stripe FDW

### Table `stripe.subscriptions`

**Colonnes directes :**
- `id` (text)
- `customer` (text)
- `currency` (text)
- `current_period_start` (timestamp)
- `current_period_end` (timestamp)
- `attrs` (jsonb) - **Contient toutes les autres données**

**Champs dans `attrs` (utilisez `attrs->>'field_name'`) :**
- `status` → `attrs->>'status'`
- `items` → `attrs->'items'`
- `metadata` → `attrs->'metadata'`
- `cancel_at_period_end` → `attrs->>'cancel_at_period_end'`
- Et tous les autres champs Stripe...

### Exemples de Requêtes Correctes

#### 1. Voir les abonnements actifs
```sql
SELECT 
  id,
  customer,
  attrs->>'status' as status,
  current_period_start,
  current_period_end
FROM stripe.subscriptions
WHERE attrs->>'status' = 'active';
```

#### 2. Voir les items d'un abonnement
```sql
SELECT 
  id,
  customer,
  attrs->'items'->'data' as items,
  attrs->'items'->'data'->0->'price'->>'id' as price_id
FROM stripe.subscriptions
WHERE id = 'sub_xxx';
```

#### 3. Filtrer par plusieurs statuts
```sql
SELECT 
  id,
  customer,
  attrs->>'status' as status
FROM stripe.subscriptions
WHERE attrs->>'status' IN ('active', 'trialing', 'past_due');
```

#### 4. Accéder aux métadonnées
```sql
SELECT 
  id,
  customer,
  attrs->>'status' as status,
  attrs->'metadata'->>'user_id' as user_id
FROM stripe.subscriptions
WHERE attrs->'metadata'->>'user_id' = 'xxx';
```

## 🔍 Comment Découvrir la Structure

### Voir toutes les colonnes directes
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'stripe'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;
```

### Voir un exemple d'objet `attrs`
```sql
SELECT 
  id,
  attrs
FROM stripe.subscriptions
LIMIT 1;
```

Cela vous montrera la structure JSON complète.

### Extraire des champs spécifiques
```sql
-- Voir tous les champs disponibles dans attrs pour un abonnement
SELECT 
  id,
  jsonb_object_keys(attrs) as field_name
FROM stripe.subscriptions
WHERE id = 'sub_xxx';
```

## 📚 Opérateurs JSONB PostgreSQL

| Opérateur | Description | Exemple |
|-----------|-------------|---------|
| `->` | Obtenir un objet JSON | `attrs->'items'` |
| `->>` | Obtenir un texte | `attrs->>'status'` |
| `#>` | Obtenir un chemin | `attrs#>'{items,data,0}'` |
| `#>>` | Obtenir un texte par chemin | `attrs#>>'{items,data,0,price,id}'` |

## 🎯 Requêtes Complètes Corrigées

### Synchroniser un abonnement
```sql
WITH stripe_sub AS (
  SELECT 
    id,
    customer,
    attrs->>'status' as status,
    current_period_start,
    current_period_end,
    attrs->'items'->'data'->0->'price'->>'recurring'->>'interval' as plan_type
  FROM stripe.subscriptions
  WHERE id = 'sub_xxx'
)
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  current_period_start,
  current_period_end,
  plan_type
)
SELECT 
  p.id,
  stripe_sub.customer,
  stripe_sub.id,
  stripe_sub.status,
  TO_TIMESTAMP(stripe_sub.current_period_start),
  TO_TIMESTAMP(stripe_sub.current_period_end),
  COALESCE(stripe_sub.plan_type, 'monthly')
FROM stripe_sub
JOIN profiles p ON p.stripe_customer_id = stripe_sub.customer
ON CONFLICT (stripe_subscription_id) DO UPDATE SET
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  updated_at = NOW();
```

### Comparer Stripe avec votre DB
```sql
SELECT 
  s.id as stripe_subscription_id,
  s.attrs->>'status' as stripe_status,
  sub.status as db_status,
  s.customer
FROM stripe.subscriptions s
LEFT JOIN subscriptions sub ON sub.stripe_subscription_id = s.id
WHERE s.attrs->>'status' != COALESCE(sub.status, 'none')
  OR sub.id IS NULL;
```

## ⚠️ Erreurs Courantes

### Erreur 1 : `column "status" does not exist`
**Cause :** Utilisation de `status` au lieu de `attrs->>'status'`
**Solution :** Utilisez `attrs->>'status'`

### Erreur 2 : `operator does not exist: jsonb = text`
**Cause :** Utilisation de `=` avec `->` au lieu de `->>`
**Solution :** Utilisez `attrs->>'status' = 'active'` (avec `->>`) au lieu de `attrs->'status' = 'active'`

### Erreur 3 : `cannot extract element from a scalar`
**Cause :** Tentative d'extraire un élément d'une valeur scalaire
**Solution :** Vérifiez que vous accédez au bon niveau dans le JSON

## 💡 Astuce

Pour déboguer, commencez par voir la structure complète :

```sql
-- Voir la structure complète d'un abonnement
SELECT 
  id,
  customer,
  attrs,
  current_period_start,
  current_period_end
FROM stripe.subscriptions
WHERE id = 'sub_xxx';
```

Ensuite, extrayez progressivement les champs dont vous avez besoin.

## 📖 Référence

- [Documentation PostgreSQL JSONB](https://www.postgresql.org/docs/current/functions-json.html)
- [Documentation Supabase Stripe FDW](https://supabase.com/docs/guides/database/extensions/wrappers/stripe)
