# 📧 Setup Email avec Resend - Solution Simple et Fiable

## ✅ Pourquoi Resend?

- **Simple:** Juste une clé API
- **Fiable:** Service professionnel dédié aux emails
- **Gratuit:** 100 emails/jour gratuitement
- **Pas besoin de SMTP:** Tout est géré par Resend
- **Pas besoin de Edge Functions:** Utilise directement le serveur Node.js

---

## 🚀 Setup en 3 Étapes

### Étape 1: Créer un Compte Resend

1. **Allez sur:** https://resend.com
2. **Créez un compte** (gratuit)
3. **Vérifiez votre email** (important!)

### Étape 2: Obtenir la Clé API

1. **Allez sur:** https://resend.com/api-keys
2. **Cliquez sur "Create API Key"**
3. **Donnez un nom:** "HC University Production"
4. **Copiez la clé API** (commence par `re_...`)

### Étape 3: Ajouter la Clé dans server.env

1. **Ouvrez:** `server.env`
2. **Ajoutez:**

```env
RESEND_API_KEY=re_votre_cle_api_ici
FROM_EMAIL=noreply@humancatalystbeacon.com
FROM_NAME=The Human Catalyst University
SITE_NAME=The Human Catalyst University
SITE_URL=https://app.humancatalystbeacon.com
```

3. **Sauvegardez**

---

## 🔧 Vérifier le Domaine (Optionnel mais Recommandé)

Pour que les emails ne finissent pas en spam:

1. **Allez sur:** https://resend.com/domains
2. **Cliquez sur "Add Domain"**
3. **Entrez:** `humancatalystbeacon.com`
4. **Ajoutez les enregistrements DNS** (Resend vous dira quoi ajouter)
5. **Attendez la vérification** (quelques minutes)

**Note:** Vous pouvez tester sans vérifier le domaine, mais les emails peuvent aller en spam.

---

## 🧪 Tester

1. **Redémarrez le serveur:**
   ```bash
   pm2 restart hcuniversity-app
   ```

2. **Créez un nouveau compte** dans votre application

3. **Vérifiez votre email** (et le dossier spam)

4. **Vous devriez recevoir:** "🎉 Welcome to The Human Catalyst University!"

---

## ✅ C'est Tout!

C'est beaucoup plus simple que Supabase Edge Functions + SMTP. Juste:
1. Compte Resend
2. Clé API dans `server.env`
3. Redémarrer le serveur

**C'est tout!** 🎉

---

## 📋 Checklist

- [ ] Compte Resend créé
- [ ] Clé API obtenue
- [ ] `RESEND_API_KEY` ajouté dans `server.env`
- [ ] Serveur redémarré (`pm2 restart hcuniversity-app`)
- [ ] Testé: Création d'un compte → Email reçu

---

## 🆘 Si Ça Ne Fonctionne Pas

### Vérification 1: La clé API est-elle correcte?

```bash
# Vérifier server.env
cat server.env | grep RESEND_API_KEY
```

### Vérification 2: Le serveur a-t-il redémarré?

```bash
pm2 logs hcuniversity-app --lines 20
```

Cherchez: "📧 Sending sign-up confirmation email" ou des erreurs

### Vérification 3: Resend Dashboard

1. Allez sur: https://resend.com/emails
2. Vérifiez si les emails sont envoyés
3. Vérifiez les erreurs éventuelles

---

## 💡 Avantages de Resend

- ✅ **Simple:** Pas de configuration SMTP complexe
- ✅ **Fiable:** Service professionnel
- ✅ **Gratuit:** 100 emails/jour
- ✅ **Rapide:** Envoi instantané
- ✅ **Logs:** Dashboard avec historique des emails

---

## 🎯 Prochaine Étape

Une fois que l'email d'inscription fonctionne, on peut ajouter les autres emails (paiement, etc.) de la même manière!

Dites-moi quand vous avez configuré Resend et on teste! 🚀

