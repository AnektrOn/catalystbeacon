# 🔍 Debug : Pas de Sortie du Webhook

## ❌ Problème

La commande `curl` ne retourne aucune sortie visible.

## 🔍 Diagnostic

### Test 1 : Voir le Code HTTP et les Headers

Exécutez avec l'option `-v` (verbose) :

```bash
curl -v -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{"test": true, "emailType": "test"}'
```

**Ce que vous devriez voir** :
- `< HTTP/1.1 200 OK` (ou autre code)
- Des headers de réponse
- Un body (peut être vide)

---

### Test 2 : Voir Seulement le Code HTTP

```bash
curl -w "\nHTTP Code: %{http_code}\n" -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{"test": true, "emailType": "test"}'
```

**Résultat attendu** :
- Le body (peut être vide)
- `HTTP Code: 200` (ou autre)

---

## ✅ Causes Possibles

### Cause 1 : Réponse Vide (Normal avec "Immediately")

Si le Webhook node est configuré avec :
- **"Respond"** = `Immediately`
- **"Response Data"** = `No Response Body`

**Résultat** : Code HTTP 200 mais body vide → **C'est normal !**

---

### Cause 2 : Workflow Non Activé

Si le workflow n'est pas activé :
- Le webhook ne répond pas
- Pas d'exécution dans N8N

**Solution** : Activez le workflow (toggle ON)

---

### Cause 3 : Erreur de Connexion

Si curl ne peut pas se connecter :
- Timeout
- Erreur de DNS
- Erreur de réseau

**Solution** : Vérifiez votre connexion internet

---

## 🧪 Tests à Effectuer

### Test 1 : Vérifier le Code HTTP

```bash
curl -i -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{"test": true, "emailType": "test"}'
```

L'option `-i` affiche les headers HTTP.

**Résultat attendu** :
```
HTTP/1.1 200 OK
Content-Type: application/json
...

{"message":"Workflow got started"}
```

---

### Test 2 : Vérifier dans N8N

1. Allez dans **N8N** → **Executions**
2. Vérifiez si une nouvelle exécution apparaît après le curl
3. Si oui → ✅ Le webhook fonctionne (même sans sortie visible)
4. Si non → ❌ Le webhook ne fonctionne pas

---

### Test 3 : Vérifier que le Workflow est Activé

1. Allez dans **N8N** → **Workflows**
2. Ouvrez votre workflow
3. Vérifiez que le **toggle** en haut à droite est **ON** (vert)
4. Si OFF → Activez-le

---

## 🎯 Solution Rapide

### Si le Code HTTP est 200 mais Pas de Body

**C'est normal !** Avec "Respond" = `Immediately` et "Response Data" = `No Response Body`, le webhook retourne juste un code 200 sans body.

**Vérifiez dans N8N Executions** :
- Si une exécution apparaît → ✅ **Tout fonctionne !**
- Le body vide n'est pas un problème

---

### Si Pas de Réponse du Tout

1. **Vérifiez le workflow est activé** (toggle ON)
2. **Vérifiez l'URL** du webhook dans N8N
3. **Testez avec `-v`** pour voir les erreurs de connexion
4. **Vérifiez votre connexion internet**

---

## 📋 Checklist

- [ ] Test avec `curl -v` exécuté
- [ ] Code HTTP vérifié (devrait être 200)
- [ ] Workflow N8N vérifié (activé ?)
- [ ] Exécution visible dans N8N Executions ?
- [ ] Résultat partagé

---

## 💡 Note Importante

**Pas de sortie visible ≠ Problème**

Si :
- Le code HTTP est 200
- Une exécution apparaît dans N8N
- Le workflow s'exécute correctement

→ **Tout fonctionne !** Le body vide est normal avec certaines configurations.

---

## 🚀 Prochaines Étapes

1. **Exécutez** `test-webhook-verbose.sh` pour voir les détails
2. **Vérifiez** dans N8N Executions si une exécution apparaît
3. **Partagez** le résultat du test avec `-v`
4. Si tout fonctionne → Créez le trigger Supabase
