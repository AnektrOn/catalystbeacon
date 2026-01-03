# 🔧 Fix Error: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR

## Problème

L'erreur `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` vient de `express-rate-limit` qui détecte le header `X-Forwarded-For` mais Express n'a pas `trust proxy` activé.

Cela arrive quand le serveur est derrière un reverse proxy (nginx, load balancer, etc.).

## ✅ Solution Appliquée

J'ai ajouté `app.set('trust proxy', true)` dans `server.js` avant les middlewares.

Cela indique à Express de faire confiance aux headers du proxy (comme `X-Forwarded-For`).

## 🚀 Redémarrer le Serveur

```bash
pm2 restart hcuniversity-app
```

## ✅ Vérifier

```bash
pm2 logs hcuniversity-app --lines 20
```

L'erreur `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` ne devrait plus apparaître!

## 🧪 Tester

1. Rechargez la page
2. Cliquez sur "Subscribe Again"
3. Ça devrait fonctionner maintenant! 🎉

---

**Note:** Cette erreur empêchait le rate limiter de fonctionner correctement, ce qui pouvait causer des problèmes avec les requêtes API.

