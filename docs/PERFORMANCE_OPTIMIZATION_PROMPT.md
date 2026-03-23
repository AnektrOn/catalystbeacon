# Prompt — Optimisation performance globale de l’app (mode Plan, Sonnet)

**Objectif** : Améliorer drastiquement la vitesse perçue et réelle de l’ensemble de l’application (React + Vite + Supabase). Ce prompt est conçu pour être exécuté en **mode Plan** avec **Sonnet** : produire un plan d’actions structuré, priorisé et vérifiable, puis l’implémenter par étapes.

**Contexte projet** :
- React, Vite, React Router, Supabase
- Routes publiques (login, signup, pricing, `/`, `/entry` Matrix, `/landing`) et protégées (dashboard, roadmap, stellar map, courses, etc.)
- Contextes : `ThemeContext`, `AuthContext`, `DataCacheContext`, `PageTransitionContext`
- Pages lourdes : MatrixEntryPage (canvas + audio), StellarMapPage (R3F/Three.js), DashboardNeomorphic, Roadmap (NeuralPathRoadmap, canvas), CoursePlayerPage
- Lazy loading des pages déjà en place dans `App.js` ; composants partagés (AppShell, AppShellMobile) chargés au premier accès protégé

---

## 1. Livrables attendus du mode Plan

1. **Audit ciblé**  
   Identifier, dans l’ordre d’impact perçu/utilisateur :
   - Les plus gros bundles / chunks (Vite build + `rollup-plugin-visualizer` ou équivalent si disponible).
   - Les composants ou pages qui re-rendent trop souvent (contexte global, listes longues, cartes, roadmap).
   - Les requêtes réseau redondantes ou bloquantes au chargement (Auth, profile, notifications, XP, level).
   - Les assets lourds (images, polices, audio) non différés ou non optimisés.

2. **Plan d’actions priorisé**  
   Liste numérotée d’actions avec :
   - **Quoi** : fichier(s) / zone du code concernée.
   - **Pourquoi** : gain attendu (TTI, LCP, re-renders, taille bundle, etc.).
   - **Comment** : résumé technique (sans tout le code, mais de quoi implémenter).
   - **Risque** : faible / moyen / élevé et mitigation si besoin.

3. **Implémentation par étapes**  
   Chaque étape doit rester déployable et testable sans casser l’existant. Le plan doit indiquer l’ordre d’exécution (ex. d’abord bundle/route, puis contexte, puis composants lourds).

---

## 2. Axes d’optimisation à couvrir (à intégrer dans le plan)

### 2.1 Bundle et chargement initial
- **Code splitting** : vérifier que les routes lourdes (StellarMap, MatrixEntry, CoursePlayer, Roadmap) sont bien dans des chunks séparés et que les imports dynamiques sont utilisés pour les gros composants (ex. Three.js, R3F, canvas).
- **Dépendances** : repérer les libs lourdes importées en racine (ex. `@react-three/fiber`, `@react-three/drei`, Stripe) et les charger uniquement sur les routes qui en ont besoin.
- **Vite** : `build.rollupOptions.output.manualChunks` pour grouper par domaine (e.g. `vendor-react`, `vendor-three`, `vendor-supabase`) et réduire la taille du main chunk.

### 2.2 Contexte et re-renders
- **AuthContext / DataCacheContext** : éviter que tout l’arbre ne re-render à chaque mise à jour (séparer state “auth” vs “profile/notifications/XP” si tout est dans le même contexte ; utiliser des sélecteurs ou sous-contextes).
- **ThemeContext** : idem ; s’assurer que seuls les composants qui lisent le thème se re-rendent.
- **Memoization** : `React.memo` sur les composants de liste (roadmap nodes, course list, habit cards) et sur les composants enfants coûteux ; `useMemo` pour les listes/objets dérivés passés en props ; `useCallback` pour les handlers passés aux enfants mémorisés.

### 2.3 Données et réseau
- **Éviter les cascades** : au premier chargement protégé (ex. après login), ne pas déclencher 5+ requêtes en parallèle si certaines peuvent être dédupliquées ou mises en cache (DataCacheContext, `useCachedData`).
- **Prefetch / cache** : pour les routes probables après login (dashboard, roadmap), précharger ou mettre en cache les données critiques (profile, XP, level) sans bloquer le premier paint.
- **Supabase** : réutilisation des requêtes (éviter double fetch pour le même `profile` ou les mêmes `notifications` entre AppShell et AppShellMobile ou entre layout et page).

### 2.4 Composants lourds
- **MatrixEntryPage** : canvas (matrix) + plusieurs pistes audio. S’assurer que le canvas est throttled (requestAnimationFrame, pas de recalcul inutile) et que les ressources audio sont libérées au démontage ou au skip (déjà corrigé côté skip).
- **StellarMapPage (R3F/Three.js)** : chargement différé du Canvas et des meshes ; réduire les re-renders des orbites/nodes (React.memo, stabiliser les props).
- **Roadmap (NeuralPathRoadmap, NeuralCanvas)** : même logique (memo, évitement de recréer des objets en render).
- **Dashboard / listes** : virtualisation si listes longues (habits, cours, notifications) ; skeleton/placeholder pour le contenu secondaire.

### 2.5 Assets (images, polices, audio)
- **Images** : format moderne (WebP/AVIF) où possible ; `loading="lazy"` ; dimensions explicites pour éviter layout shift.
- **Polices** : `font-display: optional` ou `swap` ; sous-ensemble de caractères si possible pour réduire le temps de premier rendu.
- **Audio** : ne pas précharger tous les sons au montage de la page ; charger au moment de l’interaction (ex. Matrix entry : chargement à l’acte concerné).

### 2.6 Navigation et ressenti
- **Skeleton / états de chargement** : remplacer les spinners génériques par des skeletons proches du layout final (déjà partiellement en place avec `SkeletonLoader`).
- **Transition entre routes** : éviter que l’écran reste vide pendant le lazy load ; garder un fallback cohérent (ex. skeleton par type de page) et si possible précharger la route suivante probable (ex. après login → dashboard).

---

## 3. Contraintes et règles

- Ne pas casser les règles Supabase/Env déjà en place (env variables, pas de clés en dur, gestion d’erreurs).
- Toute modification de contexte (Auth, Theme, DataCache) doit préserver le comportement actuel (auth, cache, abonnement) et être testée (login, refresh, navigation).
- Les optimisations doivent être mesurables (avant/après) : taille des chunks, temps jusqu’à interactivité (TTI), ou au minimum temps de chargement perçu sur les parcours critiques (entry → landing, login → dashboard).

---

## 4. Format de sortie attendu

Pour chaque **étape** du plan :

1. **Titre** : court et actionnable.
2. **Fichiers / zones** : chemins ou noms de composants.
3. **Actions** : liste numérotée des changements à faire.
4. **Critère de succès** : comment vérifier que l’optimisation est en place et efficace (ex. “Le chunk `entry-*.js` ne contient pas Three.js”, “AuthContext ne provoque pas de re-render de la liste des cours”).
5. **Ordre** : étape N dépend-elle des étapes 1..N-1 ?

Ensuite, implémenter les étapes dans cet ordre en ne modifiant qu’un nombre limité de fichiers par étape, et en vérifiant que l’app build et que les parcours critiques fonctionnent toujours.

---

## 5. Résumé pour copier-coller (version courte)

```
Tu es en mode Plan (Sonnet). Objectif : améliorer drastiquement la vitesse de toute l’app React/Vite/Supabase.

Livrables :
1) Audit : gros chunks, re-renders inutiles, requêtes redondantes, assets lourds.
2) Plan priorisé : quoi / pourquoi / comment / risque pour chaque action.
3) Implémentation par étapes (bundle → contextes → composants lourds → assets).

Axes obligatoires : code splitting et manualChunks Vite ; réduction des re-renders (Auth/DataCache/Theme + memo/useMemo/useCallback) ; déduplication des fetches au chargement ; optimisation MatrixEntryPage, StellarMapPage (R3F), Roadmap ; images/polices/audio différés ou lazy ; skeletons et préchargement de routes.

Contraintes : garder les règles Supabase/Env ; pas de régression auth/cache ; changements mesurables (chunks, TTI ou temps perçu). Sortir un plan numéroté avec critères de succès par étape, puis implémenter étape par étape.
```
