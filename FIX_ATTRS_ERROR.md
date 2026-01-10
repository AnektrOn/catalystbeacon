# 🔧 Fix Erreur : "operator does not exist: text ->> unknown"

## 🚨 Problème

L'erreur signifie que `attrs` dans la table `stripe.subscriptions` n'est pas de type JSONB comme prévu, ou n'existe pas.

## ✅ Solution : Vérifier d'Abord la Structure

### Étape 1 : Vérifier le Type de attrs

Dans **Supabase SQL Editor**, exécutez :

```sql
-- Voir le type de attrs
SELECT 
  id,
  pg_typeof(attrs) as attrs_type,
  attrs IS NOT NULL as has_attrs
FROM stripe.subscriptions
LIMIT 1;
```

**Partagez-moi le résultat !** Cela m'aidera à corriger la fonction.

### Étape 2 : Voir la Structure Complète

```sql
-- Voir toutes les colonnes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'stripe'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;
```

### Étape 3 : Tester l'Accès à attrs

```sql
-- Test 1 : Voir attrs directement
SELECT id, attrs FROM stripe.subscriptions LIMIT 1;

-- Test 2 : Essayer avec CAST
SELECT id, (attrs::JSONB)->>'status' FROM stripe.subscriptions LIMIT 1;
```

---

## 🔧 Solution Temporaire : Version Simplifiée

J'ai créé une version simplifiée de la fonction qui gère les erreurs :

**Fichier :** `supabase/migrations/sync_stripe_subscriptions_v2.sql`

Cette version :
- ✅ Détecte automatiquement le type de `attrs`
- ✅ Gère les erreurs gracieusement
- ✅ Utilise des valeurs par défaut si `attrs` n'est pas accessible

### Pour l'Utiliser :

1. **Exécutez d'abord le test** (Étape 1 ci-dessus) et partagez-moi le résultat
2. **Ensuite**, je corrigerai la fonction principale selon le type réel de `attrs`

---

## 🆘 Solution Rapide : Utiliser l'API Stripe Directement

Si le FDW ne fonctionne pas bien, on peut utiliser l'API Stripe directement dans le webhook (ce qu'on fait déjà en fallback).

**Mais d'abord, partagez-moi le résultat du test pour que je puisse corriger la fonction FDW correctement !**

---

**Exécutez le test et partagez-moi le résultat !** 🔍
