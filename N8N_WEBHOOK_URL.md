# 🔗 URL Webhook N8N - Production

## URL de Production

```
https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b
```

## URL de Test (si nécessaire)

```
https://noteautomation.app.n8n.cloud/webhook-test/48997b66-68a2-49a3-ac02-3bd42b9bba5b
```

---

## 📝 Utilisation

### Dans Supabase SQL Editor

Utilisez cette URL dans vos fonctions SQL :

```sql
n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
```

### Dans Supabase Dashboard (Webhooks)

1. Allez dans **Database** → **Webhooks**
2. Créez ou modifiez un webhook
3. Collez l'URL de production ci-dessus

### Test Direct avec cURL

```bash
curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "level-up",
    "email": "test@example.com",
    "userName": "Test User",
    "oldLevel": 1,
    "newLevel": 2,
    "totalXP": 150
  }'
```

---

## ✅ Fichiers Mis à Jour

Tous les fichiers suivants ont été mis à jour avec la nouvelle URL :

- ✅ `supabase-webhooks-sql.sql`
- ✅ `supabase-webhook-level-up-fixed.sql`
- ✅ `supabase-triggers-email.sql`
- ✅ `TEST_WEBHOOK_N8N.sh`
- ✅ `SUPABASE_TO_N8N_CONFIG.md`
- ✅ `SUPABASE_WEBHOOK_FORMAT_N8N.md`
- ✅ `SUPABASE_WEBHOOKS_OFFICIAL_GUIDE.md`
- ✅ `FIX_WEBHOOK_NOT_TRIGGERING.md`
- ✅ `WEBHOOK_TROUBLESHOOTING.md`

---

## 🚀 Prochaines Étapes

1. **Exécutez le SQL corrigé** dans Supabase :
   ```sql
   -- Utilisez supabase-webhook-level-up-fixed.sql
   -- ou supabase-webhooks-sql.sql
   ```

2. **Testez le webhook** :
   ```sql
   UPDATE profiles 
   SET level = level + 1 
   WHERE id = (SELECT id FROM profiles LIMIT 1);
   ```

3. **Vérifiez les logs** :
   ```sql
   SELECT status_code, error_msg, created_at 
   FROM net.http_request_queue 
   WHERE url LIKE '%n8n%'
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

4. **Vérifiez dans N8N** :
   - Allez dans **Executions** de votre workflow
   - Vous devriez voir les requêtes entrantes

---

## ⚠️ Note Importante

- Utilisez toujours l'URL de **production** (`/webhook/`) dans Supabase
- L'URL de **test** (`/webhook-test/`) est uniquement pour tester manuellement
- Assurez-vous que votre workflow N8N est **activé** (toggle ON)
