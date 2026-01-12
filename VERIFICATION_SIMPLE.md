# ✅ Vérification Simple - Sans http_get_response

## 🎯 Solution

La fonction `net.http_get_response()` n'existe pas dans votre version de pg_net. Pas de problème ! On peut vérifier autrement.

---

## ✅ Comment Vérifier que le Webhook Fonctionne

### Méthode 1 : Vérifier dans N8N (Recommandé)

1. Allez dans **N8N** → **Executions**
2. Filtrez par votre workflow
3. Si vous voyez des exécutions → ✅ **Ça marche !**

**C'est la meilleure méthode** car N8N vous montre directement si la requête est arrivée.

---

### Méthode 2 : Vérifier la Requête dans Supabase

```sql
-- Voir la dernière requête envoyée
SELECT 
  id,
  method,
  url,
  headers,
  convert_from(body, 'UTF8') as body_text,
  timeout_milliseconds
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 1;
```

**Si vous voyez une ligne** → ✅ La requête a été envoyée

**Le body_text** devrait contenir votre JSON (emailType, email, etc.)

---

### Méthode 3 : Tester avec cURL

```bash
curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{"test": true, "emailType": "test"}'
```

**Si vous voyez une exécution dans N8N** → ✅ Le webhook fonctionne

---

## 🚀 Créer le Trigger

Exécutez `create-trigger-level-up-simple.sql` dans Supabase SQL Editor.

Ce fichier :
- ✅ Active `pg_net`
- ✅ Crée la fonction `notify_level_up()`
- ✅ Crée le trigger `trigger_level_up`
- ✅ **Ne nécessite pas** `http_get_response()`

---

## 🧪 Tester le Trigger

### Étape 1 : Récupérer un User ID

```sql
SELECT id, email, level, current_xp 
FROM profiles 
LIMIT 1;
```

### Étape 2 : Augmenter le Level

```sql
-- Remplacez USER_ID par l'ID réel
UPDATE profiles 
SET level = level + 1 
WHERE id = 'USER_ID_ICI';
```

### Étape 3 : Vérifier la Requête (immédiatement après)

```sql
SELECT 
  id,
  url,
  method,
  convert_from(body, 'UTF8') as body_text
FROM net.http_request_queue 
WHERE url LIKE '%n8n%' 
ORDER BY id DESC 
LIMIT 1;
```

**Résultat attendu** :
- Une nouvelle ligne avec `id` plus grand que la précédente
- `body_text` contient : `{"emailType":"level-up","email":"...","userName":"...","oldLevel":X,"newLevel":Y,"totalXP":Z}`

### Étape 4 : Vérifier dans N8N

1. Allez dans **N8N** → **Executions**
2. Vous devriez voir une nouvelle exécution
3. Ouvrez-la pour voir les données reçues

---

## 📋 Checklist

- [ ] Trigger créé avec `create-trigger-level-up-simple.sql`
- [ ] Trigger testé avec `UPDATE profiles SET level = level + 1`
- [ ] Requête visible dans `net.http_request_queue`
- [ ] Body vérifié (convert_from pour voir le JSON)
- [ ] Exécution visible dans N8N Executions

---

## 🔍 Dépannage

### Le trigger ne se déclenche pas

```sql
-- Vérifier que le trigger existe
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_level_up';

-- Vérifier que pg_net est activé
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

### Aucune requête dans net.http_request_queue

1. Vérifiez que le level a vraiment augmenté :
   ```sql
   SELECT id, level FROM profiles WHERE id = 'USER_ID';
   ```

2. Vérifiez les logs Supabase (Dashboard → Logs) pour voir les erreurs

### N8N ne reçoit rien

1. Testez N8N directement avec curl (voir Méthode 3 ci-dessus)
2. Vérifiez que le workflow N8N est **ACTIVÉ**
3. Vérifiez l'URL exacte du webhook dans N8N

---

## 💡 Note Importante

**pg_net est asynchrone** :
- La requête est envoyée immédiatement
- Mais elle est traitée en arrière-plan
- Vous ne pouvez pas récupérer la réponse directement dans SQL
- **La meilleure vérification est dans N8N Executions**

Si vous voyez des exécutions dans N8N → ✅ **Tout fonctionne parfaitement !**
