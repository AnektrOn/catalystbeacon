# 🔧 Corriger une Erreur de Configuration Stripe FDW

## Problème : Erreur lors de la création du serveur Stripe

Si vous avez fait une erreur lors de l'étape 6 (CREATE SERVER), voici comment corriger :

## ✅ Solution : Supprimer et Recréer

### Étape 1 : Vérifier ce qui existe déjà

Exécutez cette requête pour voir ce qui est configuré :

```sql
-- Voir les serveurs Stripe existants
SELECT srvname, srvoptions
FROM pg_foreign_server
WHERE srvname LIKE '%stripe%';
```

### Étape 2 : Supprimer le serveur existant (si nécessaire)

Si vous avez créé un serveur avec une mauvaise clé, supprimez-le d'abord :

```sql
-- Supprimer le serveur Stripe existant
DROP SERVER IF EXISTS stripe_server CASCADE;
```

> ⚠️ **Note :** `CASCADE` supprimera aussi les tables étrangères. C'est normal, vous les recréerez après.

### Étape 3 : Supprimer les tables étrangères (si elles existent)

```sql
-- Supprimer toutes les tables du schéma stripe (si elles existent)
DROP SCHEMA IF EXISTS stripe CASCADE;
```

### Étape 4 : Recréer le secret dans Vault

Vous avez deux options :

#### Option A : Utiliser le secret existant (si vous connaissez le key_id)

Si vous avez noté le `key_id` de la première fois, vous pouvez le réutiliser directement à l'étape 5.

#### Option B : Créer un nouveau secret

```sql
-- Créer un nouveau secret avec votre clé Stripe
SELECT vault.create_secret(
  'sk_live_VOTRE_CLE_ICI',  -- ⚠️ REMPLACEZ par votre vraie clé API Stripe
  'stripe',
  'Stripe API key for Wrappers'
);
```

**Important :** Copiez le `key_id` retourné (exemple : `00000000-0000-0000-0000-000000000001`)

### Étape 5 : Recréer le serveur avec le bon key_id

**Remplacez `<key_ID>` par le key_id obtenu à l'étape 4 :**

```sql
-- Recréer le serveur Stripe avec le bon key_id
CREATE SERVER stripe_server
  FOREIGN DATA WRAPPER stripe_wrapper
  OPTIONS (
    api_key_id '<key_ID>',  -- ⚠️ REMPLACEZ par votre key_id
    api_url 'https://api.stripe.com/v1/',
    api_version '2024-06-20'
  );
```

### Étape 6 : Recréer le schéma

```sql
-- Recréer le schéma Stripe
CREATE SCHEMA IF NOT EXISTS stripe;
```

### Étape 7 : Réimporter les tables

```sql
-- Réimporter les tables Stripe
IMPORT FOREIGN SCHEMA stripe
  FROM SERVER stripe_server
  INTO stripe;
```

### Étape 8 : Vérifier que ça fonctionne

```sql
-- Tester la connexion
SELECT id, email, name
FROM stripe.customers
LIMIT 5;
```

## 🔍 Si vous ne connaissez pas votre key_id

### Méthode 1 : Lister tous les secrets Vault

```sql
-- Voir tous les secrets Stripe dans Vault
SELECT 
  id as key_id,
  name,
  description,
  created_at
FROM vault.secrets
WHERE name = 'stripe'
ORDER BY created_at DESC;
```

### Méthode 2 : Supprimer l'ancien secret et en créer un nouveau

```sql
-- Supprimer l'ancien secret (remplacez <old_key_id> par l'ID trouvé ci-dessus)
-- SELECT vault.delete_secret('<old_key_id>');

-- Créer un nouveau secret
SELECT vault.create_secret(
  'sk_live_VOTRE_CLE_ICI',
  'stripe',
  'Stripe API key for Wrappers'
);
```

## 📝 Script Complet de Correction

Voici le script complet pour tout refaire proprement :

```sql
-- ============================================
-- SCRIPT DE CORRECTION COMPLET
-- ============================================

-- 1. Supprimer l'ancien serveur et les tables
DROP SERVER IF EXISTS stripe_server CASCADE;
DROP SCHEMA IF EXISTS stripe CASCADE;

-- 2. Créer un nouveau secret (EXÉCUTEZ SEUL D'ABORD)
-- SELECT vault.create_secret(
--   'sk_live_VOTRE_CLE_ICI',  -- ⚠️ REMPLACEZ
--   'stripe',
--   'Stripe API key for Wrappers'
-- );
-- Copiez le key_id retourné

-- 3. Vérifier que le wrapper existe
CREATE FOREIGN DATA WRAPPER IF NOT EXISTS stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;

-- 4. Recréer le serveur (REMPLACEZ <key_ID>)
CREATE SERVER stripe_server
  FOREIGN DATA WRAPPER stripe_wrapper
  OPTIONS (
    api_key_id '<key_ID>',  -- ⚠️ REMPLACEZ par votre key_id
    api_url 'https://api.stripe.com/v1/',
    api_version '2024-06-20'
  );

-- 5. Recréer le schéma
CREATE SCHEMA IF NOT EXISTS stripe;

-- 6. Réimporter les tables
IMPORT FOREIGN SCHEMA stripe
  FROM SERVER stripe_server
  INTO stripe;

-- 7. Tester
SELECT id, email, name
FROM stripe.customers
LIMIT 5;
```

## 🚨 Erreurs Courantes et Solutions

### Erreur : "server 'stripe_server' already exists"
**Solution :** Exécutez d'abord `DROP SERVER IF EXISTS stripe_server CASCADE;`

### Erreur : "schema 'stripe' already exists"
**Solution :** Exécutez `DROP SCHEMA IF EXISTS stripe CASCADE;` puis recréez-le

### Erreur : "foreign data wrapper 'stripe_wrapper' does not exist"
**Solution :** Le wrapper n'existe pas. Exécutez :
```sql
CREATE FOREIGN DATA WRAPPER stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;
```

### Erreur : "authentication failed" lors du test
**Solution :** 
1. Vérifiez que votre clé API Stripe est correcte
2. Vérifiez que le `key_id` correspond bien au secret dans Vault
3. Essayez de créer un nouveau secret

## ✅ Vérification Finale

Pour vérifier que tout est bien configuré :

```sql
-- Vérifier le serveur
SELECT srvname, srvoptions
FROM pg_foreign_server
WHERE srvname = 'stripe_server';

-- Vérifier les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'stripe'
ORDER BY table_name
LIMIT 10;

-- Tester une requête
SELECT COUNT(*) as total_customers
FROM stripe.customers;
```

## 💡 Astuce

Si vous continuez à avoir des problèmes, il est parfois plus simple de tout supprimer et recommencer depuis le début :

```sql
-- Tout supprimer et recommencer
DROP SERVER IF EXISTS stripe_server CASCADE;
DROP SCHEMA IF EXISTS stripe CASCADE;
DROP FOREIGN DATA WRAPPER IF EXISTS stripe_wrapper CASCADE;

-- Puis suivez le guide STRIPE_FDW_SETUP_BEGINNER.md depuis le début
```

---

**Besoin d'aide ?** Si le problème persiste, vérifiez les logs Supabase ou consultez la section Dépannage du guide principal.
