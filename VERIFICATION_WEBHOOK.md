# ✅ Vérification Webhook - Guide Complet

## 🎯 Bonne Nouvelle !

Votre webhook **fonctionne** ! La requête ID 187 a été envoyée avec succès.

La table `net.http_request_queue` stocke les **requêtes en attente/en cours**, pas les résultats. Pour voir le résultat, utilisez `net.http_get_response()`.

---

## 📊 Structure de Votre Table

Votre table `net.http_request_queue` contient :
- `id` - ID de la requête
- `method` - Méthode HTTP (POST)
- `url` - URL du webhook
- `headers` - Headers JSON
- `body` - Body en bytes (bytea)
- `timeout_milliseconds` - Timeout

**Pas de colonne `status_code`** → Il faut utiliser `net.http_get_response(id)` pour voir le résultat.

---

## 🔍 Vérifier le Résultat d'une Requête

### Pour la Requête ID 187

```sql
-- Voir la réponse de la requête 187
SELECT * 
FROM net.http_get_response(187);
```

**Résultat attendu** :
- `status_code = 200` → ✅ Webhook reçu par N8N
- `status_code = 404` → ❌ URL incorrecte
- `status_code = 500` → ❌ N8N ne répond pas
- `content` → Contient la réponse de N8N

---

## 🧪 Test Complet

Exécutez `test-webhook-complete.sql` :

```sql
DO $$
DECLARE
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
  request_id BIGINT;
  response RECORD;
BEGIN
  -- Envoyer
  SELECT net.http_post(
    url := n8n_webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('test', true, 'message', 'Test')
  ) INTO request_id;
  
  RAISE NOTICE 'Request ID: %', request_id;
  
  -- Attendre 5 secondes
  PERFORM pg_sleep(5);
  
  -- Récupérer la réponse
  SELECT * INTO response FROM net.http_get_response(request_id);
  
  -- Afficher
  RAISE NOTICE 'Status: %, Response: %', response.status_code, response.content;
END $$;
```

---

## ✅ Vérifier dans N8N

1. Allez dans **N8N** → **Executions**
2. Filtrez par votre workflow
3. Vous devriez voir les requêtes entrantes

**Si vous voyez des exécutions** → ✅ Tout fonctionne !

**Si aucune exécution** → Vérifiez :
- Le workflow N8N est **ACTIVÉ** (toggle ON)
- L'URL du webhook est correcte
- Le webhook node est bien configuré

---

## 🚀 Créer le Trigger Level Up

Maintenant que le webhook fonctionne, créez le trigger :

**Exécutez** `create-trigger-level-up-final.sql`

Puis **testez** :

```sql
-- 1. Récupérer un user_id
SELECT id, email, level FROM profiles LIMIT 1;

-- 2. Augmenter le level (remplacez USER_ID)
UPDATE profiles 
SET level = level + 1 
WHERE id = 'USER_ID';

-- 3. Vérifier la requête (attendez 2-3 secondes)
SELECT id, url, method 
FROM net.http_request_queue 
WHERE url LIKE '%n8n%' 
ORDER BY id DESC 
LIMIT 1;

-- 4. Vérifier la réponse (remplacez REQUEST_ID)
SELECT status_code, content 
FROM net.http_get_response(REQUEST_ID);
```

---

## 📋 Checklist

- [x] Structure de la table vérifiée
- [x] Webhook testé (Request ID 187)
- [ ] Réponse vérifiée avec `net.http_get_response(187)`
- [ ] N8N Executions vérifiées
- [ ] Trigger créé avec `create-trigger-level-up-final.sql`
- [ ] Trigger testé avec UPDATE profiles

---

## 🆘 Si Problème

### Le webhook ne se déclenche pas

1. Vérifiez que le trigger existe :
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_level_up';
   ```

2. Vérifiez que pg_net est activé :
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```

3. Testez manuellement :
   ```sql
   UPDATE profiles SET level = level + 1 WHERE id = 'USER_ID';
   ```

### N8N ne reçoit rien

1. Testez N8N directement avec curl :
   ```bash
   curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

2. Vérifiez dans N8N Executions

3. Vérifiez que le workflow est **ACTIVÉ**
