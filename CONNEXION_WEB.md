# Connexion / inscription web ne marche pas

Si la **connexion** (email/mot de passe ou Google) ou l’**inscription** ne fonctionne pas sur la web app, suivez ces points dans l’ordre.

---

## Si tu vois « Database error saving new user » (à faire en premier)

Cette erreur apparaît à l’inscription (email ou Google). Le log Supabase indique *record "new" has no field "user_id"* : un **trigger** sur `auth.users` utilise encore l’ancien code. Il faut l’exécuter **dans le bon projet Supabase** (celui dont l’URL est dans ton app, ex. `mbffycgrqfeesfnhhcdm.supabase.co`).

1. Ouvre le **Dashboard Supabase** : [https://supabase.com/dashboard](https://supabase.com/dashboard) → **sélectionne le projet** correspondant à ton app (même que dans `REACT_APP_SUPABASE_URL`).
2. Va dans **SQL Editor** (menu de gauche) → **New query**.
3. Ouvre le fichier **`supabase/FIX_NEW_USER_TRIGGER_RUN_THIS.sql`** dans ton repo, **copie tout** (Ctrl+A, Ctrl+C).
4. Colle dans l’éditeur Supabase, puis **Run** (ou Ctrl+Enter).
5. Vérifie en bas : **Success** et éventuellement un message du type « Dropped trigger: … » et « Trigger fixed. Try signing up again. »

Ensuite réessaie de t’inscrire ou de te connecter avec Google.

**Si l’erreur revient après avoir exécuté ce script**, utilise la **solution sans trigger** : exécute **`supabase/REMOVE_TRIGGER_NO_REPLACE.sql`** dans le SQL Editor. Ce script **supprime** le trigger cassé et n’en recrée pas. C’est ton app (AuthContext) qui créera le profil au premier chargement après connexion.

---

## 1. Voir l’erreur exacte

- Ouvre la **console du navigateur** (F12 → onglet Console).
- Réessaie de te connecter ou de t’inscrire.
- Le message d’erreur (toast rouge + ligne dans la console) indique la cause.

Exemples :
- **"Invalid login credentials"** → email ou mot de passe incorrect, ou compte pas encore confirmé (voir §4).
- **"Missing Supabase environment variables"** → variables d’environnement absentes (voir §2).
- **"redirect_url not allowed"** ou **"Database error saving new user"** → configuration Supabase ou trigger (voir §3 et §5).

---

## 2. Variables d’environnement (web)

En local : fichier **`.env`** à la racine du projet :

```
REACT_APP_SUPABASE_URL=https://TON_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
```

En production (serveur) : même chose dans le fichier chargé au build (ex. `server.env` selon ton déploiement). **Redémarre le serveur / refais un build** après modification.

Sans ces variables, la connexion Supabase échoue.

---

## 3. Supabase → Configuration des URLs

Dans le **Dashboard Supabase** → **Authentication** → **URL Configuration** :

1. **Site URL**  
   Mettre l’URL réelle de ton app, ex. :  
   `https://app.humancatalystbeacon.com`  
   (pas `http://localhost:3000` en prod.)

2. **Redirect URLs**  
   Ajouter **exactement** les URLs de redirection après login :
   - En prod : `https://app.humancatalystbeacon.com/dashboard`
   - En dev local : **`http://localhost:3000/dashboard`** (obligatoire si tu testes en local)

Sans ça, après connexion Google tu peux rester bloqué ou avoir une erreur de redirection.

---

## 4. Confirmation d’email (inscription par email)

Dans Supabase → **Authentication** → **Providers** → **Email** :

- Si **“Confirm email”** est activé : après inscription, l’utilisateur doit cliquer sur le lien dans l’email avant de pouvoir se connecter. En attendant, **“Invalid login credentials”** peut apparaître.
- Pour tester sans confirmation : désactiver temporairement “Confirm email”.

---

## 5. Erreur “Database error saving new user” (Google ou inscription)

Cette erreur vient du **trigger** qui crée le profil à la création du compte. Il faut appliquer la migration qui corrige le trigger :

1. Ouvre **Supabase** → **SQL Editor**.
2. Copie tout le contenu du fichier :  
   `supabase/migrations/20260208_fix_handle_new_user_trigger.sql`
3. Colle dans l’éditeur et **Run**.

Après exécution, les nouvelles inscriptions (email et Google) ne devraient plus provoquer cette erreur.

---

## 6. Connexion avec Google uniquement

En plus du §3 :

- **Supabase** → **Providers** → **Google** : activé, **Client ID** et **Client Secret** renseignés (depuis Google Cloud Console).
- **Google Cloud Console** → Credentials → ton client OAuth 2.0 :
  - **Authorized redirect URIs** : uniquement l’URL de callback Supabase, ex.  
    `https://mbffycgrqfeesfnhhcdm.supabase.co/auth/v1/callback`
  - **Authorized JavaScript origins** : **ajouter les deux** si tu utilises prod et local :
    - `https://app.humancatalystbeacon.com`
    - **`http://localhost:3000`** (pour les tests en local)

Si tu testes uniquement en local, `http://localhost:3000` doit être dans **Authorized JavaScript origins**, sinon Google peut refuser la connexion.

Détails complets : **OAUTH_SETUP.md**.

---

## Checklist rapide

- [ ] `.env` (ou env de prod) contient `REACT_APP_SUPABASE_URL` et `REACT_APP_SUPABASE_ANON_KEY`
- [ ] Supabase → URL Configuration : **Site URL** et **Redirect URLs** corrects
- [ ] Migration `20260208_fix_handle_new_user_trigger.sql` exécutée dans le SQL Editor
- [ ] Si Google : provider Google activé dans Supabase + OAuth configuré dans Google Cloud
- [ ] Si “Invalid login credentials” après inscription : vérifier “Confirm email” (§4) ou mot de passe

Une fois ces points ok, la connexion (email et Google) et l’inscription devraient fonctionner sur la web app.

---

## 7. Erreur CSP (Content-Security-Policy) avec « nonce » ou « script-src-elem »

Si tu vois une erreur du type :
- *« Les paramètres de la page ont empêché l'exécution d'un script intégré (script-src-elem) »*
- avec une directive du type `script-src 'nonce-...' 'unsafe-inline'`

**Cette CSP vient très probablement de la page Supabase** (auth / callback sur `supabase.co`), pas de ton app : ton serveur (`server.js`) n’envoie pas de nonce dans la CSP.

**À faire :**

1. **En local avec `npm start`**  
   Tu n’utilises pas `server.js`, donc la CSP qui bloque n’est pas la tienne. Elle vient de la page Supabase ouverte pendant le flux Google. Essayer :
   - **Navigateur en navigation privée** (sans extensions).
   - **Un autre navigateur** (Chrome, Firefox, Edge) pour voir si l’erreur disparaît.
   - Vérifier que **Supabase** et **Redirect URLs** sont bien configurés (§1 et §3).

2. **En local avec `node server.js`**  
   En développement, la CSP envoyée par `server.js` est maintenant **désactivée** (`NODE_ENV=development`), pour éviter tout blocage côté serveur pendant les tests.

3. **Si le blocage persiste**  
   C’est alors côté **Supabase** (leur page auth). Vérifier les statuts / mises à jour Supabase, ou contacter le support Supabase en leur indiquant le message CSP exact et l’URL de la page (probablement `.../auth/v1/...`).
