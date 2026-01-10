# Guide Débutant : Configuration Stripe FDW dans Supabase

## 📋 Vue d'ensemble

Ce guide vous explique comment connecter votre base de données Supabase directement à Stripe, pour pouvoir interroger les données Stripe (abonnements, clients, etc.) directement depuis SQL.

**Temps estimé :** 15-20 minutes

## ✅ Prérequis

1. Un compte Supabase actif
2. Un compte Stripe actif
3. Accès à votre clé API Stripe secrète (Secret Key)

## 🔑 Étape 1 : Trouver votre clé API Stripe

1. Connectez-vous à votre [tableau de bord Stripe](https://dashboard.stripe.com/)
2. Allez dans **Developers** → **API keys**
3. Trouvez votre **Secret key** (commence par `sk_live_` pour la production ou `sk_test_` pour les tests)
4. **Copiez cette clé** - vous en aurez besoin à l'étape 3

> ⚠️ **Important :** Ne partagez jamais votre clé secrète publiquement !

## 🗄️ Étape 2 : Ouvrir l'éditeur SQL de Supabase

1. Connectez-vous à votre [tableau de bord Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New query** pour créer une nouvelle requête

## 🔧 Étape 3 : Activer l'extension Wrappers

Dans l'éditeur SQL, exécutez cette commande :

```sql
-- Activer l'extension Wrappers
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;
```

**Vérification :** Vous devriez voir "Success. No rows returned" en vert.

## 🔐 Étape 4 : Stocker votre clé Stripe dans Vault (Recommandé)

Vault est un système sécurisé de Supabase pour stocker les secrets. C'est plus sûr que de stocker la clé en texte clair.

**Remplacez `'sk_live_VOTRE_CLE_ICI'` par votre vraie clé API Stripe :**

```sql
-- Stocker la clé Stripe dans Vault
SELECT vault.create_secret(
  'sk_live_VOTRE_CLE_ICI',  -- ⚠️ REMPLACEZ par votre vraie clé
  'stripe',
  'Stripe API key for Wrappers'
);
```

**Important :** Cette commande retourne un `key_id`. **Copiez ce `key_id`** - vous en aurez besoin à l'étape suivante !

**Exemple de résultat :**
```
key_id
------
00000000-0000-0000-0000-000000000001
```

## 🔌 Étape 5 : Créer le Foreign Data Wrapper Stripe

Exécutez cette commande :

```sql
-- Créer le wrapper Stripe
CREATE FOREIGN DATA WRAPPER stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;
```

**Vérification :** "Success. No rows returned"

## 🌐 Étape 6 : Créer la connexion au serveur Stripe

**Remplacez `<key_ID>` par le `key_id` que vous avez obtenu à l'étape 4 :**

```sql
-- Créer la connexion au serveur Stripe
CREATE SERVER stripe_server
  FOREIGN DATA WRAPPER stripe_wrapper
  OPTIONS (
    api_key_id '<key_ID>',  -- ⚠️ REMPLACEZ par votre key_id de l'étape 4
    api_url 'https://api.stripe.com/v1/',
    api_version '2024-06-20'
  );
```

**Vérification :** "Success. No rows returned"

> ⚠️ **Erreur ?** Si vous avez fait une erreur ici (mauvaise clé, etc.), consultez le guide **`STRIPE_FDW_FIX_ERROR.md`** pour corriger.

## 📁 Étape 7 : Créer le schéma Stripe

```sql
-- Créer un schéma pour les tables Stripe
CREATE SCHEMA IF NOT EXISTS stripe;
```

**Vérification :** "Success. No rows returned"

## 📊 Étape 8 : Importer les tables Stripe

Vous avez deux options :

### Option A : Importer toutes les tables Stripe (Recommandé pour débutants)

```sql
-- Importer toutes les tables Stripe
IMPORT FOREIGN SCHEMA stripe
  FROM SERVER stripe_server
  INTO stripe;
```

### Option B : Importer seulement les tables nécessaires (Plus rapide)

Si vous voulez seulement les abonnements, clients et sessions de checkout :

```sql
-- Importer seulement les tables nécessaires
IMPORT FOREIGN SCHEMA stripe
  LIMIT TO ("subscriptions", "customers", "checkout_sessions", "events")
  FROM SERVER stripe_server
  INTO stripe;
```

**Vérification :** "Success. No rows returned"

## ✅ Étape 9 : Vérifier que ça fonctionne

Testez la connexion en interrogeant Stripe :

```sql
-- Tester : Lister les 5 premiers clients Stripe
SELECT id, email, name, created
FROM stripe.customers
LIMIT 5;
```

**Résultat attendu :** Vous devriez voir une liste de vos clients Stripe.

Si vous voyez une erreur, vérifiez :
- ✅ Que vous avez bien copié le `key_id` à l'étape 6
- ✅ Que votre clé API Stripe est correcte
- ✅ Que vous avez bien exécuté toutes les étapes précédentes

## 🎯 Étape 10 : Tester avec vos abonnements

```sql
-- Voir vos abonnements actifs dans Stripe
-- ⚠️ IMPORTANT : Le statut est dans attrs->>'status', pas dans une colonne directe
SELECT 
  id as stripe_subscription_id,
  customer as stripe_customer_id,
  attrs->>'status' as status,
  current_period_start,
  current_period_end
FROM stripe.subscriptions
WHERE attrs->>'status' = 'active'
LIMIT 10;
```

**Résultat attendu :** Liste de vos abonnements actifs.

> 💡 **Note :** Les tables Stripe FDW stockent les données dans `attrs` (JSONB). Utilisez `attrs->>'field_name'` pour accéder aux champs.

## 📝 Script complet (Copier-coller)

Si vous préférez exécuter tout d'un coup, voici le script complet :

```sql
-- ⚠️ ÉTAPE 1 : Remplacez 'sk_live_VOTRE_CLE_ICI' par votre vraie clé Stripe
-- ⚠️ ÉTAPE 2 : Exécutez d'abord cette ligne seule pour obtenir le key_id
-- ⚠️ ÉTAPE 3 : Remplacez '<key_ID>' dans la section CREATE SERVER par votre key_id

-- 1. Activer Wrappers
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;

-- 2. Stocker la clé Stripe dans Vault (EXÉCUTEZ D'ABORD CETTE LIGNE SEULE)
SELECT vault.create_secret(
  'sk_live_VOTRE_CLE_ICI',  -- ⚠️ REMPLACEZ
  'stripe',
  'Stripe API key for Wrappers'
);

-- 3. Créer le wrapper Stripe
CREATE FOREIGN DATA WRAPPER stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;

-- 4. Créer la connexion (REMPLACEZ <key_ID> par le key_id obtenu à l'étape 2)
CREATE SERVER stripe_server
  FOREIGN DATA WRAPPER stripe_wrapper
  OPTIONS (
    api_key_id '<key_ID>',  -- ⚠️ REMPLACEZ
    api_url 'https://api.stripe.com/v1/',
    api_version '2024-06-20'
  );

-- 5. Créer le schéma
CREATE SCHEMA IF NOT EXISTS stripe;

-- 6. Importer les tables (Option A : toutes les tables)
IMPORT FOREIGN SCHEMA stripe
  FROM SERVER stripe_server
  INTO stripe;

-- 7. Tester la connexion
SELECT id, email, name
FROM stripe.customers
LIMIT 5;
```

## 🔍 Vérification finale

Pour vérifier que tout est bien configuré, exécutez :

```sql
-- Vérifier que les tables Stripe existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'stripe'
ORDER BY table_name;
```

Vous devriez voir une liste de tables comme : `customers`, `subscriptions`, `checkout_sessions`, etc.

## 🚨 Dépannage

### Erreur : "extension 'wrappers' does not exist"
- **Solution :** Vérifiez que vous êtes sur un projet Supabase récent. L'extension Wrappers est disponible sur tous les projets Supabase.

### Erreur : "permission denied for schema extensions"
- **Solution :** Assurez-vous d'être connecté en tant qu'administrateur du projet.

### Erreur : "invalid input syntax for type uuid" lors de la création du serveur
- **Solution :** Vérifiez que vous avez bien copié le `key_id` complet (avec les tirets).

### Erreur : "authentication failed" lors de la requête
- **Solution :** Vérifiez que votre clé API Stripe est correcte et active.

### Les tables n'apparaissent pas
- **Solution :** Vérifiez que vous avez bien exécuté `IMPORT FOREIGN SCHEMA` sans erreur.

## 📚 Prochaines étapes

Maintenant que le FDW est configuré, vous pouvez :

1. **Synchroniser vos abonnements** - Voir le guide `STRIPE_FDW_INTEGRATION.md`
2. **Créer une fonction de sync automatique** - Pour garder votre DB à jour
3. **Vérifier les données** - Comparer Stripe avec votre base de données

## 💡 Astuce

Pour voir toutes les tables Stripe disponibles :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'stripe'
ORDER BY table_name;
```

## 🔗 Ressources

- [Documentation Supabase Stripe FDW](https://supabase.com/docs/guides/database/extensions/wrappers/stripe)
- [Documentation Stripe API](https://stripe.com/docs/api)

---

**Besoin d'aide ?** Si vous rencontrez des problèmes, vérifiez les logs dans Supabase (Settings → Logs) ou consultez la section Dépannage ci-dessus.
