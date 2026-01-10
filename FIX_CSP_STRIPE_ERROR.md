# 🔧 Fix: Content-Security-Policy Stripe Script Error

## ❌ Erreur
```
Content-Security-Policy : Les paramètres de la page ont empêché l'exécution d'un script intégré (script-src-elem) car il enfreint la directive suivante : « script-src 'self' https://js.stripe.com 'sha256-BNulBYV1JXGvq9NQg7814ZyyVZCqfRI1aq5d+PSIdgI=' 'sha256-5Hr21t1F1f0L2UiWkQNDZLeFImeo/+Mjhgju4d39sLA=' 'sha256-4LRRm+CrRt91043ELDDzsKtE9mgb52p2iOlf9CRXTJ0=' ». Envisagez d'utiliser une empreinte (« sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU= ») ou un nonce.
```

## ✅ Solution

L'empreinte SHA256 `sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU=` a été ajoutée à la CSP dans `server.js`.

### Si vous utilisez un serveur Node.js (server.js)

✅ **Déjà corrigé** - L'empreinte a été ajoutée dans `server.js` ligne 180-184.

### Si vous déployez sur Vercel

Créez un fichier `vercel.json` à la racine du projet :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com 'sha256-BNulBYV1JXGvq9NQg7814ZyyVZCqfRI1aq5d+PSIdgI=' 'sha256-5Hr21t1F1f0L2UiWkQNDZLeFImeo/+Mjhgju4d39sLA=' 'sha256-4LRRm+CrRt91043ELDDzsKtE9mgb52p2iOlf9CRXTJ0=' 'sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU='; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.stripe.com https://*.supabase.co https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com; frame-ancestors 'self';"
        }
      ]
    }
  ]
}
```

### Si vous déployez sur Netlify

Créez un fichier `netlify.toml` à la racine du projet :

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com 'sha256-BNulBYV1JXGvq9NQg7814ZyyVZCqfRI1aq5d+PSIdgI=' 'sha256-5Hr21t1F1f0L2UiWkQNDZLeFImeo/+Mjhgju4d39sLA=' 'sha256-4LRRm+CrRt91043ELDDzsKtE9mgb52p2iOlf9CRXTJ0=' 'sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU='; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.stripe.com https://*.supabase.co https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com; frame-ancestors 'self';"
```

### Si vous utilisez nginx

Ajoutez dans votre configuration nginx :

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com 'sha256-BNulBYV1JXGvq9NQg7814ZyyVZCqfRI1aq5d+PSIdgI=' 'sha256-5Hr21t1F1f0L2UiWkQNDZLeFImeo/+Mjhgju4d39sLA=' 'sha256-4LRRm+CrRt91043ELDDzsKtE9mgb52p2iOlf9CRXTJ0=' 'sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU='; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.stripe.com https://*.supabase.co https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com; frame-ancestors 'self';";
```

## 🧪 Test

1. Redémarrez votre serveur (si vous utilisez `server.js`)
2. Rechargez la page avec un hard refresh (Ctrl+Shift+R ou Cmd+Shift+R)
3. Ouvrez la console du navigateur
4. L'erreur CSP ne devrait plus apparaître

## 📝 Notes

- Les empreintes SHA256 sont des hashs cryptographiques des scripts Stripe
- Si de nouvelles erreurs CSP apparaissent avec d'autres empreintes, ajoutez-les de la même manière
- L'option `'unsafe-inline'` et `'unsafe-eval'` sont nécessaires pour Stripe, mais réduisent la sécurité. C'est un compromis nécessaire pour que Stripe fonctionne.
