# 📧 Configuration SMTP - From Name "HUMAN CATALYST"

## ❌ Problème

L'email affiche "contact" au lieu de "HUMAN CATALYST" ou "The Human Catalyst University".

## ✅ Solution

### Option 1 : Dans le Function Node (Recommandé)

Le Function Node retourne maintenant `from` avec le bon nom :

```javascript
return {
  json: {
    to: emailData.email,
    from: siteName + ' <noreply@humancatalystbeacon.com>',
    subject: 'The Path Is Open. Your Journey Begins.',
    html: html
  }
};
```

**Dans le SMTP Node**, configurez :
- **From Email** : `{{ $json.from }}` (au lieu de juste l'email)
- **To Email** : `{{ $json.to }}`
- **Subject** : `{{ $json.subject }}`
- **Message** : `{{ $json.html }}`
- **Email Type** : `HTML`

---

### Option 2 : Directement dans SMTP Node

Si vous préférez configurer directement dans le SMTP Node :

1. **From Email** : `The Human Catalyst University <noreply@humancatalystbeacon.com>`
   - Format : `"Nom" <email@domain.com>`
   - OU : `HC UNIVERSITY <noreply@humancatalystbeacon.com>`

2. **From Name** (si le node le supporte) : `The Human Catalyst University`

---

## 📱 Mobile Friendly - Corrections Apportées

Le template a été amélioré pour être mobile friendly :

### Styles Mobile Ajoutés

```css
@media only screen and (max-width: 600px) {
  table[class="container"] { width: 100% !important; max-width: 100% !important; }
  td[style*="padding: 0 50px"] { padding: 0 20px !important; }
  td[style*="padding: 40px 0"] { padding: 20px 0 !important; }
  h1[class="header-text"] { font-size: 28px !important; line-height: 1.3 !important; }
  p[class="body-text"] { font-size: 16px !important; line-height: 1.6 !important; }
  table[class="btn-table"] { width: 100% !important; }
  a[class="btn-link"] { width: 100% !important; display: block !important; text-align: center !important; padding: 14px 20px !important; font-size: 14px !important; }
  table[class="feature-stack"] { width: 100% !important; display: block !important; margin-bottom: 20px !important; }
  td[style*="padding: 10px 40px"] { padding: 10px 20px !important; }
}
```

### Améliorations Mobile

- ✅ Container responsive (100% sur mobile)
- ✅ Padding réduit sur mobile (50px → 20px)
- ✅ Titre plus petit (36px → 28px)
- ✅ Bouton full-width sur mobile
- ✅ Features stack verticalement sur mobile
- ✅ Textes plus lisibles (taille ajustée)

---

## 🧪 Tester

### Test 1 : Vérifier le From Name

1. Envoyez un email de test
2. Vérifiez dans votre boîte mail
3. Le "From" devrait afficher : **"The Human Catalyst University"** ou **"HC UNIVERSITY"**

### Test 2 : Vérifier Mobile

1. Ouvrez l'email sur un téléphone
2. Vérifiez que :
   - Le container prend toute la largeur
   - Les textes sont lisibles
   - Le bouton est full-width
   - Les features sont empilées verticalement

---

## 📋 Checklist

- [ ] Function Node mis à jour avec `from` dans le return
- [ ] SMTP Node configuré avec `{{ $json.from }}`
- [ ] Styles mobile ajoutés dans le template
- [ ] Test sur mobile réussi
- [ ] From Name correct dans l'email reçu

---

## 🔧 Configuration SMTP Node Complète

### Paramètres Recommandés

1. **From Email** : `{{ $json.from }}` (depuis Function Node)
   - OU directement : `"The Human Catalyst University" <noreply@humancatalystbeacon.com>`

2. **To Email** : `{{ $json.to }}`

3. **Subject** : `{{ $json.subject }}`

4. **Message** : `{{ $json.html }}`

5. **Email Type** : `HTML`

---

## 💡 Note

**Format "From"** :
- `"Nom" <email@domain.com>` → Affiche "Nom" dans le client email
- `email@domain.com` → Affiche juste l'email (peut montrer "contact" si configuré dans SMTP)

Utilisez toujours le format avec guillemets pour contrôler le nom affiché.
