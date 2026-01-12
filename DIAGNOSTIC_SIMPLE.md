# 🔍 Diagnostic Simple - Étape par Étape

## ⚠️ Problème : Colonnes Inconnues

La table `net.http_request_queue` peut avoir des colonnes différentes selon la version de Supabase/pg_net.

---

## ✅ Solution : Vérifier d'Abord la Structure

### Étape 1 : Voir les Colonnes Disponibles

Exécutez dans Supabase SQL Editor :

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'net'
  AND table_name = 'http_request_queue'
ORDER BY ordinal_position;
```

**Partagez le résultat** → Je pourrai adapter les requêtes.

---

### Étape 2 : Test Simple du Webhook

Exécutez `test-webhook-fixed.sql` :

```sql
-- Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Test direct
DO $$
DECLARE
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
  request_id BIGINT;
BEGIN
  SELECT net.http_post(
    url := n8n_webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('test', true, 'message', 'Test')
  ) INTO request_id;
  
  RAISE NOTICE 'Request ID: %', request_id;
END $$;

-- Attendre 2 secondes
SELECT pg_sleep(2);

-- Voir toutes les colonnes
SELECT * 
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 1;
```

---

### Étape 3 : Vérifier les Logs (Version Universelle)

```sql
-- Voir toutes les colonnes (fonctionne toujours)
SELECT * 
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 5;
```

**Cherchez** :
- Une colonne avec `200` → ✅ Succès
- Une colonne avec `4xx` ou `5xx` → ❌ Erreur HTTP
- Une colonne avec du texte d'erreur → ❌ Problème réseau

---

## 🎯 Actions Immédiates

1. **Exécutez** `check-logs-simple.sql` pour voir la structure
2. **Partagez** les colonnes que vous voyez
3. **Exécutez** `test-webhook-fixed.sql` pour tester
4. **Vérifiez** dans N8N (Executions) si la requête arrive

---

## 📋 Checklist

- [ ] Structure de la table vérifiée
- [ ] Test webhook exécuté
- [ ] Logs vérifiés (SELECT *)
- [ ] N8N Executions vérifiées
- [ ] Résultats partagés

---

## 🔧 Alternative : Utiliser net.http_get_response

Si `net.http_request_queue` ne fonctionne pas, essayez :

```sql
-- Voir les réponses HTTP
SELECT * 
FROM net.http_get_response(
  (SELECT id FROM net.http_request_queue 
   WHERE url LIKE '%n8n%' 
   ORDER BY id DESC LIMIT 1)
);
```
