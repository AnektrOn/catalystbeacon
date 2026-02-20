# Où est géré le déblocage des nodes dans la roadmap

Ce fichier recense **tout le code** qui détermine si un node est **locked**, **active** ou **completed**, et comment le “prochain” node est choisi après une complétion.

---

## 1. Source des données : `is_completed` par leçon

- **Fichier :** `src/services/roadmapService.js`
- **Fonction :** `getRoadmapLessons(masterschool, userId, limit)`
  - Appelle l’RPC **`generate_roadmap_nodes`** (Supabase) avec `p_user_id`, `p_masterschool`, `p_limit`.
  - Chaque leçon renvoyée contient **`is_completed`** (booléen), fourni par le RPC (lui-même basé sur `user_lesson_progress.is_completed`).
  - En cas d’erreur RPC, fallback **`_getRoadmapLessonsFallback`** qui construit la liste à partir de `course_metadata`, `course_content`, `user_lesson_progress` (là aussi `is_completed` vient de la DB).

Donc : **locked/active/completed** côté UI dépendent de **`lesson.is_completed`** qui vient soit de **`generate_roadmap_nodes`**, soit du fallback.

---

## 2. Backend : qui marque une leçon comme complétée et qui calcule “la prochaine”

- **Fichier :** `supabase/migrations/20260211_lesson_completion_events_and_next_node.sql` (et éventuellement `complete_lesson_transaction.sql`)
- **Fonction SQL :** `complete_lesson_transaction(p_user_id, p_lesson_id, p_course_id, p_chapter_number, p_lesson_number, p_masterschool, p_lesson_title)`
  - Met à jour **`user_lesson_progress`** : `SET is_completed = true, completed_at = NOW()` pour la leçon concernée.
  - À la fin, appelle **`generate_roadmap_nodes(p_user_id, p_masterschool, 1)`** et prend le premier résultat comme **`next_lesson_id`**.
  - Retourne une ligne avec **`success`**, **`message`**, **`xp_earned`**, **`next_lesson_id`**.

Donc : le “déblocage” en base est fait ici (UPDATE `user_lesson_progress`), et le **prochain node** côté backend est **`next_lesson_id`** retourné par cette fonction.

- **Fichier :** `supabase/migrations/generate_roadmap_nodes.sql` (ou `APPLY_FIX_42702_RUN_IN_SQL_EDITOR.sql`)
- **Fonction SQL :** `generate_roadmap_nodes(p_user_id, p_masterschool, p_limit)`
  - Lit **`profiles.institute_priority`** pour l’ordre des instituts.
  - Construit une liste de leçons (depuis `course_metadata`, `course_content`, **`user_lesson_progress`** pour **`is_completed`**).
  - Trouve le **premier index** où **`is_completed = false`** (`v_first_incomplete_index`).
  - Retourne les **`p_limit`** leçons à partir de cet index (donc “les N prochaines à faire”).
  - Chaque ligne contient **`lesson_id`**, **`is_completed`**, etc.

Résumé : **déblocage en base** = `complete_lesson_transaction` met à jour `user_lesson_progress.is_completed`. **Liste “prochains nodes”** = `generate_roadmap_nodes` qui s’appuie sur ce même `is_completed`.

---

## 3. Frontend : qui appelle la complétion et récupère `next_lesson_id`

- **Fichier :** `src/services/roadmapService.js`
- **Fonction :** `completeLesson(userId, lessonId, courseId, chapterNumber, lessonNumber, masterschool, lessonTitle)`
  - Appelle l’RPC **`complete_lesson_transaction`** avec les mêmes paramètres.
  - Lit la première ligne retournée et expose **`rewards.next_lesson_id`** (et `xp_earned`, etc.).

- **Fichier :** `src/components/Roadmap/CompleteLessonModal.jsx`
- **Fonction :** `handleBackToRoadmap()`
  - Construit l’URL de retour vers la roadmap avec des query params :
    - `completed=true`
    - `lessonId=${courseId}-${chapterNumber}-${lessonNumber}`
    - `xp=...`
    - **`nextLessonId=rewards.next_lesson_id`** (si présent)
  - Donc le **prochain node** côté UI est censé être passé via **`nextLessonId`** dans l’URL.

---

## 4. Roadmap : lecture des params et décision “quel node est actif”

- **Fichier :** `src/components/Roadmap/NeuralPathRoadmap.jsx`

### 4.1 Effet “retour après complétion” (lignes ~88–123)

```js
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const completed = params.get('completed');
  const lessonId = params.get('lessonId');
  const nextLessonId = params.get('nextLessonId');
  const xp = params.get('xp');

  if (completed !== 'true' || !lessonId) return;

  // ... build completedLesson, setShowCompletion(true) ...

  loadRoadmap(nextLessonId || undefined, lessonId);
  window.history.replaceState({}, '', window.location.pathname);
}, [lessons]);
```

- C’est ici qu’on lit **`nextLessonId`** (fourni par `CompleteLessonModal` depuis **`rewards.next_lesson_id`**).
- On appelle **`loadRoadmap(nextLessonId || undefined, lessonId)`** :
  - **1er argument :** `forceActiveLessonId` = `nextLessonId` si présent, sinon `undefined`.
  - **2ème argument :** `justCompletedLessonId` = `lessonId` (leçon qu’on vient de compléter).

### 4.2 Calcul de l’index du node “actif” (lignes ~165–181)

```js
const getActiveIndex = (list, forceActiveLessonId, justCompletedLessonId) => {
  if (!list?.length) return 0;
  let activeIndex = -1;
  if (forceActiveLessonId) {
    activeIndex = list.findIndex(l => l.lesson_id === forceActiveLessonId);
  }
  if (activeIndex === -1) {
    activeIndex = list.findIndex(l => !l.is_completed);
  }
  if (justCompletedLessonId && activeIndex >= 0 && list[activeIndex]?.lesson_id === justCompletedLessonId) {
    const nextIdx = list.findIndex((l, i) => i > activeIndex && !l.is_completed);
    activeIndex = nextIdx >= 0 ? nextIdx : activeIndex + 1;
  }
  if (activeIndex < 0 || activeIndex >= list.length) activeIndex = list.length - 1;
  return Math.max(0, activeIndex);
};
```

- **Ordre de priorité pour “qui est actif” :**
  1. Si **`forceActiveLessonId`** (ex. `nextLessonId` de l’URL) est fourni → on prend l’index de la leçon dont **`lesson_id`** est égal.
  2. Sinon → premier index où **`!l.is_completed`**.
  3. Si cet index pointe encore sur **`justCompletedLessonId`** (leçon qu’on vient de compléter) → on prend le **prochain** index avec **`!l.is_completed`**, sinon **activeIndex + 1**.

Donc le **déblocage visuel** (quel node est actif) est entièrement piloté par **`getActiveIndex`** + la liste **`list`** (et ses **`is_completed`**).

### 4.3 `loadRoadmap(forceActiveLessonId, justCompletedLessonId)` (lignes ~183–252)

- Si **batch en cours** (déjà 10 leçons dont au moins une non complétée) :
  - Si **`justCompletedLessonId`** est fourni :
    - On met à jour la liste en local : la leçon correspondante passe à **`is_completed: true`**.
    - Si les 10 sont maintenant toutes complétées → on refetch les 10 suivantes et on appelle **`getActiveIndex(list, null, null)`** pour le niveau actif.
    - Sinon → **`getActiveIndex(updatedLessons, forceActiveLessonId, justCompletedLessonId)`** puis **`createNodes(updatedLessons, level)`**.
  - Si pas de **`justCompletedLessonId`** (simple visite roadmap) → **`getActiveIndex(current, forceActiveLessonId, null)`** puis **`createNodes(current, level)`**.
- Si **pas de batch en cours** (premier chargement ou nouvelle batch) :
  - Appel **`roadmapService.getRoadmapLessons(...)`** → récupère les leçons avec **`is_completed`**.
  - **`setLessons(list)`**, puis **`getActiveIndex(list, forceActiveLessonId, justCompletedLessonId)`**, puis **`createNodes(list, calculatedLevel)`**.

En résumé : **déblocage de la liste** = soit mise à jour locale (**`is_completed: true`**), soit nouveau fetch ; **quel node est actif** = toujours **`getActiveIndex`** avec la liste courante (et éventuellement **`forceActiveLessonId`** / **`justCompletedLessonId`**).

---

## 5. Passage de “liste de leçons” → “nodes” (locked / active / completed)

- **Fichier :** `src/components/Roadmap/NeuralPathRoadmap.jsx`
- **Fonction :** `createNodes(lessonsList, activeLevel)` (lignes ~260–328)

Pour chaque leçon dans **`lessonsList`** :

```js
const isCompleted = lesson.is_completed;

let status = 'locked';
if (isCompleted) status = 'completed';
else if (i === activeLevel) status = 'active';

// ...
nodeList.push({
  id: i,
  lesson,
  // ...
  status,
  isLocked: status === 'locked',
  is_completed: isCompleted
});
```

- **Règle :**
  - **completed** ↔ **`lesson.is_completed === true`**.
  - **active** ↔ index **`i === activeLevel`** (et pas completed).
  - **locked** ↔ pas completed et pas active (tous les nodes après l’actif jusqu’aux prochains non complétés sont “locked” avec la logique actuelle : tout ce qui n’est ni completed ni active est locked).

Donc le **déblocage des nodes** (affichage locked/active/completed) est entièrement déterminé par :
1. **`lesson.is_completed`** (données venant du backend ou de la mise à jour locale).
2. **`activeLevel`** (calculé par **`getActiveIndex`** dans **`loadRoadmap`**).

---

## 6. Clic sur un node et ouverture de la leçon

- **Fichier :** `src/components/Roadmap/NeuralPathRoadmap.jsx`
- **Fonction :** `handleNodeClick(node)` (lignes ~332–339)  
  - Si **`node.status === 'locked'`** → on ne fait rien (ou shake dans le node).
  - Sinon → **`setSelectedNode(node)`**, **`setIsModalOpen(true)`** (MissionModal).

- **Fonction :** `startLevel()` (lignes ~342–354)  
  - Construit une **returnUrl** avec **`completed=true`** et **`lessonId=...`** (pas de **`nextLessonId`** ici ; il sera ajouté au retour par **CompleteLessonModal** après **complete_lesson_transaction**).
  - **navigate** vers la page leçon avec **`return=...&fromRoadmap=true&isFreeUser=...`**.

Donc le “déblocage” côté clic = seuls les nodes **non locked** (i.e. **active** dans la logique actuelle) ouvrent la modal / la leçon.

---

## 7. Composant d’affichage d’un node

- **Fichier :** `src/components/Roadmap/NeuralNode.jsx`
- **Comportement :**
  - **`node.isLocked`** → clic = shake, pas d’ouverture de modal ; tooltip éventuel (**`lockReason`**).
  - **`status = node.isLocked ? 'locked' : node.status`** → utilisé pour les classes CSS (locked / active / completed).
  - **`node.is_completed`** → affichage “Completed” (tooltip, style).

Donc le **déblocage visuel** (clic autorisé ou non, style) est piloté par **`node.isLocked`** et **`node.status`** / **`node.is_completed`** fournis par **`createNodes`**.

---

## Résumé : chaîne complète du déblocage

| Étape | Où | Quoi |
|-------|----|------|
| 1. Compléter une leçon | `CompleteLessonModal` → `roadmapService.completeLesson()` | Appel RPC **`complete_lesson_transaction`**. |
| 2. Backend met à jour + calcule “next” | `complete_lesson_transaction` (SQL) | UPDATE **`user_lesson_progress.is_completed`** ; appel **`generate_roadmap_nodes(..., 1)`** → **`next_lesson_id`** retourné. |
| 3. Frontend reçoit next | `roadmapService.completeLesson()` | **`rewards.next_lesson_id`** = première ligne RPC. |
| 4. Retour roadmap avec params | `CompleteLessonModal.handleBackToRoadmap()` | URL avec **`nextLessonId=rewards.next_lesson_id`** (si présent). |
| 5. Roadmap lit l’URL | `NeuralPathRoadmap` (useEffect completion) | **`loadRoadmap(nextLessonId, lessonId)`**. |
| 6. Choix du node actif | **`getActiveIndex(list, forceActiveLessonId, justCompletedLessonId)`** | **forceActiveLessonId** = **nextLessonId** ; sinon premier **!is_completed** ; si c’est encore la leçon complétée, on passe au suivant. |
| 7. Liste affichée | **`loadRoadmap`** | Soit liste déjà en mémoire (batch en cours) avec mise à jour **is_completed** locale, soit **getRoadmapLessons()** (RPC **generate_roadmap_nodes** ou fallback). |
| 8. Liste → nodes | **`createNodes(lessonsList, activeLevel)`** | **completed** si **lesson.is_completed** ; **active** si **i === activeLevel** ; sinon **locked**. **isLocked = (status === 'locked')**. |
| 9. Clic | **`NeuralNode`** + **`handleNodeClick`** | Clic autorisé seulement si **!node.isLocked** (donc node **active**). |

Si “ça ne débloque pas”, vérifier dans l’ordre :
- **`rewards.next_lesson_id`** bien retourné par **`complete_lesson_transaction`** (et RPC sans erreur 42702).
- **`nextLessonId`** bien présent dans l’URL au retour (**`handleBackToRoadmap`**).
- **`loadRoadmap(nextLessonId, lessonId)`** bien appelé avec ces valeurs (useEffect qui lit **completed** / **lessonId**).
- **`getActiveIndex`** avec **forceActiveLessonId = nextLessonId** trouve bien un index dans la liste (**`lesson_id`** doit matcher).
- Liste des 10 = même batch qu’avant (pas remplacée par un fetch qui renverrait un autre ordre) et **is_completed** à jour pour la leçon complétée.
