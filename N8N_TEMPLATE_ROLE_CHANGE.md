# 📧 Template Email - Role Change (Design Éthéré)

## 🎯 Événement : Role Change (UPDATE sur profiles.role)

Quand le rôle d'un utilisateur change (ex: Free → Student), envoyez un email de confirmation.

---

## 📝 Code Function Node

Copiez le code de `N8N_FUNCTION_ROLE_CHANGE_ETHEREAL.js` dans un Function Node après le Switch Node (branche "role-change").

---

## 🎨 Design

Le template utilise le **design Éthéré (Dark)** pour correspondre à l'app :
- **Fond** : `#050508` (noir profond)
- **Container** : `#0a0a0e` avec bordure subtile
- **Accent** : Gradient cyan (#a5f3fc) → violet (#a78bfa)
- **Fonts** : Cinzel (titres) + Rajdhani (texte)
- **Couleurs** :
  - Texte principal : `#e0e0e0`
  - Texte secondaire : `#b0b0b0`
  - Accent cyan : `#a5f3fc`
  - Accent violet : `#a78bfa`
  - Accent orange : `#fb923c`

---

## 📋 Données Disponibles

Depuis le Function Node de détection, vous avez accès à :
- `email` - Email de l'utilisateur
- `userName` - Nom complet (ou 'there' si vide)
- `oldRole` - Ancien rôle (ex: 'Free')
- `newRole` - Nouveau rôle (ex: 'Student', 'Teacher')
- `userId` - ID de l'utilisateur

---

## 🔧 Configuration SMTP Node

### Paramètres

- **From Email** : `{{ $json.from }}` (depuis Function Node)
- **To Email** : `{{ $json.to }}`
- **Subject** : `{{ $json.subject }}`
- **Message** : `{{ $json.html }}`
- **Email Type** : `HTML`

---

## 📊 Structure du Workflow

```
Webhook (reçoit UPDATE sur profiles)
  ↓
Function Node (détecte role-change)
  ↓
Switch Node (route vers "role-change")
  ↓
Function Node (génère le template HTML)
  ↓
SMTP Node (envoie l'email)
```

---

## 🧪 Tester

### Test 1 : Déclencher un Role Change

Dans Supabase SQL Editor :

```sql
-- Récupérer un user_id
SELECT id, email, role FROM profiles LIMIT 1;

-- Changer le rôle (remplacez USER_ID)
UPDATE profiles 
SET role = 'Student' 
WHERE id = 'USER_ID' AND role = 'Free';
```

### Test 2 : Vérifier dans N8N

1. Allez dans **Executions**
2. Ouvrez la dernière exécution
3. Vérifiez que :
   - ✅ Webhook node reçoit les données
   - ✅ Function Node détecte `emailType: 'role-change'`
   - ✅ Switch Node route vers "role-change"
   - ✅ Function Node génère le HTML
   - ✅ SMTP Node envoie l'email
   - ✅ Tous les nodes sont verts

### Test 3 : Vérifier l'Email

Vérifiez la boîte mail de l'utilisateur :
- L'email devrait être reçu
- Le design devrait correspondre à l'app (fond sombre, design Ethereal)
- Les informations de rôle devraient être correctes

---

## ✅ Checklist

- [ ] Function Node "Role Change Template" créé avec le code
- [ ] Switch Node a une règle pour "role-change"
- [ ] SMTP Node configuré avec `{{ $json.from }}`, `{{ $json.to }}`, `{{ $json.html }}`
- [ ] Workflow activé
- [ ] Test avec UPDATE profiles.role réussi
- [ ] Email reçu avec le design correct

---

## 🚀 Prochaines Étapes

1. **Copiez** le code de `N8N_FUNCTION_ROLE_CHANGE_ETHEREAL.js`
2. **Collez** dans un Function Node après le Switch Node (branche "role-change")
3. **Configurez** le SMTP Node pour utiliser les sorties
4. **Testez** avec un UPDATE réel sur `profiles.role`
5. **Vérifiez** que l'email est bien reçu avec le design Ethereal

---

## 💡 Notes

- **Design cohérent** : Le template utilise le même design que l'email de bienvenue
- **Mobile friendly** : Styles responsive inclus
- **Variables dynamiques** : `oldRole` et `newRole` sont automatiquement remplis
- **From Name** : Utilise `siteName` pour afficher "The Human Catalyst University"

---

## 📚 Ressources

- `N8N_FUNCTION_ROLE_CHANGE_ETHEREAL.js` - Code Function Node complet
- `N8N_FUNCTION_NEW_USER_FIXED.js` - Référence pour le design Ethereal
- `N8N_SMTP_CONFIG_FROM_NAME.md` - Configuration SMTP
