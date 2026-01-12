# 📧 Configuration SMTP Node - Email de Bienvenue

## 🎯 Configuration Complète

### Paramètres SMTP Node

1. **Operation** : `Send Email`
2. **From Email** : Votre email (ex: `noreply@hcuniversity.com`)
3. **To Email** : `{{ $json.email }}`
4. **Subject** : `The Path Is Open. Your Journey Begins.`
5. **Email Type** : `HTML`
6. **Message** : Copiez le template HTML de `N8N_TEMPLATE_NEW_USER.md`

---

## 🔧 Personnalisation

### URLs à Modifier

Dans le template HTML, remplacez ces URLs :

1. **Lien CTA "Enter the Sanctuary"** :
   ```html
   <a href="https://votredomaine.com/dashboard">
   ```
   → Remplacez par votre URL de dashboard (ex: `https://hcuniversity.com/dashboard`)

2. **Lien Unsubscribe** :
   ```html
   <a href="https://votredomaine.com/unsubscribe?email={{ $json.email }}">
   ```
   → Remplacez par votre URL de désinscription

3. **Lien Support/Guide** :
   ```html
   <a href="https://votredomaine.com/support">
   ```
   → Remplacez par votre URL de support

---

## 📝 Variables Disponibles

Depuis le Function Node, vous avez accès à :
- `{{ $json.email }}` - Email de l'utilisateur
- `{{ $json.userName }}` - Nom complet (ou 'there' si vide)
- `{{ $json.userId }}` - ID de l'utilisateur
- `{{ $json.role }}` - Rôle initial (généralement 'Free')
- `{{ $json.createdAt }}` - Date de création

---

## 🧪 Tester

### Test 1 : Vérifier dans N8N

1. Allez dans **Executions**
2. Ouvrez la dernière exécution (après un INSERT sur profiles)
3. Vérifiez que :
   - ✅ Webhook node reçoit les données
   - ✅ Function Node détecte `emailType: 'new-user'`
   - ✅ Switch Node route vers "new-user"
   - ✅ SMTP Node envoie l'email
   - ✅ Tous les nodes sont verts

### Test 2 : Vérifier l'Email

Vérifiez la boîte mail de l'utilisateur :
- L'email de bienvenue devrait être reçu
- Le design devrait correspondre au template
- Les liens devraient fonctionner
- Le nom de l'utilisateur devrait être correctement remplacé

---

## ✅ Checklist

- [ ] SMTP Node configuré avec les bonnes credentials
- [ ] Template HTML copié dans le champ "Message"
- [ ] URLs personnalisées (dashboard, unsubscribe, support)
- [ ] Subject personnalisé
- [ ] Test avec INSERT réussi
- [ ] Email reçu et vérifié

---

## 💡 Notes

- **Design** : Le template utilise un design "Ethereal" avec fond sombre (#050508)
- **Fonts** : Cinzel et Rajdhani (chargées depuis Google Fonts)
- **Responsive** : Le template est responsive pour mobile
- **Outlook** : Inclut des hacks VML pour la compatibilité Outlook

---

## 🚀 Prochaines Étapes

1. **Copiez** le template HTML dans le SMTP Node
2. **Personnalisez** les URLs (dashboard, unsubscribe, support)
3. **Testez** avec un INSERT réel
4. **Vérifiez** que l'email est bien reçu et affiché correctement
