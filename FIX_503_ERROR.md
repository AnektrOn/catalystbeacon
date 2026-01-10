# 🔧 Fix Erreur 503 : Service Unavailable

## 🚨 Problème

L'URL `https://app.humancatalystbeacon.com/api/create-checkout-session` retourne **503 Service Unavailable**.

## 🔍 Causes Possibles

1. **Serveur n'écoute que sur localhost** (pas accessible depuis l'extérieur)
2. **Reverse proxy (nginx/apache) non configuré** pour rediriger `/api/*` vers le port 3001
3. **Serveur non démarré** ou crashé

## ✅ Solutions

### Solution 1 : Serveur Écoute sur Toutes les Interfaces (DÉJÀ CORRIGÉ)

J'ai modifié `server.js` pour écouter sur `0.0.0.0` au lieu de `localhost`. 

**Redémarrez le serveur :**
```bash
# Arrêter le serveur actuel
pm2 stop hcuniversity-app

# Redémarrer
pm2 restart hcuniversity-app

# Ou si vous n'utilisez pas PM2
# Ctrl+C puis relancez : node server.js
```

### Solution 2 : Vérifier la Configuration Nginx/Apache

Le reverse proxy doit rediriger `/api/*` vers `http://localhost:3001` ou `http://127.0.0.1:3001`.

#### Pour Nginx :

Vérifiez votre fichier de configuration nginx (généralement dans `/etc/nginx/sites-available/` ou similaire) :

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name app.humancatalystbeacon.com;

    # Rediriger les requêtes API vers le serveur Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Servir les fichiers statiques React
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Après modification, rechargez nginx :**
```bash
sudo nginx -t  # Vérifier la configuration
sudo systemctl reload nginx  # Recharger nginx
```

#### Pour Apache :

Vérifiez votre fichier de configuration Apache :

```apache
<VirtualHost *:80>
    ServerName app.humancatalystbeacon.com
    
    # Rediriger les requêtes API
    ProxyPass /api/ http://127.0.0.1:3001/api/
    ProxyPassReverse /api/ http://127.0.0.1:3001/api/
    
    # Servir le reste
    ProxyPass / http://127.0.0.1:3001/
    ProxyPassReverse / http://127.0.0.1:3001/
    
    ProxyPreserveHost On
</VirtualHost>
```

**Après modification, rechargez Apache :**
```bash
sudo apache2ctl configtest  # Vérifier la configuration
sudo systemctl reload apache2  # Recharger Apache
```

### Solution 3 : Vérifier que le Serveur Tourne

```bash
# Vérifier si le serveur écoute sur le port 3001
netstat -tlnp | grep 3001
# ou
ss -tlnp | grep 3001

# Vérifier les logs PM2
pm2 logs hcuniversity-app

# Vérifier le statut
pm2 status
```

### Solution 4 : Tester Directement le Serveur

Testez si le serveur répond directement (sans reverse proxy) :

```bash
# Depuis le serveur
curl http://localhost:3001/api/create-checkout-session

# Depuis l'extérieur (si le port est ouvert)
curl http://VOTRE_IP:3001/api/create-checkout-session
```

Si ça fonctionne en local mais pas via le domaine, c'est un problème de reverse proxy.

## 🔍 Diagnostic

### Étape 1 : Vérifier que le serveur écoute

```bash
# Sur le serveur
netstat -tlnp | grep 3001
```

Vous devriez voir :
```
tcp  0  0  0.0.0.0:3001  0.0.0.0:*  LISTEN  PID/node
```

Si vous voyez `127.0.0.1:3001` au lieu de `0.0.0.0:3001`, le serveur n'écoute que sur localhost.

### Étape 2 : Tester le serveur directement

```bash
curl http://localhost:3001/api/create-checkout-session
```

Si ça retourne une erreur (pas 503), le serveur fonctionne mais le reverse proxy ne redirige pas correctement.

### Étape 3 : Vérifier les logs

```bash
# Logs PM2
pm2 logs hcuniversity-app --lines 50

# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Logs Apache
sudo tail -f /var/log/apache2/error.log
```

## ✅ Checklist

- [ ] Serveur redémarré avec la nouvelle configuration (écoute sur 0.0.0.0)
- [ ] Reverse proxy configuré pour rediriger `/api/*` vers `http://127.0.0.1:3001`
- [ ] Reverse proxy rechargé (nginx reload ou apache reload)
- [ ] Serveur accessible en local (`curl http://localhost:3001/api/...`)
- [ ] Test depuis le navigateur : `https://app.humancatalystbeacon.com/api/create-checkout-session`

## 🆘 Si Rien Ne Fonctionne

1. **Vérifiez les logs** du serveur et du reverse proxy
2. **Testez en local** : `curl http://localhost:3001/api/create-checkout-session`
3. **Vérifiez le firewall** : le port 3001 doit être accessible depuis localhost
4. **Contactez votre hébergeur** si vous ne gérez pas nginx/apache vous-même

---

**Besoin d'aide ?** Dites-moi ce que vous voyez dans les logs ou les résultats des tests !
