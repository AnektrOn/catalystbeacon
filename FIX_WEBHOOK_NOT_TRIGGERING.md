# 🔧 Fix : Webhook ne se Déclenche Pas

## 🎯 Solution : Créer via SQL (Plus Fiable)

Le Dashboard peut avoir des bugs. Créez les webhooks **directement en SQL** :

### Étape 1 : Activer pg_net

Dans Supabase Dashboard → **SQL Editor**, exécutez :

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Étape 2 : Créer le Webhook Level Up

```sql
-- Supprimer l'ancien si existe
DROP TRIGGER IF EXISTS "level-up-webhook" ON "public"."profiles";

-- Créer le webhook
CREATE TRIGGER "level-up-webhook"
AFTER UPDATE OF level ON "public"."profiles"
FOR EACH ROW
WHEN (NEW.level > OLD.level)
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '10000'
);
```

### Étape 3 : Tester Immédiatement

```sql
-- Tester avec un UPDATE manuel
UPDATE profiles 
SET level = level + 1 
WHERE id = (SELECT id FROM profiles LIMIT 1);
```

### Étape 4 : Vérifier les Logs

```sql
-- Voir si le webhook a été envoyé
SELECT 
  id,
  url,
  method,
  status_code,
  error_msg,
  created_at
FROM net.http_request_queue
ORDER BY created_at DESC
LIMIT 5;
```

**Codes à vérifier** :
- `200` = ✅ Webhook envoyé avec succès
- `404` = ❌ URL incorrecte
- `500` = ❌ N8N ne répond pas
- `timeout` = ❌ N8N trop lent

---

## 🔍 Diagnostic

### Si status_code = 200 mais N8N ne reçoit rien

1. Vérifiez que le workflow N8N est **activé**
2. Vérifiez l'URL exacte (copiez depuis N8N)
3. Testez N8N directement avec curl

### Si status_code = 404

L'URL est incorrecte. Vérifiez :
- Pas de `/webhook-test/` (c'est pour les tests seulement)
- Avec `/webhook/` (pour la production)
- URL exacte : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`

### Si aucune ligne dans net.http_request_queue

Le trigger ne se déclenche pas. Vérifiez :
- Le trigger existe : `SELECT * FROM information_schema.triggers WHERE trigger_name = 'level-up-webhook';`
- L'événement se produit vraiment (UPDATE sur profiles.level)
- La condition WHEN est satisfaite (NEW.level > OLD.level)

---

## ✅ Fichier SQL Complet

J'ai créé `supabase-webhooks-sql.sql` avec tous les webhooks prêts à exécuter.

**Pour l'utiliser** :
1. Ouvrez Supabase Dashboard → **SQL Editor**
2. Copiez-collez le contenu de `supabase-webhooks-sql.sql`
3. **Remplacez l'URL** par la vôtre si différente
4. Exécutez le script
5. Testez avec un UPDATE manuel

---

## 🧪 Test Complet

1. **Créer le webhook** via SQL (ci-dessus)
2. **Tester** : `UPDATE profiles SET level = 5 WHERE id = 'user-id'`
3. **Vérifier logs** : `SELECT * FROM net.http_request_queue ORDER BY created_at DESC LIMIT 1;`
4. **Vérifier N8N** : Executions devrait montrer une nouvelle exécution

---

Partagez-moi :
1. Le résultat de `SELECT * FROM net.http_request_queue` (dernières lignes)
2. Le status_code que vous voyez
3. Si N8N reçoit quelque chose dans Executions

Comme ça je pourrai identifier exactement le problème ! 🔍
