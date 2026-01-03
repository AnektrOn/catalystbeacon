# 🐛 Debug Error 503 - Subscribe Again

## Diagnostic Rapide

### 1. Vérifier la Console du Navigateur

1. Ouvrez la console (F12)
2. Cliquez sur "Subscribe Again"
3. **Copiez l'erreur exacte** qui apparaît

### 2. Vérifier les Logs du Serveur

```bash
# Voir les logs en temps réel
pm2 logs hcuniversity-app --lines 50

# Puis cliquez sur "Subscribe Again"
# Regardez ce qui apparaît
```

### 3. Test Direct de l'Endpoint

Ouvrez la console du navigateur et exécutez:

```javascript
fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_1RutXI2MKT6Humxnh0WBkhCp', // Student monthly
    userId: 'test-user-id',
    userEmail: 'test@example.com'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## Causes Possibles

### ❌ Cause 1: Serveur Non Démarré

**Solution:**
```bash
pm2 start server.js --name hcuniversity-app
pm2 logs hcuniversity-app
```

### ❌ Cause 2: Fonction Edge Supabase Retourne 503

**Vérifier:**
1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Vérifiez que `create-checkout-session` existe
3. Vérifiez les logs de la fonction

**Solution:** Le code fait maintenant un fallback automatique vers le serveur

### ❌ Cause 3: Clé Stripe Manquante

**Vérifier:**
```bash
# Vérifier server.env
cat server.env | grep STRIPE_SECRET_KEY
```

**Solution:** Ajoutez la clé Stripe dans `server.env`

### ❌ Cause 4: Timeout

**Solution:** Le serveur prend trop de temps à répondre

---

## Solution Immédiate

**Forcer l'utilisation du serveur local (bypass Supabase Edge Function):**

Dans `src/pages/PricingPage.jsx`, commentez la partie Supabase:

```javascript
// Commenter cette partie:
// if (SUPABASE_URL) {
//   try {
//     ... code Supabase ...
//   }
// }

// Utiliser directement le serveur:
const response = await fetch(`${window.location.origin}/api/create-checkout-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: priceId,
    userId: user.id,
    userEmail: user.email
  }),
})
```

---

## Dites-moi:

1. **Quelle erreur exacte** dans la console?
2. **Les logs du serveur** montrent quoi?
3. **Le serveur tourne-t-il?** (`pm2 status`)

Avec ces infos, je peux corriger précisément! 🎯

