# 🔍 Diagnostic Complet - Webhook N8N

## Étape 1 : Tester le Webhook N8N Directement

### Test 1.1 : Test Simple avec cURL

```bash
curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{
    "test": "hello from curl"
  }'
```

**Résultat attendu** : Vous devriez voir une exécution dans N8N (Executions)

**Si ça ne marche pas** :
- Vérifiez que le workflow N8N est **ACTIVÉ** (toggle ON)
- Vérifiez que le webhook node est bien configuré
- Vérifiez l'URL exacte dans N8N

---

## Étape 2 : Vérifier les Triggers SQL dans Supabase

### 2.1 : Vérifier si les triggers existent

Exécutez dans Supabase SQL Editor :

```sql
-- Voir tous les triggers webhook
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%webhook%' 
   OR trigger_name LIKE '%level%'
   OR trigger_name LIKE '%notify%'
ORDER BY event_object_table, trigger_name;
```

**Résultat attendu** : Vous devriez voir `trigger_level_up` ou `level-up-webhook`

**Si aucun trigger** : Les triggers n'ont pas été créés → Exécutez le SQL

---

### 2.2 : Vérifier si pg_net est activé

```sql
-- Vérifier l'extension pg_net
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

**Résultat attendu** : Une ligne avec `pg_net`

**Si vide** : Exécutez `CREATE EXTENSION IF NOT EXISTS pg_net;`

---

### 2.3 : Vérifier les fonctions

```sql
-- Voir toutes les fonctions notify_*
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name LIKE 'notify_%'
   OR routine_name LIKE '%webhook%';
```

---

## Étape 3 : Vérifier les Logs Supabase

### 3.1 : Voir les dernières tentatives de webhook

```sql
SELECT 
  id,
  url,
  method,
  status_code,
  error_msg,
  request_headers,
  request_body,
  created_at
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY created_at DESC
LIMIT 10;
```

**Ce qu'on cherche** :
- `status_code = 200` → ✅ Webhook envoyé avec succès
- `status_code = 4xx/5xx` → ❌ Erreur HTTP
- `error_msg IS NOT NULL` → ❌ Erreur réseau
- `status_code IS NULL` → ⏳ En attente de traitement

---

### 3.2 : Voir les erreurs détaillées

```sql
SELECT 
  id,
  url,
  status_code,
  error_msg,
  created_at,
  LEFT(request_body::text, 200) as body_preview
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
  AND (error_msg IS NOT NULL OR status_code != 200)
ORDER BY created_at DESC
LIMIT 10;
```

---

## Étape 4 : Tester Manuellement un Événement

### 4.1 : Tester Level Up

```sql
-- Récupérer un user_id
SELECT id, email, level, current_xp 
FROM profiles 
LIMIT 1;

-- Tester l'augmentation de level (remplacez USER_ID)
UPDATE profiles 
SET level = level + 1 
WHERE id = 'USER_ID_ICI';

-- Vérifier immédiatement les logs
SELECT 
  status_code,
  error_msg,
  created_at
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu** :
- Une nouvelle ligne dans `net.http_request_queue`
- `status_code = 200` si succès
- Une exécution dans N8N

---

## Étape 5 : Vérifier la Configuration N8N

### 5.1 : Checklist N8N

- [ ] Le workflow est **ACTIVÉ** (toggle vert en haut à droite)
- [ ] Le **Webhook Node** est le premier node
- [ ] Le webhook est configuré en **POST**
- [ ] Le webhook accepte **"Respond to Webhook"** = **"When Last Node Finishes"**
- [ ] L'URL du webhook dans N8N correspond à : `48997b66-68a2-49a3-ac02-3bd42b9bba5b`

### 5.2 : Vérifier les Exécutions N8N

1. Allez dans **Executions** (menu de gauche)
2. Filtrez par votre workflow
3. Vérifiez si des exécutions apparaissent

**Si aucune exécution** :
- Le webhook N8N n'est pas appelé
- Vérifiez les logs Supabase (Étape 3)

**Si des exécutions mais erreurs** :
- Ouvrez une exécution
- Regardez les erreurs dans les nodes

---

## Étape 6 : Diagnostic des Problèmes Courants

### Problème 1 : Aucun trigger créé

**Symptôme** : `SELECT * FROM information_schema.triggers` retourne rien

**Solution** :
```sql
-- Exécutez le fichier complet
-- supabase-webhook-level-up-fixed.sql
```

---

### Problème 2 : pg_net non activé

**Symptôme** : `SELECT * FROM pg_extension WHERE extname = 'pg_net'` retourne rien

**Solution** :
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

### Problème 3 : Erreur dans les logs (status_code != 200)

**Symptôme** : `status_code = 400, 401, 403, 404, 500, etc.`

**Causes possibles** :
- URL incorrecte
- N8N workflow désactivé
- Problème de réseau/firewall

**Solution** :
1. Vérifiez l'URL exacte
2. Testez avec cURL (Étape 1)
3. Vérifiez que N8N est accessible

---

### Problème 4 : Aucune ligne dans net.http_request_queue

**Symptôme** : Le trigger ne s'exécute pas du tout

**Causes possibles** :
- Trigger non créé
- Condition WHEN ne correspond pas
- Fonction avec erreur

**Solution** :
```sql
-- Vérifier le trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_level_up';

-- Tester la fonction manuellement
SELECT notify_level_up(); -- ❌ Ne marchera pas, c'est un trigger

-- Vérifier la condition WHEN
-- Le trigger ne se déclenche que si NEW.level > OLD.level
```

---

### Problème 5 : Trigger créé mais ne se déclenche pas

**Symptôme** : Trigger existe mais UPDATE ne crée pas de log

**Solution** :
```sql
-- Vérifier que la condition est remplie
-- Le trigger ne se déclenche QUE si level augmente

-- Test explicite :
UPDATE profiles 
SET level = COALESCE(level, 0) + 1  -- Force l'augmentation
WHERE id = 'USER_ID';

-- Vérifier immédiatement
SELECT * FROM net.http_request_queue 
ORDER BY created_at DESC LIMIT 1;
```

---

## Étape 7 : Solution Alternative (Si Rien Ne Marche)

### Créer un Trigger Plus Simple (Sans Condition WHEN)

```sql
-- Supprimer l'ancien
DROP TRIGGER IF EXISTS trigger_level_up ON profiles;
DROP FUNCTION IF EXISTS notify_level_up();

-- Créer une version simplifiée
CREATE OR REPLACE FUNCTION notify_level_up()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
BEGIN
  -- Toujours vérifier dans la fonction (plus fiable)
  IF NEW.level > COALESCE(OLD.level, 0) THEN
    -- Get user email
    SELECT email, raw_user_meta_data->>'full_name' 
    INTO user_email, user_name
    FROM auth.users
    WHERE id = NEW.id;
    
    -- Appel webhook
    PERFORM net.http_post(
      url := n8n_webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'emailType', 'level-up',
        'email', COALESCE(user_email, 'unknown@example.com'),
        'userName', COALESCE(user_name, 'there'),
        'oldLevel', COALESCE(OLD.level, 0),
        'newLevel', NEW.level,
        'totalXP', COALESCE(NEW.current_xp, 0)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger SANS condition WHEN (vérification dans la fonction)
CREATE TRIGGER trigger_level_up
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_level_up();
```

---

## 📋 Checklist de Diagnostic

Exécutez ces commandes dans l'ordre et notez les résultats :

1. [ ] **Test cURL direct** → Résultat : ___________
2. [ ] **Triggers existent ?** → Résultat : ___________
3. [ ] **pg_net activé ?** → Résultat : ___________
4. [ ] **Logs dans net.http_request_queue ?** → Résultat : ___________
5. [ ] **N8N workflow activé ?** → Résultat : ___________
6. [ ] **Exécutions dans N8N ?** → Résultat : ___________

---

## 🆘 Si Rien Ne Marche

Partagez les résultats de :

1. **Test cURL** :
   ```bash
   curl -v -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
     -H "Content-Type: application/json" \
     -d '{"test": "hello"}'
   ```

2. **Logs Supabase** :
   ```sql
   SELECT * FROM net.http_request_queue 
   WHERE url LIKE '%n8n%' 
   ORDER BY created_at DESC LIMIT 5;
   ```

3. **Triggers** :
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name LIKE '%level%';
   ```

4. **Screenshot N8N** : Workflow activé + Webhook node configuré
