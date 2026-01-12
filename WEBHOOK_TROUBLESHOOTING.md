# 🔧 Dépannage Webhook Supabase → N8N

## 🐛 Le Webhook ne se Déclenche Pas

### Checklist de Diagnostic

#### ✅ 1. Vérifier le Webhook N8N

**Dans N8N** :
- [ ] Le workflow est **activé** (toggle en haut à droite = vert)
- [ ] Le Webhook Node est **activé** (pas grisé)
- [ ] L'URL du webhook est correcte : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
- [ ] Le webhook est en mode **"Respond to Webhook"** (pas "Wait for Webhook")

**Test** :
1. Copiez l'URL du webhook depuis N8N
2. Testez avec curl :
```bash
curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```
3. Vérifiez dans N8N (Executions) que la requête arrive

---

#### ✅ 2. Vérifier le Webhook Supabase

**Dans Supabase Dashboard** → **Database** → **Webhooks** :

- [ ] Le webhook est **créé** et **activé**
- [ ] La **table** est correcte (ex: `profiles`)
- [ ] Les **événements** sont cochés (ex: `UPDATE`)
- [ ] L'**URL** est exactement : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
  - ⚠️ **SANS** `/webhook-test/` (c'est pour les tests seulement)
  - ⚠️ **AVEC** `/webhook/` (pour la production)
- [ ] Le **Method** est `POST`
- [ ] Les **Headers** incluent `Content-Type: application/json` (optionnel mais recommandé)

**Test depuis Supabase** :
1. Dans Supabase Dashboard → Database → Webhooks
2. Cliquez sur votre webhook
3. Cliquez sur **"Test webhook"**
4. Vérifiez dans N8N (Executions) que la requête arrive

---

#### ✅ 3. Vérifier que l'Événement se Produit

**Pour Level Up** :
- [ ] Vérifiez dans Supabase que `profiles.level` change vraiment
- [ ] Allez dans **Database** → **Table Editor** → `profiles`
- [ ] Modifiez manuellement un `level` (ex: 4 → 5)
- [ ] Vérifiez dans N8N si le webhook se déclenche

**Pour Achievement** :
- [ ] Vérifiez qu'un INSERT se produit dans `user_badges`
- [ ] Allez dans **Database** → **Table Editor** → `user_badges`
- [ ] Insérez manuellement une ligne
- [ ] Vérifiez dans N8N si le webhook se déclenche

---

#### ✅ 4. Vérifier les Logs Supabase

**Dans Supabase Dashboard** :
1. Allez dans **Database** → **Webhooks**
2. Cliquez sur votre webhook
3. Regardez la section **"Recent deliveries"** ou **"Logs"**
4. Vérifiez :
   - ✅ Les webhooks sont envoyés (status 200 = succès)
   - ❌ Les webhooks échouent (status 4xx/5xx = erreur)

**Si vous voyez des erreurs** :
- **404** : URL incorrecte
- **401/403** : Problème d'authentification
- **500** : Erreur serveur N8N
- **Timeout** : N8N ne répond pas assez vite

---

#### ✅ 5. Vérifier les Logs N8N

**Dans N8N** :
1. Allez dans **Executions**
2. Filtrez par votre workflow
3. Vérifiez :
   - ✅ Des exécutions apparaissent = webhook reçu
   - ❌ Aucune exécution = webhook pas reçu

**Si aucune exécution** :
- Le webhook N8N n'est pas activé
- L'URL est incorrecte
- Supabase n'envoie pas

---

## 🔍 Diagnostic Étape par Étape

### Étape 1 : Tester N8N Webhook Directement

**Test manuel** :
```bash
curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{
    "type": "UPDATE",
    "table": "profiles",
    "record": {"level": 5, "id": "test"},
    "old_record": {"level": 4}
  }'
```

**Résultat attendu** :
- ✅ Dans N8N Executions, vous voyez une nouvelle exécution
- ✅ Le webhook fonctionne

**Si ça ne marche pas** :
- Vérifiez que le workflow est activé
- Vérifiez l'URL exacte

---

### Étape 2 : Tester Supabase Webhook

**Dans Supabase Dashboard** :
1. Database → Webhooks → Votre webhook
2. Cliquez sur **"Test webhook"**
3. Regardez dans N8N (Executions)

**Résultat attendu** :
- ✅ Une exécution apparaît dans N8N
- ✅ Le body contient les données Supabase

**Si ça ne marche pas** :
- Vérifiez l'URL dans Supabase (doit être exactement celle de N8N)
- Vérifiez que le webhook Supabase est activé

---

### Étape 3 : Déclencher un Événement Réel

**Pour Level Up** :
1. Dans votre app, faites level up un utilisateur
2. OU dans Supabase Table Editor, modifiez `profiles.level`
3. Regardez dans N8N (Executions)

**Résultat attendu** :
- ✅ Une exécution apparaît automatiquement
- ✅ Le webhook se déclenche

**Si ça ne marche pas** :
- Vérifiez que l'événement se produit vraiment (regardez dans Supabase)
- Vérifiez les filtres du webhook Supabase (peut-être trop restrictifs)

---

## 🎯 Solutions aux Problèmes Courants

### Problème 1 : Webhook N8N ne répond pas

**Symptômes** :
- Supabase logs montrent 404 ou timeout
- N8N Executions ne montre rien

**Solutions** :
1. Vérifiez que le workflow est **activé** dans N8N
2. Vérifiez l'URL exacte (copiez depuis N8N)
3. Testez avec curl pour voir si N8N répond

---

### Problème 2 : Supabase n'envoie pas

**Symptômes** :
- Aucun log dans Supabase Webhooks
- L'événement se produit mais pas de webhook

**Solutions** :
1. Vérifiez que le webhook Supabase est **activé**
2. Vérifiez la table et les événements (UPDATE, INSERT, etc.)
3. Vérifiez les filtres (peut-être trop restrictifs)
4. Testez avec "Test webhook" dans Supabase

---

### Problème 3 : Webhook reçu mais body vide

**Symptômes** :
- N8N reçoit le webhook
- Mais `body` est vide ou mal formaté

**Solutions** :
1. Vérifiez les Headers dans Supabase (doit inclure `Content-Type: application/json`)
2. Ajoutez un Function Node pour logger le body exact
3. Vérifiez le format dans Supabase logs

---

### Problème 4 : Filtres trop restrictifs

**Symptômes** :
- Webhook configuré mais ne se déclenche jamais
- L'événement se produit mais pas de webhook

**Solutions** :
1. **Enlevez les filtres** temporairement pour tester
2. Vérifiez la syntaxe des filtres SQL
3. Testez avec un événement simple (UPDATE sans condition)

---

## 🧪 Test Complet

### Test 1 : N8N Webhook Fonctionne

```bash
# Test direct
curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{"test": "hello"}'
```

**Vérifiez** : N8N Executions montre une nouvelle exécution ✅

---

### Test 2 : Supabase Test Webhook

1. Supabase Dashboard → Database → Webhooks
2. Cliquez sur votre webhook
3. Cliquez "Test webhook"
4. **Vérifiez** : N8N Executions montre une nouvelle exécution ✅

---

### Test 3 : Événement Réel

1. Dans Supabase Table Editor → `profiles`
2. Modifiez `level` d'un utilisateur (ex: 4 → 5)
3. **Vérifiez** : N8N Executions montre une nouvelle exécution ✅

---

## 📋 Checklist Complète

- [ ] Workflow N8N est **activé**
- [ ] Webhook Node N8N est **activé**
- [ ] URL N8N est correcte (copiée depuis N8N)
- [ ] Webhook Supabase est **créé** et **activé**
- [ ] URL Supabase = URL N8N exactement
- [ ] Table Supabase est correcte
- [ ] Événements Supabase sont cochés (UPDATE, INSERT, etc.)
- [ ] Test N8N avec curl fonctionne
- [ ] Test Supabase "Test webhook" fonctionne
- [ ] Événement réel se produit dans la DB
- [ ] Logs Supabase montrent des tentatives d'envoi
- [ ] Logs N8N montrent des exécutions

---

## 🆘 Si Rien ne Marche

### Option A : Utiliser SQL Triggers (Plus Fiable)

Si les Database Webhooks ne fonctionnent pas, utilisez les **SQL Triggers** avec `pg_net` :

Voir le fichier `supabase-triggers-email.sql` pour les exemples complets.

**Avantages** :
- ✅ Plus de contrôle
- ✅ Fonctionne toujours
- ✅ Peut inclure email directement

---

### Option B : Utiliser Supabase Node dans N8N (Realtime)

Au lieu de webhooks, utilisez le **Supabase Node** dans N8N pour écouter en temps réel :

1. Ajoutez un **Supabase Node** dans N8N
2. Configurez : "Listen to Database Changes"
3. Table : `profiles`
4. Event : `UPDATE`

**Note** : Le workflow doit être **toujours actif** (pas de déclenchement on-demand).

---

## 💡 Prochaines Étapes

1. **Testez N8N** avec curl (vérifier que le webhook répond)
2. **Testez Supabase** avec "Test webhook" (vérifier que Supabase envoie)
3. **Vérifiez les logs** dans les deux plateformes
4. **Partagez-moi** :
   - Les logs Supabase (si disponibles)
   - Les exécutions N8N (si aucune n'apparaît)
   - Le résultat du test curl

Comme ça je pourrai identifier exactement où ça bloque ! 🔍
