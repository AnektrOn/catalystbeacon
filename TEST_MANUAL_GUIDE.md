# 🧪 Guide de Test Manuel - Design & Responsive

**Credentials de test:**
- Email: `humancatalystnote@gmail.com`
- Password: `123456`

---

## 📋 Checklist de Test

### 1. Test de Connexion

**URL:** http://localhost:3000/login

**Actions:**
1. [ ] Ouvrir la page de login
2. [ ] Vérifier que les champs email et password sont visibles
3. [ ] Entrer l'email: `humancatalystnote@gmail.com`
4. [ ] Entrer le password: `123456`
5. [ ] Cliquer sur "Sign In"
6. [ ] Vérifier la redirection vers `/dashboard`

**Vérifications:**
- [ ] Pas d'erreurs dans la console
- [ ] Le loader apparaît pendant la connexion
- [ ] La redirection fonctionne correctement

---

### 2. Test Desktop (1920x1080)

#### 2.1 Dashboard
**URL:** http://localhost:3000/dashboard

**Vérifications:**
- [ ] Tous les widgets sont visibles
- [ ] Les cartes sont bien alignées
- [ ] Les textes sont lisibles
- [ ] Les boutons sont facilement cliquables
- [ ] Pas de débordement horizontal
- [ ] Navigation sidebar fonctionne

**Screenshots à prendre:**
- [ ] Screenshot complet du dashboard

#### 2.2 Mastery
**URL:** http://localhost:3000/mastery

**Vérifications:**
- [ ] Tous les onglets sont accessibles
- [ ] Le contenu s'affiche correctement
- [ ] Les graphiques sont visibles
- [ ] Pas de problèmes de layout

#### 2.3 Courses
**URL:** http://localhost:3000/courses

**Vérifications:**
- [ ] Liste des cours s'affiche
- [ ] Les cartes de cours sont bien formatées
- [ ] Navigation fonctionne

#### 2.4 Settings
**URL:** http://localhost:3000/settings

**Vérifications:**
- [ ] Tous les paramètres sont accessibles
- [ ] Les formulaires sont utilisables
- [ ] Pas de problèmes d'affichage

---

### 3. Test Mobile (375x667 - iPhone SE)

**Comment tester:**
1. Ouvrir Chrome DevTools (F12)
2. Cliquer sur l'icône "Toggle device toolbar" (Ctrl+Shift+M)
3. Sélectionner "iPhone SE" (375x667)
4. Recharger la page

#### 3.1 Login Mobile
**URL:** http://localhost:3000/login

**Vérifications:**
- [ ] Le formulaire est centré et lisible
- [ ] Les champs sont facilement cliquables (min 44x44px)
- [ ] Le bouton "Sign In" est accessible
- [ ] Pas de débordement horizontal
- [ ] Le texte est lisible sans zoom

**Problèmes à noter:**
- [ ] Textes trop petits
- [ ] Boutons trop petits
- [ ] Espacement insuffisant
- [ ] Éléments qui se chevauchent

#### 3.2 Dashboard Mobile
**URL:** http://localhost:3000/dashboard

**Vérifications:**
- [ ] Menu mobile fonctionne (hamburger menu)
- [ ] Les widgets s'empilent correctement
- [ ] Pas de débordement horizontal
- [ ] Navigation mobile accessible
- [ ] Les cartes sont lisibles

**Problèmes à noter:**
- [ ] Widgets trop larges
- [ ] Textes illisibles
- [ ] Boutons difficiles à cliquer
- [ ] Menu qui ne s'ouvre pas

#### 3.3 Mastery Mobile
**URL:** http://localhost:3000/mastery

**Vérifications:**
- [ ] Les onglets sont accessibles
- [ ] Le contenu s'affiche correctement
- [ ] Les graphiques sont adaptés au mobile
- [ ] Pas de scroll horizontal

#### 3.4 Courses Mobile
**URL:** http://localhost:3000/courses

**Vérifications:**
- [ ] Liste des cours s'affiche correctement
- [ ] Les cartes sont adaptées au mobile
- [ ] Navigation fonctionne

---

### 4. Test Mobile (414x896 - iPhone 11 Pro)

**Résolution:** 414x896

**Pages à tester:**
- [ ] Login
- [ ] Dashboard
- [ ] Mastery
- [ ] Courses
- [ ] Settings

**Vérifications similaires à iPhone SE**

---

### 5. Test Tablet (768x1024 - iPad)

**Résolution:** 768x1024

**Pages à tester:**
- [ ] Login
- [ ] Dashboard
- [ ] Mastery
- [ ] Courses
- [ ] Settings

**Vérifications:**
- [ ] Layout adapté à la tablette
- [ ] Utilisation optimale de l'espace
- [ ] Navigation adaptée

---

### 6. Audit Lighthouse

**Comment faire:**
1. Ouvrir Chrome DevTools (F12)
2. Aller dans l'onglet "Lighthouse"
3. Sélectionner:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. Sélectionner "Desktop" ou "Mobile"
5. Cliquer sur "Generate report"

**Pages à auditer:**
- [ ] Landing Page (/)
- [ ] Login (/login)
- [ ] Dashboard (/dashboard)
- [ ] Mastery (/mastery)
- [ ] Courses (/courses)

**Scores cibles:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

**Problèmes à noter:**
- [ ] Images non optimisées
- [ ] CSS/JS non minifiés
- [ ] Problèmes d'accessibilité
- [ ] Problèmes SEO

---

## 📝 Template de Rapport de Test

### Page: [Nom de la page]
**Résolution:** [Desktop/Mobile/Tablet - Taille]
**Date:** [Date]

**Résultats:**
- ✅ Fonctionne correctement
- ⚠️ Problèmes mineurs
- ❌ Problèmes majeurs

**Problèmes identifiés:**
1. [Description du problème]
2. [Description du problème]

**Screenshots:**
- [ ] Screenshot pris

**Lighthouse Score:**
- Performance: [Score]
- Accessibility: [Score]
- Best Practices: [Score]
- SEO: [Score]

---

## 🎯 Priorités de Test

### Priorité 1 - Avant Production
1. ✅ Test de connexion
2. ✅ Test Dashboard Desktop
3. ✅ Test Dashboard Mobile (375px)
4. ✅ Audit Lighthouse Desktop (Dashboard)
5. ✅ Audit Lighthouse Mobile (Dashboard)

### Priorité 2 - Important
6. ✅ Test Mastery Desktop
7. ✅ Test Mastery Mobile
8. ✅ Test Courses Desktop
9. ✅ Test Courses Mobile
10. ✅ Test Settings Desktop

### Priorité 3 - Nice to have
11. Test autres pages
12. Test tablette
13. Tests d'accessibilité approfondis

---

## 🔧 Outils de Test

### Chrome DevTools
- **Device Toolbar:** Ctrl+Shift+M
- **Lighthouse:** Onglet Lighthouse dans DevTools
- **Console:** Pour vérifier les erreurs JavaScript
- **Network:** Pour vérifier les temps de chargement

### Résolutions à tester
- **Mobile Small:** 375x667 (iPhone SE)
- **Mobile Medium:** 414x896 (iPhone 11 Pro)
- **Mobile Large:** 428x926 (iPhone 12 Pro Max)
- **Tablet:** 768x1024 (iPad)
- **Desktop:** 1920x1080

---

## 📊 Résultats à Documenter

Pour chaque page testée, documenter:
1. **Fonctionnalité:** Est-ce que tout fonctionne?
2. **Design:** Est-ce que c'est beau et cohérent?
3. **Responsive:** Est-ce que ça fonctionne sur mobile?
4. **Performance:** Temps de chargement acceptable?
5. **Accessibilité:** Accessible aux utilisateurs avec handicaps?
6. **Erreurs:** Y a-t-il des erreurs console?

---

**Bon test! 🚀**
