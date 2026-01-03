# 🔧 Fix Error 503 - Subscribe Again

## Problème: HTTP 503 quand on clique sur "Subscribe Again"

Une erreur 503 signifie que le service est indisponible. Voici comment résoudre:

---

## ✅ Solution 1: Vérifier que le Serveur Fonctionne

### Vérifier si le serveur tourne:

```bash
# Vérifier PM2
pm2 status

# Si le serveur n'est pas là, le démarrer
pm2 start server.js --name hcuniversity-app

# Voir les logs
pm2 logs hcuniversity-app
```

### Vérifier les logs pour les erreurs:

```bash
# Logs en temps réel
pm2 logs hcuniversity-app --lines 50

# Chercher les erreurs
pm2 logs hcuniversity-app | grep -i error
```

---

## ✅ Solution 2: Vérifier la Fonction Edge Supabase

L'erreur 503 peut venir de la fonction Edge Supabase qui ne répond pas.

### Vérifier si la fonction est déployée:

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Vérifiez que `create-checkout-session` existe
3. Si elle n'existe pas, déployez-la:

```bash
supabase functions deploy create-checkout-session
```

### Vérifier les logs de la fonction:

1. Dans Supabase Dashboard → Edge Functions
2. Cliquez sur `create-checkout-session`
3. Allez dans l'onglet "Logs"
4. Cherchez les erreurs

---

## ✅ Solution 3: Vérifier les Variables d'Environnement

### Côté Serveur (server.env):

```env
STRIPE_SECRET_KEY=sk_live_... (ou sk_test_...)
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

### Côté Frontend (.env):

```env
REACT_APP_SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=votre_anon_key
REACT_APP_API_URL=https://votre-domaine.com (ou http://localhost:3001 en dev)
```

---

## ✅ Solution 4: Forcer l'Utilisation du Serveur Local

Si la fonction Edge Supabase ne fonctionne pas, forcez l'utilisation du serveur:

Dans `src/pages/PricingPage.jsx`, modifiez temporairement pour utiliser directement le serveur:

```javascript
// Commenter la partie Supabase Edge Function
// et utiliser directement l'API server
const response = await fetch(`${window.location.origin}/api/create-checkout-session`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: priceId,
    userId: user.id,
    userEmail: user.email
  }),
})
```

---

## ✅ Solution 5: Vérifier Stripe

### Vérifier que Stripe fonctionne:

```bash
# Tester la clé Stripe
curl https://api.stripe.com/v1/customers \
  -u sk_test_...:
```

### Vérifier les logs Stripe:

1. Allez sur: https://dashboard.stripe.com/logs
2. Cherchez les erreurs récentes

---

## 🔍 Diagnostic Rapide

### Test 1: Vérifier l'endpoint directement

```bash
# Testez l'endpoint directement
curl -X POST https://votre-domaine.com/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_...",
    "userId": "test",
    "userEmail": "test@example.com"
  }'
```

### Test 2: Vérifier la console du navigateur

1. Ouvrez la console (F12)
2. Cliquez sur "Subscribe Again"
3. Regardez l'erreur exacte dans la console
4. Copiez l'erreur complète

### Test 3: Vérifier les logs du serveur

```bash
# En temps réel
pm2 logs hcuniversity-app --lines 100

# Puis cliquez sur "Subscribe Again"
# Regardez ce qui apparaît dans les logs
```

---

## 🚨 Erreurs Courantes

### "Service Unavailable"
- Le serveur n'est pas démarré → `pm2 start server.js`
- Le port est occupé → Vérifiez le port 3001
- Timeout → Augmentez le timeout

### "Function not found"
- La fonction Edge n'est pas déployée → Déployez-la
- Mauvaise URL → Vérifiez l'URL dans le code

### "Invalid API key"
- Clé Stripe incorrecte → Vérifiez `STRIPE_SECRET_KEY`
- Clé Supabase incorrecte → Vérifiez `SUPABASE_SERVICE_ROLE_KEY`

---

## 💡 Solution Rapide

**Si rien ne fonctionne, utilisez directement le serveur:**

1. Modifiez `src/pages/PricingPage.jsx`
2. Désactivez la partie Supabase Edge Function
3. Utilisez directement `/api/create-checkout-session`
4. Redémarrez le serveur: `pm2 restart hcuniversity-app`

---

## 📋 Checklist

- [ ] Serveur démarré (`pm2 status`)
- [ ] Fonction Edge déployée (Supabase Dashboard)
- [ ] Variables d'environnement correctes
- [ ] Clé Stripe valide
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Test direct de l'endpoint

---

## 🆘 Si Rien ne Fonctionne

Dites-moi:
1. **Quelle erreur exacte** voyez-vous dans la console du navigateur?
2. **Les logs du serveur** montrent quoi? (`pm2 logs`)
3. **Le serveur tourne-t-il?** (`pm2 status`)
4. **La fonction Edge existe-t-elle?** (Supabase Dashboard)

Avec ces infos, je peux vous aider plus précisément! 🎯

