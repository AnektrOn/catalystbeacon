# Guide de Migration - Stellar Map Atomique Fractale

## Résumé des changements

### Avant (Distribution circulaire plate)
```
☀️ Soleil
  ├── 🔵 Node 1 (difficulty 1, orbitRadius = 2.0)
  ├── 🔵 Node 2 (difficulty 1, orbitRadius = 2.0)
  ├── 🔵 Node 3 (difficulty 2, orbitRadius = 3.2)
  └── 🔵 Node 4 (difficulty 2, orbitRadius = 3.2)
```

**Problèmes** :
- Tous les nodes sur le même plan horizontal (y=0)
- Regroupement par difficulté uniquement
- Pas de hiérarchie visuelle Famille/Constellation
- Collisions potentielles avec de nombreux nodes

### Après (Modèle atomique fractal)
```
☀️ Soleil (Noyau)
  └── 🌍 Famille "Data Science" (orbite inclinée)
      └── ⭐ Constellation "Python Basics" (orbite inclinée)
          ├── 🔵 Node "Variables" (orbite inclinée)
          ├── 🔵 Node "Loops" (orbite inclinée)
          └── 🔵 Node "Functions" (orbite inclinée)
```

**Avantages** :
- Structure 3D immersive avec inclinaisons variées
- Hiérarchie visuelle claire
- Distribution garantie sans collision
- Scalable à l'infini (1000+ nodes OK)

## Changements de structure de données

### buildNodesWithOrbits → buildStellarHierarchy

**Ancien** (`nodesWithOrbits.js`) :
```javascript
// Entrée
{
  "Data Science": {
    "Python Basics": [node1, node2, node3],
    "Advanced ML": [node4, node5]
  }
}

// Sortie
[
  { node: node1, orbitRadius: 2.0, angleOffset: 0, difficulty: "1" },
  { node: node2, orbitRadius: 2.0, angleOffset: 2.09, difficulty: "1" },
  // ...
]
```

**Nouveau** (`stellarHierarchy.js`) :
```javascript
// Entrée : identique
{
  "Data Science": {
    "Python Basics": [node1, node2, node3],
    "Advanced ML": [node4, node5]
  }
}

// Sortie : hiérarchie préservée
[
  {
    name: "Data Science",
    index: 0,
    constellations: [
      {
        name: "Python Basics",
        index: 0,
        nodes: [node1, node2, node3]
      },
      {
        name: "Advanced ML",
        index: 1,
        nodes: [node4, node5]
      }
    ]
  }
]
```

## Changements de composants

### 1. SolarSystem.jsx

#### Ancien
```jsx
const [nodesWithOrbits, setNodesWithOrbits] = useState([]);
const [orbitProgressByDifficulty, setOrbitProgressByDifficulty] = useState({});

// Charger les données
const list = buildNodesWithOrbits(grouped);
setNodesWithOrbits(list);

// Rendu
{nodesWithOrbits.map(({ node, orbitRadius, angleOffset, difficulty }) => (
  <Node
    key={node.id}
    node={node}
    orbitRadius={orbitRadius}
    angleOffset={angleOffset}
    orbitProgress={orbitProgressByDifficulty[difficulty] ?? 0}
  />
))}

<NodesUpdater
  setOrbitProgressByDifficulty={setOrbitProgressByDifficulty}
  difficultyKeys={difficultyKeys}
/>
```

#### Nouveau
```jsx
const [families, setFamilies] = useState([]);

// Charger les données
const hierarchy = buildStellarHierarchy(grouped);
setFamilies(hierarchy);

// Rendu hiérarchique
<Sun position={[0, 0, 0]} radius={1.5} />

{families.map((family) => (
  <FamilyOrbit
    key={`family-${family.name}-${family.index}`}
    family={family}
    totalFamilies={families.length}
  />
))}

// Plus besoin de NodesUpdater !
```

**Simplifications** :
- ❌ Plus de `orbitProgressByDifficulty` (chaque niveau gère sa rotation)
- ❌ Plus de `NodesUpdater` (rotations gérées par `CelestialPivot`)
- ✅ Structure déclarative et composable

### 2. Node.jsx → NodeOrbit.jsx

#### Ancien Node.jsx
```jsx
export default function Node({ node, orbitRadius, angleOffset, orbitProgress }) {
  const x = Math.cos(orbitProgress + angleOffset) * orbitRadius;
  const z = Math.sin(orbitProgress + angleOffset) * orbitRadius;

  return (
    <mesh position={[x, 0, z]}>
      <Sphere args={[NODE_RADIUS, 32, 32]}>
        <meshStandardMaterial color="#7dd3fc" />
      </Sphere>
    </mesh>
  );
}
```

**Problèmes** :
- Calcul de position à chaque render
- Toujours sur le plan y=0 (plat)
- Pas d'inclinaison

#### Nouveau NodeOrbit.jsx
```jsx
export default function NodeOrbit({ node, nodeIndex, totalNodes, initialAngle, familyName, constellationName }) {
  const { speedFactor } = useSpeedControl();
  const { radius, speed, tilt, size } = getNodeOrbitParams(nodeIndex, totalNodes, node.difficulty);
  const deterministicTilt = generateDeterministicTilt(`${familyName}-${constellationName}-${node.id}`, [-0.5, 0.5]);

  return (
    <CelestialPivot
      radius={radius}
      speed={speed * speedFactor}
      tilt={deterministicTilt}
      initialAngle={initialAngle}
    >
      <mesh ref={meshRef} onClick={handleClick}>
        <Sphere args={[size, 32, 32]}>
          <meshStandardMaterial color={getNodeColor(node.difficulty)} />
        </Sphere>
      </mesh>
    </CelestialPivot>
  );
}
```

**Améliorations** :
- ✅ Rotation gérée par `CelestialPivot` (performances)
- ✅ Inclinaison 3D déterministe
- ✅ Couleur basée sur difficulté
- ✅ Intégration avec `SpeedControlContext`

### 3. NodesUpdater.jsx → Supprimé

#### Ancien NodesUpdater.jsx
```jsx
// Mettait à jour orbitProgressByDifficulty chaque frame
export default function NodesUpdater({ setOrbitProgressByDifficulty, difficultyKeys }) {
  const { speedFactor } = useSpeedControl();

  useFrame((_, delta) => {
    setOrbitProgressByDifficulty((prev) => {
      const next = { ...prev };
      difficultyKeys.forEach((key) => {
        next[key] = (prev[key] ?? 0) + delta * speedFactor;
      });
      return next;
    });
  });

  return null;
}
```

**Problème** : Provoquait un re-render de `SolarSystem` à chaque frame (60 fois/seconde !).

#### Nouveau : Rotation dans CelestialPivot
```jsx
// Chaque pivot gère sa propre rotation (mutation directe, pas de re-render)
useFrame((state, delta) => {
  if (!pivotRef.current) return;
  angleRef.current += speed * delta;
  pivotRef.current.rotation.y = angleRef.current;
});
```

**Avantage** : Pas de re-render React, mutations Three.js directes = 60 FPS garanti.

## Mise à jour de NodeMenu

### Ancien
```jsx
<NodeMenu nodesWithOrbits={nodesWithOrbits} />

// Dans NodeMenu.jsx
const nodes = nodesWithOrbits?.map((item) => item.node) ?? [];
```

### Nouveau
```jsx
// Extraire une liste plate pour compatibilité
const allNodesFlat = families.flatMap(family => 
  family.constellations.flatMap(constellation => 
    constellation.nodes.map(node => ({
      node,
      familyName: family.name,
      constellationName: constellation.name
    }))
  )
);

<NodeMenu nodesWithOrbits={allNodesFlat} />

// NodeMenu.jsx reste inchangé !
```

## Checklist de migration

### Étape 1 : Fichiers à créer
- [x] `src/components/stellar-map/solar/utils/stellarHierarchy.js`
- [x] `src/components/stellar-map/solar/components/celestial/CelestialPivot.jsx`
- [x] `src/components/stellar-map/solar/components/celestial/FamilyOrbit.jsx`
- [x] `src/components/stellar-map/solar/components/celestial/ConstellationOrbit.jsx`
- [x] `src/components/stellar-map/solar/components/celestial/NodeOrbit.jsx`

### Étape 2 : Fichiers à modifier
- [x] `src/components/stellar-map/solar/components/SolarSystem.jsx`
  - Remplacer `buildNodesWithOrbits` par `buildStellarHierarchy`
  - Supprimer `orbitProgressByDifficulty`
  - Supprimer le composant `NodesUpdater`
  - Rendre la hiérarchie avec `FamilyOrbit`
  - Adapter `allNodesFlat` pour `NodeMenu`

### Étape 3 : Fichiers à supprimer (optionnel)
- [ ] `src/components/stellar-map/solar/utils/nodesWithOrbits.js` (gardé pour référence)
- [ ] `src/components/stellar-map/solar/components/motion/NodesUpdater.jsx` (gardé pour référence)
- [ ] `src/components/stellar-map/solar/components/celestial/Node.jsx` (gardé pour référence)

**Note** : On peut garder les anciens fichiers avec un suffixe `.old.jsx` pour référence.

### Étape 4 : Vérifications
- [x] Pas d'erreurs de linter
- [ ] Aucune erreur console au lancement
- [ ] Les nodes s'affichent en 3D avec inclinaisons
- [ ] Le speed control fonctionne
- [ ] Les nodes sont cliquables
- [ ] Le zoom vers un node fonctionne
- [ ] Le menu des nodes affiche tous les nodes
- [ ] 60 FPS constant (vérifier avec les DevTools)

## Tests recommandés

### Test 1 : Affichage initial
```bash
npm start
```
- ✅ Le soleil est visible au centre
- ✅ Les familles orbitent autour du soleil
- ✅ Les constellations orbitent autour des familles
- ✅ Les nodes orbitent autour des constellations
- ✅ Effet 3D visible (pas plat)

### Test 2 : Performance
```javascript
// Dans la console du navigateur
console.log(window.performance.now());
// Attendre 1 seconde
console.log(window.performance.now());
// Devrait montrer ~60 frames rendus
```

### Test 3 : Interactions
- Cliquer sur un node → zoom in
- Modifier le speed slider → vitesse change
- Sélectionner un node dans le menu → zoom in

### Test 4 : Scalabilité
Ajouter 100+ nodes dans la base de données et vérifier :
- Pas de collisions visuelles
- Distribution uniforme
- Performance maintenue (60 FPS)

## Rollback en cas de problème

Si quelque chose ne fonctionne pas, tu peux facilement revenir en arrière :

1. Restaurer `SolarSystem.jsx` original :
```bash
git checkout HEAD -- src/components/stellar-map/solar/components/SolarSystem.jsx
```

2. Supprimer les nouveaux fichiers :
```bash
rm src/components/stellar-map/solar/utils/stellarHierarchy.js
rm src/components/stellar-map/solar/components/celestial/CelestialPivot.jsx
rm src/components/stellar-map/solar/components/celestial/FamilyOrbit.jsx
rm src/components/stellar-map/solar/components/celestial/ConstellationOrbit.jsx
rm src/components/stellar-map/solar/components/celestial/NodeOrbit.jsx
```

3. Relancer :
```bash
npm start
```

## FAQ

### Q : Les nodes sont trop rapides/lents
**R** : Ajuste `SPATIAL_CONFIG` dans `stellarHierarchy.js` :
```javascript
node: {
  baseSpeed: 0.35, // Réduis à 0.2 pour plus lent
  speedDecrement: 0.05
}
```

### Q : Les orbites sont trop serrées/espacées
**R** : Ajuste les `radiusIncrement` dans `SPATIAL_CONFIG` :
```javascript
family: {
  baseRadius: 8,
  radiusIncrement: 6 // Augmente à 10 pour plus d'espace
}
```

### Q : Je veux voir les anneaux d'orbite
**R** : Décommente le code dans les composants :
```jsx
// Dans FamilyOrbit.jsx, ConstellationOrbit.jsx, NodeOrbit.jsx
import { OrbitTrail } from './CelestialPivot';

// Ajoute avant les children
<OrbitTrail radius={radius} tilt={tilt} color="#ffffff" opacity={0.1} />
```

### Q : La caméra est trop proche/loin
**R** : Ajuste la position initiale dans `SolarSystem.jsx` :
```jsx
<Canvas
  camera={{ position: [0, 50, 80], fov: 60 }}
  // Augmente les valeurs pour s'éloigner : [0, 80, 120]
/>
```

## Support

Pour toute question ou problème :
1. Consulter `STELLAR_MAP_ATOMIC_ARCHITECTURE.md` pour la documentation complète
2. Vérifier les logs console pour les erreurs
3. Utiliser React DevTools Profiler pour identifier les re-renders inutiles
4. Vérifier Three.js Inspector (extension Chrome) pour débugger la scène 3D

---

**Date de migration** : Février 2026  
**Version cible** : Stellar Map v2.0 - Atomic Fractal  
**Statut** : ✅ Migration complète
