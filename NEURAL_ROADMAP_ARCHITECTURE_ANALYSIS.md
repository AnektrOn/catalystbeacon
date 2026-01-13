# 🏗️ Analyse Architecturale - Neural Roadmap Feature

## 📋 Vue d'ensemble

Le **Neural Roadmap** est une fonctionnalité de visualisation interactive de progression pédagogique utilisant un design "Neural Path RPG" avec canvas HTML5 pour les animations et connexions entre nœuds.

---

## 🗂️ FICHIERS IDENTIFIÉS PAR CATÉGORIE

### 1. **COMPOSANTS UI PRINCIPAUX** (Composants React)

#### 1.1 Composant Principal
- **`src/components/Roadmap/NeuralPathRoadmap.jsx`** (426 lignes)
  - **Rôle** : Composant principal orchestrant toute la roadmap
  - **Responsabilités** :
    - Chargement des données (lessons, progress)
    - Gestion de l'état (nodes, currentLevel, completedSet)
    - Navigation vers les lessons
    - Intégration avec les modals et animations
  - **Dépendances** : `NeuralCanvas`, `NeuralNode`, `MissionModal`, `CompletionAnimation`
  - **État** : ✅ Actif et utilisé

#### 1.2 Composants Visuels
- **`src/components/Roadmap/NeuralCanvas.jsx`** (234 lignes)
  - **Rôle** : Canvas HTML5 pour dessiner les connexions et particules
  - **Responsabilités** :
    - Animation des connexions entre nœuds (drawChaosBundle)
    - Particules de fond (stars/dust)
    - Spark avatar (étincelle orbitant le nœud actif)
    - Gestion du mouse tracking pour l'interactivité
  - **État** : ⚠️ Récemment modifié (restauration du design original)
  - **Problème identifié** : Conflit entre z-index et mix-blend-mode

- **`src/components/Roadmap/NeuralNode.jsx`** (38 lignes)
  - **Rôle** : Représentation visuelle d'un nœud (lesson)
  - **Responsabilités** :
    - Affichage du nœud avec états (locked, active, completed, boss)
    - Gestion des clics
    - Animation shake pour les nœuds verrouillés
  - **État** : ✅ Stable

#### 1.3 Modals et Overlays
- **`src/components/Roadmap/MissionModal.jsx`**
  - **Rôle** : Modal affichant les détails d'une lesson avant de commencer
  - **Responsabilités** :
    - Affichage des informations de la lesson
    - Bouton "Initialize Link" avec états de chargement
    - Effet glitch sur le titre
  - **État** : ✅ Stable

- **`src/components/Roadmap/CompleteLessonModal.jsx`**
  - **Rôle** : Modal de complétion avec récompenses
  - **Responsabilités** :
    - Affichage des récompenses (XP, skill points, skills)
    - Choix de redirection (Next Lesson / Back to Roadmap)
    - Gestion conditionnelle pour free/paid users
  - **État** : ✅ Récemment amélioré (skill points, mobile responsive)

- **`src/components/Roadmap/CompletionAnimation.jsx`**
  - **Rôle** : Animation de célébration après complétion
  - **Responsabilités** :
    - Animation visuelle de succès
    - Affichage du XP gagné
  - **État** : ✅ Stable

#### 1.4 Composants de Tracking
- **`src/components/Roadmap/LessonTracker.jsx`**
  - **Rôle** : Panneau de progression pendant la lecture d'une lesson
  - **Responsabilités** :
    - Affichage du temps passé et scroll percentage
    - Bouton "Complete Lesson"
    - Intégration avec `CompleteLessonModal`
  - **État** : ✅ Stable

#### 1.5 Composants Legacy (Non utilisés actuellement)
- **`src/components/Roadmap/RoadmapNode.jsx`** + **`.css`**
  - **Rôle** : Ancienne implémentation de nœud
  - **État** : ⚠️ Code mort potentiel (à vérifier)

- **`src/components/Roadmap/RoadmapPath.jsx`** + **`.css`**
  - **Rôle** : Ancienne implémentation de chemin (style Duolingo)
  - **État** : ⚠️ Code mort potentiel (à vérifier)

- **`src/components/Roadmap/RoadmapNotificationBanner.jsx`** + **`.css`**
  - **Rôle** : Bannière de notifications roadmap
  - **État** : ⚠️ Utilisation à vérifier

---

### 2. **STYLES CSS**

- **`src/components/Roadmap/NeuralPathRoadmap.css`** (192 lignes)
  - **Rôle** : Styles principaux du container et HUD
  - **Contenu** : Variables CSS (--neon-blue, --neon-gold, --neon-red), styles du container, HUD, scrollbar, bouton recenter
  - **État** : ⚠️ Conflit z-index/mix-blend-mode identifié

- **`src/components/Roadmap/NeuralNode.css`** (170 lignes)
  - **Rôle** : Styles des nœuds (core, halo, labels, animations)
  - **Contenu** : États (locked, active, completed, boss), animations (pulse, rotate, shake)
  - **État** : ✅ Stable

- **`src/components/Roadmap/NeuralCanvas.jsx`** (styles inline)
  - **Rôle** : Styles inline pour le canvas (position, z-index)
  - **État** : ⚠️ Récemment modifié (ajout de styles inline)

- **Autres CSS** : `MissionModal.css`, `CompleteLessonModal.css`, `CompletionAnimation.css`, `LessonTracker.css`
  - **État** : ✅ Stables

---

### 3. **SERVICES & LOGIQUE MÉTIER**

- **`src/services/roadmapService.js`** (625 lignes)
  - **Rôle** : Service central pour toutes les opérations roadmap
  - **Méthodes principales** :
    - `getRoadmapLessons(masterschool)` : Récupère les lessons triées
    - `getUserRoadmapProgress(userId, masterschool)` : Récupère la progression
    - `completeLesson(...)` : Complète une lesson et attribue récompenses
    - `updateLessonTracking(...)` : Met à jour le tracking (temps, scroll)
    - `getLessonProgress(...)` : Récupère la progression d'une lesson
    - `getNextLesson(userId, masterschool)` : Trouve la prochaine lesson
  - **Dépendances** : Supabase (tables: `course_metadata`, `course_content`, `roadmap_progress`, `user_lesson_progress`, `profiles`, `user_skills`, `skills`)
  - **État** : ✅ Actif, récemment amélioré (skill points)

---

### 4. **HOOKS CUSTOM**

- **`src/hooks/useRoadmapLessonTracking.js`** (275 lignes)
  - **Rôle** : Hook pour tracker le temps et le scroll pendant la lecture
  - **Responsabilités** :
    - Timer automatique (1 seconde)
    - Calcul du scroll percentage (`.glass-main-panel`)
    - Mise à jour automatique toutes les 10 secondes
    - Validation des requirements (2 minutes, 100% scroll)
  - **Dépendances** : `roadmapService.updateLessonTracking()`
  - **État** : ✅ Stable

---

### 5. **PAGES & ROUTING**

- **`src/pages/RoadmapIgnition.jsx`** (13 lignes)
  - **Rôle** : Page wrapper pour la route `/roadmap/:masterschool`
  - **Responsabilités** : Simple wrapper passant `masterschool="Ignition"` au composant
  - **État** : ✅ Stable

- **`src/App.js`** (Routes)
  - **Rôle** : Définition des routes roadmap
  - **Routes identifiées** :
    - `/roadmap/:masterschool` → `RoadmapIgnition`
    - `/roadmap/ignition/:statLink` → `RoadmapIgnition`
  - **État** : ✅ Stable

---

### 6. **INTÉGRATION AVEC AUTRES COMPOSANTS**

- **`src/pages/CoursePlayerPage.jsx`**
  - **Rôle** : Page de lecture de lesson
  - **Intégration** :
    - Détection du paramètre `fromRoadmap=true`
    - Restriction d'accès pour free users
    - Intégration avec `LessonTracker` et `CompleteLessonModal`
    - Redirection vers roadmap après complétion
  - **État** : ✅ Stable, récemment amélioré

- **`src/components/AppShellMobile.jsx`**
  - **Rôle** : Navigation mobile
  - **Intégration** : Lien "Roadmap" dans le menu bottom nav
  - **État** : ✅ Stable

---

### 7. **BASE DE DONNÉES & SQL**

- **`supabase/fix-roadmap-functions.sql`** (237 lignes)
  - **Rôle** : Fonctions SQL pour complétion de lessons
  - **Fonctions** :
    - `award_roadmap_lesson_xp(...)` : Attribue XP et skill points
    - `update_roadmap_progress(...)` : Met à jour la progression roadmap
  - **Tables utilisées** :
    - `course_content` : Données des lessons
    - `course_metadata` : Métadonnées des cours (difficulty, stats_linked)
    - `profiles` : XP de l'utilisateur
    - `user_skills` : Progression des skills
    - `skills` : Définition des skills
    - `roadmap_progress` : Progression globale roadmap
    - `user_lesson_progress` : Progression par lesson
  - **État** : ✅ Récemment corrigé (skill points, UUID handling)

---

### 8. **CONTEXTS & PROVIDERS**

- **`src/contexts/AuthContext.jsx`**
  - **Rôle** : Gestion de l'authentification
  - **Utilisation** : `useAuth()` pour obtenir `user`
  - **État** : ✅ Stable

- **`src/contexts/PageTransitionContext.jsx`**
  - **Rôle** : Gestion des transitions globales
  - **Utilisation** : `usePageTransition()` pour `endTransition()` après chargement
  - **État** : ✅ Stable (récemment refactoré pour overlay pattern)

- **`src/hooks/useSubscription.js`**
  - **Rôle** : Détection du statut d'abonnement
  - **Utilisation** : `isFreeUser` pour restrictions d'accès
  - **État** : ✅ Stable

---

## 🔍 PROBLÈMES IDENTIFIÉS

### 1. **Conflit Z-Index / Mix-Blend-Mode**
- **Fichier** : `NeuralPathRoadmap.css` + `NeuralCanvas.jsx`
- **Problème** : Le canvas a `z-index: 1` mais les nœuds ont `z-index: 10`. Le `mix-blend-mode: screen` peut rendre les connexions invisibles.
- **Impact** : Les connexions ne sont pas visibles (problème actuel)

### 2. **Code Mort Potentiel**
- **Fichiers** : `RoadmapNode.jsx`, `RoadmapPath.jsx`, `RoadmapNotificationBanner.jsx`
- **Problème** : Composants non utilisés dans le flux principal
- **Impact** : Maintenance inutile, confusion

### 3. **Styles Inline dans NeuralCanvas**
- **Fichier** : `NeuralCanvas.jsx`
- **Problème** : Styles inline ajoutés récemment (hack de sécurité)
- **Impact** : Mélange de styles CSS et inline, difficile à maintenir

---

## 📦 DÉPENDANCES EXTERNES

### NPM Packages (déjà installés)
- ✅ `react` (19.2.0)
- ✅ `react-dom` (19.2.0)
- ✅ `react-router-dom` (6.30.1)
- ✅ `@supabase/supabase-js` (2.75.0)
- ✅ `react-hot-toast` (2.6.0)

### Fonts & Icons
- ✅ Font Awesome (via CDN dans HTML original, à vérifier dans React)
- ✅ Google Fonts - Rajdhani (déjà importé dans CSS)

### Pas de dépendances manquantes identifiées

---

## 🎯 FICHIERS À MODIFIER/CRÉER (selon la tâche)

### Si la tâche concerne la visibilité des connexions :
1. **`src/components/Roadmap/NeuralCanvas.jsx`** - Ajuster le dessin des connexions
2. **`src/components/Roadmap/NeuralPathRoadmap.css`** - Corriger z-index/mix-blend-mode
3. **`src/components/Roadmap/NeuralNode.css`** - Vérifier z-index des nœuds

### Si la tâche concerne le nettoyage :
1. **`src/components/Roadmap/RoadmapNode.jsx`** - Supprimer si non utilisé
2. **`src/components/Roadmap/RoadmapPath.jsx`** - Supprimer si non utilisé
3. **`src/components/Roadmap/RoadmapNotificationBanner.jsx`** - Vérifier utilisation

---

## ✅ VALIDATION REQUISE

**Avant de procéder aux modifications, merci de confirmer :**

1. **Quelle est la tâche exacte à accomplir ?**
   - Corriger la visibilité des connexions ?
   - Nettoyer le code mort ?
   - Améliorer les performances ?
   - Autre ?

2. **Faut-il supprimer les composants legacy** (`RoadmapNode`, `RoadmapPath`, `RoadmapNotificationBanner`) ?

3. **Souhaitez-vous garder le design original HTML** ou adapter pour React ?

4. **Y a-t-il des contraintes de performance** à considérer (nombre de nœuds, animations) ?

---

**Document généré le** : $(date)
**Architecte** : AI Assistant
**Version** : 1.0
