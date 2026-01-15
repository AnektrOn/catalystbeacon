# ✅ Checklist Pré-Déploiement Production

## 🎯 État Actuel
- ✅ Notifications email "new user" implémentées
- ✅ Notifications email "role change" implémentées
- ✅ Templates N8N créés (N8N_FUNCTION_NEW_USER_FIXED.js, N8N_FUNCTION_ROLE_CHANGE_ETHEREAL.js)
- ✅ Webhooks Supabase configurés (create-webhook-new-user.sql, create-single-webhook-profiles.sql)

---

## 📋 Checklist Avant Déploiement

### 1. 🔧 Configuration Supabase Production

#### 1.1 Déployer les Triggers SQL
```bash
# Exécuter dans Supabase SQL Editor (PRODUCTION)
```

**Fichiers à exécuter:**
- [ ] `create-webhook-new-user.sql` - Trigger pour nouveaux utilisateurs
- [ ] `create-single-webhook-profiles.sql` - Trigger pour updates profiles (role change, etc.)

**Vérification:**
```sql
-- Vérifier que les triggers existent
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('new-user-webhook', 'profiles-update-webhook');
```

#### 1.2 Vérifier l'Extension pg_net
```sql
-- S'assurer que pg_net est activé
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Vérifier
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

#### 1.3 Tester les Webhooks

**Étape 1: Vérifier la structure de la table (optionnel)**
```sql
-- Voir toutes les colonnes disponibles
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'net'
  AND table_name = 'http_request_queue'
ORDER BY ordinal_position;
```

**Étape 2: Vérifier les logs de webhook (version universelle)**
```sql
-- Voir toutes les colonnes (fonctionne avec toutes les versions)
SELECT * 
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 10;
```

**Note:** Les colonnes peuvent varier selon la version de pg_net. Regardez le résultat pour identifier:
- La colonne de statut (peut être `status`, `status_code`, `response_status`, ou dans une autre table)
- La colonne d'erreur (peut être `error`, `error_msg`, `error_message`)
- La colonne de date (peut être `created_at`, `timestamp`, `created`)

**Alternative: Vérifier directement dans N8N**
La meilleure façon de vérifier si le webhook fonctionne est de regarder dans N8N Executions.

---

### 2. 🔐 Variables d'Environnement Production

#### 2.1 Frontend (.env)
Vérifier que le fichier `.env` en production contient:
```env
VITE_SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Vérification:**
- [ ] `.env` existe sur le serveur de production
- [ ] Toutes les variables commencent par `VITE_` (pour Vite)
- [ ] Les clés sont les clés de PRODUCTION (pas de test)

#### 2.2 Backend (server.env)
Vérifier que le fichier `server.env` contient:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
PORT=3001
NODE_ENV=production
```

**Vérification:**
- [ ] `server.env` existe sur le serveur
- [ ] Toutes les clés sont de PRODUCTION (pas de test)
- [ ] `STRIPE_SECRET_KEY` commence par `sk_live_` (pas `sk_test_`)

---

### 3. 🔄 Configuration N8N Production

#### 3.1 Workflow N8N
- [ ] Le workflow est **ACTIVÉ** (pas en mode draft)
- [ ] Le webhook URL est correct: `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
- [ ] Les Function Nodes contiennent le code correct:
  - [ ] `N8N_FUNCTION_NEW_USER_FIXED.js` pour new-user
  - [ ] `N8N_FUNCTION_ROLE_CHANGE_ETHEREAL.js` pour role-change

#### 3.2 Configuration SMTP
- [ ] SMTP configuré dans N8N (SendGrid, Supabase SMTP, ou autre)
- [ ] Les credentials SMTP sont valides
- [ ] Le "From" email est configuré: `noreply@humancatalystbeacon.com`
- [ ] Le "From Name" est configuré: `The Human Catalyst Beacon`

#### 3.3 Test du Workflow
```bash
# Tester le webhook directement
curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "new-user",
    "email": "test@example.com",
    "userName": "Test User"
  }'
```

**Vérification:**
- [ ] L'exécution apparaît dans N8N Executions
- [ ] L'email est envoyé avec succès
- [ ] Pas d'erreurs dans les logs N8N

---

### 4. 🧪 Tests End-to-End

#### 4.1 Test Inscription (New User)
1. [ ] Créer un compte de test en production
2. [ ] Vérifier que l'email de bienvenue est reçu
3. [ ] Vérifier le contenu de l'email (design, liens, etc.)
4. [ ] Vérifier dans N8N Executions que le workflow s'est déclenché

#### 4.2 Test Changement de Rôle
1. [ ] Changer le rôle d'un utilisateur de test (Free → Student ou Student → Teacher)
2. [ ] Vérifier que l'email de notification est reçu
3. [ ] Vérifier le contenu de l'email (ancien rôle, nouveau rôle, etc.)
4. [ ] Vérifier dans N8N Executions que le workflow s'est déclenché

#### 4.3 Vérification des Logs

**Option 1: Voir toutes les colonnes (recommandé)**
```sql
-- Vérifier les webhooks envoyés depuis Supabase
SELECT * 
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 10;
```

**Option 2: Vérifier la structure d'abord**
```sql
-- Voir les colonnes disponibles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'net'
  AND table_name = 'http_request_queue'
ORDER BY ordinal_position;
```

**Option 3: Vérifier directement dans N8N (recommandé)**
La meilleure façon de vérifier si les webhooks fonctionnent est de regarder dans **N8N Executions**:
1. Allez dans votre workflow N8N
2. Cliquez sur "Executions"
3. Vérifiez que les exécutions apparaissent quand les événements se produisent

**Note:** La table `net.http_request_queue` stocke les requêtes en attente/en cours. Pour voir le statut final, utilisez N8N Executions ou vérifiez toutes les colonnes avec `SELECT *`.

---

### 5. 🚀 Déploiement Application

#### 5.1 Build Production
- [ ] Exécuter `npm run build` (ou `npm run build:no-minify`)
- [ ] Vérifier que `build/index.html` existe
- [ ] Vérifier que les fichiers statiques sont générés

#### 5.2 Déploiement Serveur
- [ ] Copier les fichiers build sur le serveur
- [ ] Redémarrer PM2: `pm2 restart hcuniversity-app`
- [ ] Vérifier que le serveur démarre sans erreurs

#### 5.3 Vérification Post-Déploiement
- [ ] L'application est accessible en production
- [ ] Les pages se chargent correctement
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Pas d'erreurs dans les logs serveur

---

### 6. 📊 Monitoring

#### 6.1 Logs N8N
- [ ] Configurer des alertes pour les échecs d'exécution
- [ ] Vérifier régulièrement les Executions N8N
- [ ] Monitorer le taux de succès des emails

#### 6.2 Logs Supabase
- [ ] Vérifier régulièrement `net.http_request_queue` avec `SELECT * FROM net.http_request_queue WHERE url LIKE '%n8n%' ORDER BY id DESC LIMIT 10;`
- [ ] Monitorer les timeouts de webhook (chercher dans les colonnes d'erreur)
- [ ] Vérifier que les triggers se déclenchent correctement
- [ ] **Recommandé:** Vérifier principalement dans N8N Executions (plus fiable)

#### 6.3 Logs Application
- [ ] Vérifier les logs PM2: `pm2 logs hcuniversity-app`
- [ ] Monitorer les erreurs serveur
- [ ] Vérifier les erreurs Stripe (paiements)

---

## 📝 To-Do Futures (Après Déploiement)

### Notifications Email Restantes
Ces notifications seront implémentées après le déploiement initial:

1. **Level Up** - Quand un utilisateur monte de niveau
2. **Course Completed** - Quand un cours est complété
3. **Achievement Unlocked** - Quand un badge est débloqué
4. **XP Milestone** - Quand l'XP atteint un seuil (1000, 5000, 10000, etc.)
5. **Streak Milestone** - Quand le streak atteint 7, 30, 100, 365 jours
6. **Lesson Completed** - Quand une leçon est complétée
7. **Subscription Purchased** - Confirmation d'achat d'abonnement
8. **Payment Failed** - Alerte d'échec de paiement
9. **Renewal Reminder** - Rappel 3 jours avant renouvellement

**Référence:** Voir `N8N_EMAIL_TRIGGERS_LIST.md` pour la liste complète

### Notifications Mobiles
À implémenter dans une phase ultérieure:

1. **Push Notifications** - Notifications push natives (iOS/Android)
2. **PWA Notifications** - Notifications via Service Worker
3. **In-App Notifications** - Système de notifications dans l'app
4. **Badge Count** - Compteur de notifications non lues

**Référence:** Voir `MOBILE_NOTIFICATIONS_OPTIONS.md` pour les options

---

## ✅ Validation Finale

Avant de considérer le déploiement comme complet:

- [ ] Tous les tests end-to-end passent
- [ ] Aucune erreur dans les logs
- [ ] Les emails sont reçus correctement
- [ ] Les webhooks fonctionnent (status_code = 200)
- [ ] L'application est stable en production
- [ ] Les variables d'environnement sont correctes
- [ ] Les workflows N8N sont activés et fonctionnels

---

## 🆘 En Cas de Problème

### Webhook ne se déclenche pas
1. Vérifier que le trigger existe: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'new-user-webhook';`
2. Vérifier les logs: `SELECT * FROM net.http_request_queue WHERE url LIKE '%n8n%' ORDER BY id DESC LIMIT 5;`
3. Vérifier dans N8N Executions si le webhook arrive (plus fiable que les logs SQL)
4. Tester le webhook directement avec curl

### Email non reçu
1. Vérifier dans N8N Executions que le workflow s'est exécuté
2. Vérifier les logs SMTP dans N8N
3. Vérifier que l'adresse email de test est valide
4. Vérifier les spams/junk

### Erreur dans N8N
1. Vérifier les logs d'exécution dans N8N
2. Vérifier que les Function Nodes ont le bon code
3. Vérifier que le Switch Node route correctement selon `emailType`
4. Vérifier la configuration SMTP

---

**Date de création:** $(date)
**Dernière mise à jour:** $(date)
