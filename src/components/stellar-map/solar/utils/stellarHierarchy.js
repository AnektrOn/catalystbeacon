/**
 * Build a hierarchical stellar map structure from grouped nodes
 * Transforms flat grouped data into: Map<FamilyName, Map<ConstellationName, List<Nodes>>>
 * @param {Object} grouped - Result of getNodesGroupedByHierarchy: { [familyName]: { [constellationName]: nodes[] } }
 * @returns {Array<Family>} - Array of families with constellations and nodes
 */
export function buildStellarHierarchy(grouped) {
  if (!grouped || typeof grouped !== 'object') return [];

  const families = [];
  
  Object.entries(grouped).forEach(([familyName, constellations], familyIndex) => {
    if (!constellations || typeof constellations !== 'object') return;
    
    const familyConstellations = [];
    
    Object.entries(constellations).forEach(([constellationName, nodes], constellationIndex) => {
      if (!Array.isArray(nodes) || nodes.length === 0) return;
      
      familyConstellations.push({
        name: constellationName,
        nodes: nodes,
        index: constellationIndex
      });
    });
    
    if (familyConstellations.length > 0) {
      families.push({
        name: familyName,
        constellations: familyConstellations,
        index: familyIndex
      });
    }
  });
  
  return families;
}

/**
 * Calculate Fibonacci Sphere distribution for N points
 * Distributes points evenly on a sphere surface to avoid clustering
 * @param {number} count - Number of points to distribute
 * @param {number} radius - Radius of the sphere
 * @returns {Array<{position: [x, y, z], index: number}>}
 */
export function fibonacciSphere(count, radius = 1) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
  
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y); // radius at y
    
    const theta = phi * i;
    
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    
    points.push({
      position: [x * radius, y * radius, z * radius],
      index: i
    });
  }
  
  return points;
}

/**
 * Calculate circular distribution on a plane (fallback for small counts)
 * @param {number} count - Number of points
 * @param {number} radius - Radius of the circle
 * @returns {Array<{angle: number, index: number}>}
 */
export function circularDistribution(count, radius = 1) {
  if (count === 0) return [];
  if (count === 1) return [{ angle: 0, radius, index: 0 }];
  
  const points = [];
  const angleStep = (2 * Math.PI) / count;
  
  for (let i = 0; i < count; i++) {
    points.push({
      angle: i * angleStep,
      radius,
      index: i
    });
  }
  
  return points;
}

/**
 * Calculate spatial parameters for hierarchical levels
 * Returns radius, speed, and tilt for each family/constellation/node
 */
export const SPATIAL_CONFIG = {
  // Sun at center
  sun: {
    radius: 1.5,
    position: [0, 0, 0]
  },
  
  // Family orbits around sun
  family: {
    baseRadius: 8,
    radiusIncrement: 6, // Add this per family
    baseSpeed: 0.15,
    speedDecrement: 0.02, // Slower as we go further
    tiltRange: [-0.3, 0.3] // Radians for X and Z tilt
  },
  
  // Constellation orbits around family center
  constellation: {
    baseRadius: 4,
    radiusIncrement: 3,
    baseSpeed: 0.25,
    speedDecrement: 0.03,
    tiltRange: [-0.4, 0.4]
  },
  
  // Node orbits around constellation center
  node: {
    baseRadius: 2,
    radiusIncrement: 0.5,
    baseSpeed: 0.35,
    speedDecrement: 0.05,
    tiltRange: [-0.5, 0.5],
    size: 0.08
  }
};

/**
 * Calculate orbit parameters for a family
 * @param {number} familyIndex - Index of the family
 * @param {number} totalFamilies - Total number of families
 * @returns {Object} - { radius, speed, tilt: [x, z] }
 */
export function getFamilyOrbitParams(familyIndex, totalFamilies) {
  const config = SPATIAL_CONFIG.family;
  
  // Use Fibonacci sphere for positioning if more than 4 families
  const useSpherical = totalFamilies > 4;
  
  return {
    radius: config.baseRadius + (familyIndex * config.radiusIncrement),
    speed: config.baseSpeed - (familyIndex * config.speedDecrement),
    tilt: useSpherical 
      ? [(Math.random() - 0.5) * (config.tiltRange[1] - config.tiltRange[0]), 
         (Math.random() - 0.5) * (config.tiltRange[1] - config.tiltRange[0])]
      : [
          config.tiltRange[0] + (familyIndex / Math.max(totalFamilies - 1, 1)) * (config.tiltRange[1] - config.tiltRange[0]),
          (familyIndex % 2 === 0 ? 1 : -1) * 0.2
        ],
    useSpherical
  };
}

/**
 * Calculate orbit parameters for a constellation
 * @param {number} constellationIndex - Index within its family
 * @param {number} totalConstellations - Total constellations in this family
 * @returns {Object} - { radius, speed, tilt: [x, z], angle }
 */
export function getConstellationOrbitParams(constellationIndex, totalConstellations) {
  const config = SPATIAL_CONFIG.constellation;
  
  return {
    radius: config.baseRadius + (constellationIndex * config.radiusIncrement),
    speed: config.baseSpeed - (constellationIndex * config.speedDecrement),
    tilt: [
      config.tiltRange[0] + (constellationIndex / Math.max(totalConstellations - 1, 1)) * (config.tiltRange[1] - config.tiltRange[0]),
      (constellationIndex % 2 === 0 ? 1 : -1) * 0.3
    ],
    angle: (constellationIndex / totalConstellations) * Math.PI * 2 // Initial position around family
  };
}

/**
 * Calculate orbit parameters for nodes within a constellation
 * @param {number} nodeIndex - Index within its constellation
 * @param {number} totalNodes - Total nodes in this constellation
 * @param {number} difficulty - Node difficulty (for color/size variation)
 * @returns {Object} - { radius, speed, tilt: [x, z], angle }
 */
export function getNodeOrbitParams(nodeIndex, totalNodes, difficulty = 1) {
  const config = SPATIAL_CONFIG.node;
  
  // Difficulty affects orbit radius slightly (harder nodes further out)
  const difficultyFactor = (parseInt(difficulty, 10) || 1) * 0.3;
  
  return {
    radius: config.baseRadius + difficultyFactor,
    speed: config.baseSpeed - (nodeIndex * config.speedDecrement),
    tilt: [
      config.tiltRange[0] + (nodeIndex / Math.max(totalNodes - 1, 1)) * (config.tiltRange[1] - config.tiltRange[0]),
      (nodeIndex % 2 === 0 ? 1 : -1) * 0.4
    ],
    angle: (nodeIndex / totalNodes) * Math.PI * 2, // Evenly distributed
    size: config.size
  };
}

/**
 * Generate deterministic tilt based on name hash (for consistency across renders)
 * @param {string} name - Entity name
 * @param {Array<number>} range - [min, max] tilt range
 * @returns {Array<number>} - [x, z] tilt in radians
 */
export function generateDeterministicTilt(name, range = [-0.5, 0.5]) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to [0, 1] range
  const normalized = Math.abs(hash % 10000) / 10000;
  const normalized2 = Math.abs((hash >> 16) % 10000) / 10000;
  
  return [
    range[0] + normalized * (range[1] - range[0]),
    range[0] + normalized2 * (range[1] - range[0])
  ];
}
