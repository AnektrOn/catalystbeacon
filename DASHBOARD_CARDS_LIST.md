# Liste Complète des Cartes/Widgets du Dashboard

## 📊 Cartes Principales (Toujours Visibles)

### 1. **XPCircleWidgetV2** (Hero)
- **Position** : `grid-hero` (section principale)
- **Description** : Widget circulaire affichant le niveau, XP actuel, XP nécessaire pour le prochain niveau
- **Données** : `levelData` (level, currentXP, nextLevelXP, levelTitle)

### 2. **StreakCard**
- **Position** : `grid-stats` (première carte de stats)
- **Description** : Affiche la série actuelle et le record de série
- **Données** : `stats.streak`, `stats.streakRecord`

### 3. **StatCardV2** (x3 dans la rangée principale)
- **Position** : `grid-stats`
- **Variantes** :
  - ⏰ **Clock** : Temps d'apprentissage cette semaine (`stats.timeThisWeek`)
  - 📚 **BookOpen** : Leçons complétées (`stats.lessonsCompleted`)
  - 🏆 **Award** : Réalisations débloquées (`stats.achievementsUnlocked`)

### 4. **MoodTracker**
- **Position** : `grid-mood-tracker`
- **Description** : Suivi de l'humeur, du sommeil et du stress (style bullet journal)
- **Données** : `profile.id` (userId)

### 5. **XPProgressChart**
- **Position** : `grid-chart`
- **Description** : Graphique de progression XP
- **Données** : `profile.id` (userId)

### 6. **AllLessonsCard**
- **Position** : `grid-chart`
- **Description** : Liste de toutes les leçons
- **Données** : Aucune prop (charge ses propres données)

### 7. **HabitsCompletedCard**
- **Position** : `grid-chart`
- **Description** : Carte des habitudes complétées
- **Données** : Aucune prop (charge ses propres données)

### 8. **ActiveCourseCard** (Conditionnel)
- **Position** : `grid-course`
- **Description** : Carte du cours actif avec progression
- **Condition** : Affichée seulement si `activeCourse` existe
- **Données** : `activeCourse` (title, image, progress, lessonsCompleted, totalLessons, timeRemaining)

---

## 📈 Cartes Supplémentaires (Utilisateurs Payants/Admins)

### 9. **StatCardV2** (x3 supplémentaires)
- **Position** : `grid-stats-extra` (seulement si `!isFreeUser || isAdmin`)
- **Variantes** :
  - 🎯 **Target** : Objectif hebdomadaire (calculé dynamiquement)
  - 📈 **TrendingUp** : Cours actifs (`stats.coursesActive`)
  - 📅 **Calendar** : Sessions planifiées ce mois (valeur fixe "5")

---

## 🎨 Widgets Transférés de Dashboard.jsx

### 10. **DailyRitualWidget**
- **Position** : `grid-chart`
- **Description** : Widget du rituel quotidien (habitudes)
- **Données** : `dashboardData.ritual` (completed, streak, xpReward)

### 11. **CoherenceWidget**
- **Position** : `grid-chart`
- **Description** : Widget de cohérence (énergie, esprit, cœur)
- **Données** : `dashboardData.coherence` (energy, mind, heart)

### 12. **AchievementsWidget**
- **Position** : `grid-chart`
- **Description** : Widget des réalisations/badges
- **Données** : `dashboardData.achievements` (recent, total, nextUnlock)

### 13. **EtherealStatsCards**
- **Position** : `grid-stats`
- **Description** : Cartes de statistiques avec design éthéré
- **Données** : 
  - `dashboardData.ritual.streak`
  - `dashboardData.stats.lessonsCompleted`
  - `dashboardData.stats.learningTime`
  - `dashboardData.achievements.total`

### 14. **CurrentLessonWidget** (Utilisateurs Payants/Admins)
- **Position** : `grid` (lg:col-span-2) - seulement si `!isFreeUser || isAdmin`
- **Description** : Widget de la leçon actuelle
- **Données** : `dashboardData.currentLesson` (lessonId, lessonTitle, courseTitle, progressPercentage, timeRemaining, thumbnailUrl)

### 15. **QuickActionsWidget** (Utilisateurs Payants/Admins)
- **Position** : `grid` (colonne droite) - seulement si `!isFreeUser || isAdmin`
- **Description** : Widget d'actions rapides
- **Données** : Aucune prop (gère ses propres actions)

### 16. **ConstellationNavigatorWidget** (Utilisateurs Payants/Admins)
- **Position** : `mb-8` - seulement si `!isFreeUser || isAdmin`
- **Description** : Navigateur de constellation (écoles et cours)
- **Données** : `dashboardData.constellation` (currentSchool, currentConstellation)

### 17. **TeacherFeedWidget** (Utilisateurs Payants/Admins)
- **Position** : `mb-8` - seulement si `!isFreeUser || isAdmin`
- **Description** : Fil d'actualité des enseignants/admins
- **Données** : `dashboardData.teacherFeed.posts`

---

## 🚫 Cartes Commentées (Non Affichées)

### 18. **SchoolProgressAreaChartMobile** & **SchoolProgressAreaChartDesktop**
- **Position** : `grid-chart` (commenté)
- **Description** : Graphiques de progression par école (mobile et desktop)
- **Statut** : Temporairement masqués jusqu'à résolution d'un problème de visibilité
- **Code** : Lignes 1096-1105 (commenté)

---

## 📦 Composants Non Utilisés (Imports mais Non Rendu)

### 19. **QuickActionsGrid**
- **Import** : Oui
- **Utilisation** : Non (remplacé par `QuickActionsWidget` pour les utilisateurs payants)

### 20. **StatCard**
- **Import** : Oui
- **Utilisation** : Non (utilise `StatCardV2` à la place)

### 21. **SchoolProgressAreaChartMobile** & **SchoolProgressAreaChartDesktop**
- **Import** : Oui
- **Utilisation** : Non (commenté dans le JSX)

---

## 📝 Modals

### 22. **OnboardingModal**
- **Type** : Modal
- **Description** : Modal de bienvenue pour les nouveaux utilisateurs
- **Condition** : Affiché si `showOnboardingModal === true`

### 23. **UpgradeModal**
- **Type** : Modal
- **Description** : Modal d'upgrade pour les utilisateurs gratuits
- **Condition** : Affiché si `showUpgradeModal === true` et `!isAdmin`

---

## 📊 Résumé par Catégorie

### Cartes Toujours Visibles (8)
1. XPCircleWidgetV2
2. StreakCard
3. StatCardV2 (x3)
4. MoodTracker
5. XPProgressChart
6. AllLessonsCard
7. HabitsCompletedCard
8. ActiveCourseCard (si cours actif)

### Cartes Utilisateurs Payants/Admins (6)
9. StatCardV2 supplémentaires (x3)
10. CurrentLessonWidget
11. QuickActionsWidget
12. ConstellationNavigatorWidget
13. TeacherFeedWidget
14. (EtherealStatsCards - visible pour tous mais avec données payantes)

### Widgets Transférés (5)
15. DailyRitualWidget
16. CoherenceWidget
17. AchievementsWidget
18. EtherealStatsCards
19. (CurrentLessonWidget, QuickActionsWidget, ConstellationNavigatorWidget, TeacherFeedWidget déjà comptés)

### Total : **23 composants** (dont 2 modals, 1 commenté, 3 non utilisés)

---

## 🎯 Notes Importantes

- **Condition d'affichage** : Plusieurs widgets ne sont visibles que pour les utilisateurs payants ou admins (`!isFreeUser || isAdmin`)
- **Données** : Certains widgets chargent leurs propres données, d'autres reçoivent des props
- **Layout** : Utilise un système de grid CSS avec des classes spécifiques (`grid-hero`, `grid-stats`, `grid-chart`, etc.)
- **Duplication** : `EtherealStatsCards` et les `StatCardV2` affichent des données similaires mais avec des designs différents
