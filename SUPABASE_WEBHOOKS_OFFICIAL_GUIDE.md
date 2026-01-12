# 🔗 Supabase Database Webhooks - Guide Officiel

Basé sur la [documentation officielle Supabase](https://supabase.com/docs/guides/database/webhooks)

## 🎯 Comment ça Marche

Les Database Webhooks de Supabase sont des **wrappers autour de triggers** utilisant l'extension `pg_net`. Ils sont **asynchrones** et ne bloquent pas vos opérations de base de données.

---

## 📋 Format du Payload Automatique

Supabase génère **automatiquement** ce format (vous ne pouvez pas le personnaliser) :

### Pour INSERT
```json
{
  "type": "INSERT",
  "table": "user_badges",
  "schema": "public",
  "record": {
    // Toutes les colonnes de la nouvelle ligne
  },
  "old_record": null
}
```

### Pour UPDATE
```json
{
  "type": "UPDATE",
  "table": "profiles",
  "schema": "public",
  "record": {
    // Nouvelles valeurs
  },
  "old_record": {
    // Anciennes valeurs
  }
}
```

### Pour DELETE
```json
{
  "type": "DELETE",
  "table": "profiles",
  "schema": "public",
  "record": null,
  "old_record": {
    // Valeurs supprimées
  }
}
```

---

## 🚀 Création d'un Webhook

### Option 1 : Via Dashboard (Recommandé)

1. **Supabase Dashboard** → **Database** → **Webhooks**
2. Cliquez sur **"Create a new webhook"**
3. Configurez :
   - **Name** : `level-up-to-n8n`
   - **Table** : `profiles`
   - **Events** : `UPDATE` (cocher)
   - **HTTP Request** :
     - **URL** : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
     - **Method** : `POST`
     - **Headers** : (optionnel)
       ```json
       {
         "Content-Type": "application/json"
       }
       ```

**⚠️ Important** : Vous **ne pouvez pas** personnaliser le body. Supabase envoie automatiquement le format ci-dessus.

### Option 2 : Via SQL (Plus de Contrôle)

Si le Dashboard ne fonctionne pas, créez le webhook directement en SQL :

```sql
-- Activer l'extension pg_net si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer le trigger pour level up
CREATE TRIGGER "level-up-webhook"
AFTER UPDATE ON "public"."profiles"
FOR EACH ROW
WHEN (NEW.level > OLD.level)
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',  -- Body vide, Supabase l'envoie automatiquement
  '10000'  -- Timeout en ms
);
```

**Avantages SQL** :
- ✅ Plus de contrôle
- ✅ Peut ajouter des conditions (WHEN clause)
- ✅ Fonctionne même si Dashboard a des bugs

---

## 🔧 Dépannage : Webhook ne se Déclenche Pas

### Vérification 1 : Extension pg_net

Les webhooks nécessitent l'extension `pg_net`. Vérifiez qu'elle est activée :

```sql
-- Vérifier si pg_net est activé
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- Si pas activé, activez-la
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Vérification 2 : Triggers Créés

Vérifiez que les triggers existent :

```sql
-- Voir tous les triggers sur profiles
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';
```

### Vérification 3 : Logs pg_net

Les logs des webhooks sont dans le schéma `net` :

```sql
-- Voir les dernières tentatives de webhook
SELECT 
  id,
  url,
  method,
  status_code,
  created_at,
  error_msg
FROM net.http_request_queue
ORDER BY created_at DESC
LIMIT 20;
```

**Codes de statut** :
- `200` = Succès ✅
- `404` = URL incorrecte ❌
- `500` = Erreur serveur ❌
- `timeout` = N8N ne répond pas assez vite ❌

---

## 🎯 Solution : Créer via SQL (Plus Fiable)

Si le Dashboard ne fonctionne pas, utilisez SQL directement :

### Webhook Level Up

```sql
-- Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Supprimer le trigger existant si présent
DROP TRIGGER IF EXISTS "level-up-webhook" ON "public"."profiles";

-- Créer le trigger
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

### Webhook Achievement Unlocked

```sql
DROP TRIGGER IF EXISTS "achievement-webhook" ON "public"."user_badges";

CREATE TRIGGER "achievement-webhook"
AFTER INSERT ON "public"."user_badges"
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '10000'
);
```

### Webhook Lesson Completed

```sql
DROP TRIGGER IF EXISTS "lesson-completed-webhook" ON "public"."user_lesson_progress";

CREATE TRIGGER "lesson-completed-webhook"
AFTER UPDATE OF is_completed ON "public"."user_lesson_progress"
FOR EACH ROW
WHEN (NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false))
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '10000'
);
```

---

## 🧪 Tester le Webhook

### Test 1 : Vérifier que le Trigger Existe

```sql
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';
```

### Test 2 : Déclencher Manuellement

```sql
-- Modifier un level pour tester
UPDATE profiles 
SET level = level + 1 
WHERE id = 'votre-user-id';
```

### Test 3 : Vérifier les Logs

```sql
-- Voir si le webhook a été envoyé
SELECT * FROM net.http_request_queue 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔍 Dans N8N : Transformer le Format

Quand N8N reçoit le webhook, le `body` contiendra le format Supabase automatique.

Ajoutez un **Function Node** pour transformer :

```javascript
const data = $input.item.json.body; // Le body contient le payload Supabase

// Vérifier le type
if (data.type !== 'UPDATE' || data.table !== 'profiles') {
  return null;
}

const newLevel = data.record?.level;
const oldLevel = data.old_record?.level;

// Vérifier que level a augmenté
if (!newLevel || !oldLevel || newLevel <= oldLevel) {
  return null;
}

// Transformer en format personnalisé
return {
  json: {
    emailType: 'level-up',
    userId: data.record.id,
    email: data.record.email || '', // Si email est dans profiles
    userName: data.record.full_name || 'there',
    oldLevel: oldLevel,
    newLevel: newLevel,
    totalXP: data.record.current_xp || 0
  }
};
```

---

## ✅ Checklist Complète

- [ ] Extension `pg_net` activée
- [ ] Trigger créé (via Dashboard OU SQL)
- [ ] URL N8N correcte
- [ ] Workflow N8N activé
- [ ] Testé avec UPDATE manuel
- [ ] Vérifié les logs `net.http_request_queue`
- [ ] Function Node dans N8N pour transformer le format

---

## 🆘 Si ça ne Marche Toujours Pas

### Vérifier les Logs pg_net

```sql
SELECT 
  id,
  url,
  method,
  status_code,
  error_msg,
  created_at
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY created_at DESC
LIMIT 10;
```

**Si vous voyez des erreurs** :
- `404` → URL incorrecte
- `500` → N8N ne répond pas
- `timeout` → N8N trop lent
- `connection refused` → N8N inaccessible

### Alternative : Utiliser SQL Triggers avec net.http_post

Si les webhooks Supabase ne fonctionnent pas, utilisez les triggers SQL directs (voir `supabase-triggers-email.sql`).

---

## 📚 Références

- [Documentation Officielle Supabase Webhooks](https://supabase.com/docs/guides/database/webhooks)
- [pg_net Extension](https://github.com/supabase/pg_net)

---

**Prochaine étape** : Créez le webhook via SQL si le Dashboard ne fonctionne pas, puis testez avec un UPDATE manuel ! 🚀
