# 🚨 Fix Immédiat - Error 503 Subscribe

## Problème Identifié

D'après les logs:
1. **401 Unauthorized** de la fonction Edge Supabase → Corrigé (utilise maintenant le token utilisateur)
2. **503 Service Unavailable** du serveur API → Le serveur ne répond pas

## ✅ Solution Immédiate

### Option 1: Redémarrer le Serveur (Recommandé)

```bash
# Vérifier si le serveur tourne
pm2 status

# Si le serveur est là mais ne répond pas
pm2 restart hcuniversity-app

# Si le serveur n'existe pas
pm2 start server.js --name hcuniversity-app

# Voir les logs
pm2 logs hcuniversity-app --lines 50
```

### Option 2: Vérifier que le Serveur Écoute

```bash
# Vérifier si le port 3001 est utilisé
lsof -i :3001

# Ou
netstat -an | grep 3001
```

### Option 3: Vérifier les Variables d'Environnement

```bash
# Vérifier server.env
cat server.env

# Vérifier que STRIPE_SECRET_KEY est défini
grep STRIPE_SECRET_KEY server.env
```

---

## 🔧 Corrections Apportées

1. ✅ **Fonction Edge Supabase** - Utilise maintenant le token utilisateur (pas l'anon key)
2. ✅ **Fallback amélioré** - Si 401 ou 503, bascule automatiquement vers le serveur API
3. ✅ **Meilleure gestion d'erreur** - Logs plus détaillés

---

## 🧪 Test

1. **Redémarrez le serveur:**
   ```bash
   pm2 restart hcuniversity-app
   ```

2. **Rechargez la page** dans le navigateur

3. **Cliquez sur "Subscribe Again"**

4. **Vérifiez la console:**
   - Devrait voir "Falling back to API server..."
   - Puis "Using API server..."
   - Devrait fonctionner!

---

## 📋 Si Ça Ne Fonctionne Toujours Pas

### Vérifier les Logs du Serveur:

```bash
pm2 logs hcuniversity-app --lines 100
```

Cherchez:
- "CREATE CHECKOUT SESSION REQUEST"
- Des erreurs Stripe
- Des erreurs Supabase

### Test Direct de l'Endpoint:

Ouvrez la console du navigateur et exécutez:

```javascript
fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_1RutXI2MKT6Humxnh0WBkhCp',
    userId: '8c94448d-e21c-4b7b-be9a-88a5692dc5d6',
    userEmail: 'humancatalystnote@gmail.com'
  })
})
.then(r => {
  console.log('Status:', r.status)
  return r.json()
})
.then(console.log)
.catch(console.error)
```

---

## 🎯 Action Immédiate

**Redémarrez simplement le serveur:**

```bash
pm2 restart hcuniversity-app
```

Puis testez à nouveau! Le code devrait maintenant basculer automatiquement vers le serveur API si la fonction Edge ne fonctionne pas. 🚀

