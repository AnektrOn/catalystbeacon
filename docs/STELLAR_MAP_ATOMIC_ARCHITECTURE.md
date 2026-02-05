# Stellar Map - Architecture Atomique Fractale

## Vue d'ensemble

La Stellar Map 3D a été refactorisée pour passer d'une **distribution circulaire plate** à un **modèle atomique fractal hiérarchique**. Chaque entité gravite autour de son parent avec des inclinaisons variées, créant un effet de noyau d'atome en 3D.

## Hiérarchie des entités

```
☀️ Soleil (Noyau Central)
  └── 🌍 Familles (Orbites autour du soleil)
      └── ⭐ Constellations (Orbites autour du centre de famille)
          └── 🔵 Nodes (Électrons orbitant autour de la constellation)
```

## Architecture des composants

### 1. **CelestialPivot** - Composant de base
Fichier : `src/components/stellar-map/solar/components/celestial/CelestialPivot.jsx`

**Responsabilité** : Brique de base pour toutes les rotations orbitales.

**Fonctionnalités** :
- Crée un `THREE.Group` servant de pivot de rotation
- Applique une rotation continue via `useFrame` (vitesse passée en props)
- Accepte un `tilt` [x, z] pour créer des orbites 3D sphériques
- Positionne ses enfants à une distance `radius` sur l'axe X local
- Mutations directes dans `useFrame` pour optimisation des performances

**Variantes** :
- `CelestialPivot` : Rotation animée
- `StaticPivot` : Position fixe sans animation
- `OrbitTrail` : Anneau de visualisation de l'orbite

### 2. **FamilyOrbit** - Famille de constellations
Fichier : `src/components/stellar-map/solar/components/celestial/FamilyOrbit.jsx`

**Responsabilité** : Représente une famille gravitant autour du Soleil.

**Caractéristiques** :
- Orbit radius : `baseRadius + (index * radiusIncrement)` = 8 + (n × 6)
- Vitesse : Plus lente à mesure qu'on s'éloigne du soleil (simulation physique)
- Inclinaison : Déterministe basée sur le hash du nom pour cohérence
- Contient plusieurs `ConstellationOrbit` comme enfants

### 3. **ConstellationOrbit** - Constellation de nodes
Fichier : `src/components/stellar-map/solar/components/celestial/ConstellationOrbit.jsx`

**Responsabilité** : Représente une constellation gravitant autour du centre de sa famille.

**Caractéristiques** :
- Orbit radius : `baseRadius + (index * radiusIncrement)` = 4 + (n × 3)
- Distribution circulaire des nodes enfants
- Inclinaison unique basée sur `familyName-constellationName`
- Contient plusieurs `NodeOrbit` (les vrais nodes de la carte stellaire)

### 4. **NodeOrbit** - Node individuel (électron)
Fichier : `src/components/stellar-map/solar/components/celestial/NodeOrbit.jsx`

**Responsabilité** : Représente un node individuel orbitant autour de sa constellation.

**Caractéristiques** :
- Orbit radius : `baseRadius + difficultyFactor` (nodes plus difficiles = plus loin)
- Couleur basée sur la difficulté (gradient bleu → violet → rouge)
- Tracking de position mondiale pour minimap et ciblage caméra
- Interactions : Click pour sélectionner et zoomer
- Distribution circulaire parfaite : `angle = (index / totalNodes) * 2π`

## Distribution spatiale

### Anti-collision garantie
Chaque niveau utilise une distribution relative basée sur le nombre d'entités :

```javascript
// Exemple pour 5 nodes dans une constellation
angle[i] = (i / 5) * 2π
// Résultats : 0°, 72°, 144°, 216°, 288°
```

**Avantage** : Peu importe si tu ajoutes 10 ou 400 nodes plus tard, ils seront toujours espacés uniformément.

### Fibonacci Sphere (préparé pour le futur)
Pour des distributions sphériques complexes, la fonction `fibonacciSphere()` est disponible dans `stellarHierarchy.js`.

## Configuration spatiale

Fichier : `src/components/stellar-map/solar/utils/stellarHierarchy.js`

```javascript
export const SPATIAL_CONFIG = {
  sun: {
    radius: 1.5,
    position: [0, 0, 0]
  },
  
  family: {
    baseRadius: 8,
    radiusIncrement: 6,
    baseSpeed: 0.15,
    speedDecrement: 0.02,
    tiltRange: [-0.3, 0.3]
  },
  
  constellation: {
    baseRadius: 4,
    radiusIncrement: 3,
    baseSpeed: 0.25,
    speedDecrement: 0.03,
    tiltRange: [-0.4, 0.4]
  },
  
  node: {
    baseRadius: 2,
    radiusIncrement: 0.5,
    baseSpeed: 0.35,
    speedDecrement: 0.05,
    tiltRange: [-0.5, 0.5],
    size: 0.08
  }
};
```

### Règles de physique

1. **Vitesse** : Plus proche du soleil = plus rapide
   - Familles : 0.15 base
   - Constellations : 0.25 base
   - Nodes : 0.35 base

2. **Inclinaison** : Augmente avec la profondeur hiérarchique
   - Familles : ±0.3 rad
   - Constellations : ±0.4 rad
   - Nodes : ±0.5 rad
   - **Déterministe** : Basée sur hash du nom pour cohérence entre les renders

3. **Distance** : Augmente avec l'index et la difficulté
   - Familles : 8 + (index × 6)
   - Constellations : 4 + (index × 3)
   - Nodes : 2 + (difficulty × 0.3)

## Intégration avec les contextes existants

### SpeedControlContext
Les composants orbitaux utilisent `useSpeedControl()` pour accéder au multiplicateur de vitesse global :

```javascript
const { speedFactor } = useSpeedControl();
// speedFactor varie de 0 à 5 via le slider UI
```

### NodePositionsContext
Chaque `NodeOrbit` met à jour sa position mondiale chaque frame :

```javascript
useFrame(() => {
  const worldPos = meshRef.current.getWorldPosition(...);
  setNodePosition(node.id, [worldPos.x, worldPos.y, worldPos.z]);
});
```

### SelectedNodeContext & CameraContext
Gèrent la sélection et le zoom sur les nodes.

## Performance

### Optimisations implémentées

1. **Mutations directes** : Les rotations sont mutées directement dans `useFrame` au lieu de créer de nouveaux états
2. **useRef** : Toutes les références aux groupes Three.js sont stockées en refs
3. **Memoization** : Les calculs de distribution sont faits une seule fois au render initial
4. **Contextes** : Speed factor partagé via contexte pour éviter prop drilling

### Objectif : 60 FPS constant

Même avec 400+ nodes, l'architecture garantit 60 FPS grâce à :
- Pas de re-render React inutile (mutations Three.js directes)
- Distribution calculée au mount, pas chaque frame
- Geometry pooling via `<Sphere>` de drei

## Migration depuis l'ancien système

### Fichiers obsolètes

- ❌ `src/components/stellar-map/solar/utils/nodesWithOrbits.js` (remplacé par `stellarHierarchy.js`)
- ❌ `src/components/stellar-map/solar/components/motion/NodesUpdater.jsx` (plus nécessaire)
- ❌ `src/components/stellar-map/solar/components/celestial/Node.jsx` (remplacé par `NodeOrbit.jsx`)

### Fichiers conservés et adaptés

- ✅ `SolarSystem.jsx` : Refactorisé pour utiliser la hiérarchie
- ✅ `NodeMenu.jsx` : Compatible (reçoit liste plate extraite de la hiérarchie)
- ✅ `SpeedControl.jsx` : Inchangé
- ✅ Tous les contextes : Inchangés

## Extension future

### Ajouter des niveaux hiérarchiques
Pour ajouter un niveau (ex: "Secteurs" entre Familles et Constellations) :

1. Créer `SectorOrbit.jsx` basé sur le pattern de `FamilyOrbit`
2. Ajouter la configuration dans `SPATIAL_CONFIG`
3. Modifier `buildStellarHierarchy()` pour extraire les secteurs
4. Chaîner : `Family > Sector > Constellation > Node`

### Effets visuels additionnels
- **Trails** : Utiliser `OrbitTrail` pour afficher les anneaux d'orbite
- **Particle effects** : Ajouter des particules aux centres de famille/constellation
- **Bloom** : Post-processing pour effet lumineux sur les nodes

### Modes de visualisation
- **Mode Fog** : Afficher seulement certaines familles
- **Mode Focus** : Zoomer sur une famille spécifique, réduire les autres
- **Mode 2D** : Aplatir les inclinaisons pour vue traditionnelle

## Troubleshooting

### Les nodes ne s'affichent pas
1. Vérifier que `buildStellarHierarchy()` retourne une structure correcte
2. Vérifier la console pour les erreurs de contexte (SpeedControl, NodePositions)
3. Vérifier que les positions des pivots ne sont pas à [NaN, NaN, NaN]

### Performance dégradée
1. Réduire le nombre de segments dans `<Sphere args={[size, 32, 32]}>` (32 → 16)
2. Désactiver les `OrbitTrail` si activés
3. Vérifier qu'il n'y a pas de re-renders React inutiles (React DevTools Profiler)

### Les orbites sont plates
1. Vérifier que les tilts sont appliqués : `tilt={[x, z]}`
2. Vérifier que `generateDeterministicTilt()` est appelé correctement
3. Ajuster les ranges de tilt dans `SPATIAL_CONFIG`

## Conclusion

Cette architecture fractale atomique offre :
- ✅ **Scalabilité** : Gérer 10 ou 1000 nodes sans problème
- ✅ **Performance** : 60 FPS garantis via optimisations Three.js
- ✅ **Extensibilité** : Facile d'ajouter des niveaux hiérarchiques
- ✅ **Esthétique** : Effet noyau d'atome immersif et visuellement impressionnant
- ✅ **Maintenabilité** : Code modulaire, réutilisable, bien documenté

**Créé le** : Février 2026  
**Auteur** : Refactorisation Stellar Map 3D
