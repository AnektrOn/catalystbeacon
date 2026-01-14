# Problème : Endpoint /health retourne HTML au lieu d'être redirigé

## Description du problème

### Symptômes
- Quand l'utilisateur clique sur "Subscribe" dans PricingPage, une requête GET est faite vers `/health`
- La requête retourne du **HTML** (content-type: text/html) au lieu d'être redirigée vers `/api/health`
- Le serveur web (LiteSpeed) sert le fichier `index.html` du build React au lieu de proxifier vers le backend Node.js

### Contexte technique

1. **Architecture** :
   - Frontend React (build statique) servi par LiteSpeed
   - Backend Node.js sur port 3001
   - `.htaccess` configure le proxy pour `/api/*` vers `localhost:3001`

2. **Configuration actuelle** :
   - L'endpoint `/api/health` existe dans `server.js` (ligne 1930)
   - Le `.htaccess` devrait rediriger `/health` → `/api/health`
   - Mais la redirection ne fonctionne pas

3. **Code source** :
   - Le code source actuel n'appelle plus `/health` (a été supprimé dans commit f07811b)
   - MAIS le build en production contient encore l'ancien code qui appelle `/health`
   - C'est pourquoi on voit encore cette requête dans le navigateur

### Pourquoi ça ne marche pas

1. **Ordre des règles `.htaccess`** : Le catch-all React Router (`RewriteRule ^ index.html [L]`) capture `/health` avant que la redirection ne puisse s'exécuter, même si on met la redirection en premier.

2. **LiteSpeed spécifique** : LiteSpeed peut avoir des comportements différents d'Apache pour les règles de réécriture, surtout avec le flag `[P]` (proxy).

3. **Cache du navigateur** : Le build en production contient l'ancien code JavaScript qui appelle `/health`.

## Solutions possibles

### Solution 1 : Créer un endpoint `/health` dans server.js (RECOMMANDÉ)
Au lieu de rediriger via `.htaccess`, créer directement l'endpoint `/health` dans le serveur Node.js qui retourne la même chose que `/api/health`.

**Avantages** :
- Fonctionne indépendamment de la configuration `.htaccess`
- Pas de problème d'ordre des règles
- Compatible avec tous les serveurs web

**Implémentation** :
```javascript
// Dans server.js, AVANT le catch-all React Router
app.get('/health', (req, res) => {
  // Même code que /api/health
  const stripeKey = process.env.STRIPE_SECRET_KEY
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: 'Node.js Express',
    // ... même réponse que /api/health
  })
})
```

### Solution 2 : Forcer le rebuild et redéploiement
Le vrai problème est que le build contient l'ancien code. Forcer un rebuild complet et redéployer.

**Avantages** :
- Solution définitive
- Supprime le problème à la source

**Inconvénients** :
- Nécessite un rebuild complet
- Prend du temps

### Solution 3 : Configuration LiteSpeed spécifique
Utiliser la syntaxe LiteSpeed native au lieu d'Apache mod_rewrite.

**Problème** : Nécessite l'accès à la configuration LiteSpeed, pas seulement `.htaccess`.

## Solution recommandée : Solution 1 + Solution 2

1. **Court terme** : Ajouter l'endpoint `/health` dans `server.js` pour que ça fonctionne immédiatement
2. **Long terme** : Rebuild et redéployer pour supprimer l'appel à `/health` du build

## Fichiers à modifier

1. `server.js` : Ajouter `app.get('/health', ...)` AVANT le catch-all React Router (ligne ~1928)
2. Rebuild et redéployer pour mettre à jour le build JavaScript

## Test

Après implémentation, tester :
```bash
curl https://app.humancatalystbeacon.com/health
```

Devrait retourner du JSON avec `status: "ok"` au lieu de HTML.
