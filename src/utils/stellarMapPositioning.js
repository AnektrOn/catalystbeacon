import * as THREE from 'three';

/**
 * Metatron cube vertices - 13 evenly distributed points on a sphere
 * Used for positioning subnodes within constellation spheres
 */
export const METATRON_CUBE = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0.5, 0.5, 0.5),
  new THREE.Vector3(-0.5, 0.5, 0.5),
  new THREE.Vector3(0.5, -0.5, 0.5),
  new THREE.Vector3(-0.5, -0.5, 0.5),
  new THREE.Vector3(0.5, 0.5, -0.5),
  new THREE.Vector3(-0.5, 0.5, -0.5),
  new THREE.Vector3(0.5, -0.5, -0.5)
];

/**
 * Planet radii based on difficulty level (0-10)
 */
export const PLANET_RADII = [
  0.25, 0.30, 0.35, 0.40, 0.48, 0.58, 0.70, 0.85, 1.05, 1.30, 1.60
];

/**
 * Constants for sphere sizing
 */
export const FAMILY_RADIUS_BASE = 4.0;
export const FAMILY_RADIUS_SCALE = 2.0;
export const CONST_RADIUS_BASE = 4.0;
export const CONST_RADIUS_SCALE = 1.6;
export const CONST_MARGIN = 0.5;

/**
 * Get an evenly distributed direction vector on a unit sphere
 * Uses golden angle for optimal spacing
 * @param {number} index - Index of the point (0-based)
 * @param {number} totalCount - Total number of points
 * @returns {THREE.Vector3} Normalized direction vector
 */
export function getAngularDirection(index, totalCount) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const t = index + 0.5;
  const phi = Math.acos(1 - (2 * t) / totalCount);
  const theta = goldenAngle * index;
  const x = Math.cos(theta) * Math.sin(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(phi);
  return new THREE.Vector3(x, y, z).normalize();
}

/**
 * Get a position inside a sphere using spiral distribution
 * @param {number} index - Index of the point
 * @param {number} totalCount - Total number of points
 * @param {number} baseRadius - Base radius of the sphere
 * @returns {THREE.Vector3} Position vector
 */
export function getAngularPosition(index, totalCount, baseRadius) {
  const phi = Math.acos(-1 + (2 * index) / totalCount);
  const theta = Math.sqrt(totalCount * Math.PI) * phi;
  const x = baseRadius * Math.cos(theta) * Math.sin(phi);
  const y = baseRadius * Math.sin(theta) * Math.sin(phi);
  const z = baseRadius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Calculate family sphere radius based on number of subnodes
 * @param {number} subnodeCount - Total number of subnodes in the family
 * @returns {number} Radius of the family sphere
 */
export function calculateFamilyRadius(subnodeCount) {
  if (subnodeCount <= 0) return 0;
  return FAMILY_RADIUS_BASE + FAMILY_RADIUS_SCALE * Math.sqrt(subnodeCount);
}

/**
 * Calculate constellation sphere radius based on number of subnodes
 * @param {number} subnodeCount - Number of subnodes in the constellation
 * @returns {number} Radius of the constellation sphere
 */
export function calculateConstellationRadius(subnodeCount) {
  if (subnodeCount <= 0) return 0;
  return CONST_RADIUS_BASE + CONST_RADIUS_SCALE * Math.sqrt(subnodeCount);
}

/**
 * Calculate safe placement radius for constellation within family
 * Ensures constellation doesn't overlap with family boundary
 * @param {number} familyRadius - Radius of the family sphere
 * @param {number} constellationRadius - Radius of the constellation sphere
 * @returns {number} Safe distance from family center
 */
export function calculateSafeConstellationDistance(familyRadius, constellationRadius) {
  return Math.max(familyRadius - constellationRadius - CONST_MARGIN, constellationRadius);
}

/**
 * Calculate global placement radius for families
 * Ensures families don't overlap
 * @param {number} maxFamilyRadius - Maximum radius among all families
 * @param {number} numFamilies - Total number of families
 * @returns {number} Global placement radius
 */
export function calculateFamilyPlacementRadius(maxFamilyRadius, numFamilies) {
  return (maxFamilyRadius * numFamilies * 0.5) || 1;
}

/**
 * Position subnode using Metatron cube algorithm
 * Places subnodes in concentric shells using Metatron cube vertices
 * @param {number} subnodeIndex - Index of the subnode (0-based)
 * @param {number} totalSubnodes - Total number of subnodes in constellation
 * @param {THREE.Vector3} constellationCenter - Center position of constellation
 * @param {number} constellationRadius - Radius of constellation sphere
 * @param {number} nodeRadius - Radius of the subnode sphere
 * @returns {THREE.Vector3} Position vector for the subnode
 */
export function positionSubnodeMetatron(
  subnodeIndex,
  totalSubnodes,
  constellationCenter,
  constellationRadius,
  nodeRadius
) {
  // Calculate how many concentric shells we need (13 nodes per shell)
  const shellsNeeded = Math.ceil(totalSubnodes / METATRON_CUBE.length);
  
  // Ensure the planet never clips the fog bubble
  const margin = 0.25;
  const maxInside = constellationRadius - nodeRadius - margin;
  
  // One equal radial step per shell
  const step = maxInside / shellsNeeded;
  
  // Figure out which shell and which slot of the 13-point star
  const shell = Math.floor(subnodeIndex / METATRON_CUBE.length);
  const slot = subnodeIndex % METATRON_CUBE.length;
  
  // Final absolute position
  const subnodePos = constellationCenter.clone()
    .add(METATRON_CUBE[slot].clone().multiplyScalar(step * (shell + 1)));
  
  return subnodePos;
}

/**
 * Calculate positions for all nodes in a hierarchy
 * @param {Object} hierarchyData - Hierarchical data structure
 * @param {THREE.Vector3} corePosition - Position of the core (0,0,0)
 * @returns {Object} Positioned hierarchy with calculated positions
 */
export function calculateHierarchyPositions(hierarchyData, corePosition = new THREE.Vector3(0, 0, 0)) {
  const positioned = {
    families: {},
    constellationCenters: {}
  };
  
  // First pass: calculate family radii and counts
  const familyData = [];
  let maxFamilyRadius = 0;
  
  Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
    let totalSubnodes = 0;
    Object.values(constellations).forEach(nodes => {
      totalSubnodes += nodes.length;
    });
    
    const radius = calculateFamilyRadius(totalSubnodes);
    maxFamilyRadius = Math.max(maxFamilyRadius, radius);
    
    familyData.push({
      name: familyName,
      radius,
      totalSubnodes,
      constellations
    });
  });
  
  // Calculate global placement radius
  const familyPlacementRadius = calculateFamilyPlacementRadius(maxFamilyRadius, familyData.length);
  
  // Second pass: position families and constellations
  familyData.forEach((family, familyIndex) => {
    const familyDir = getAngularDirection(familyIndex, familyData.length);
    const familyCenter = familyDir.clone().multiplyScalar(familyPlacementRadius);
    
    positioned.families[family.name] = {
      center: familyCenter,
      radius: family.radius
    };
    
    // Position constellations within family
    const constellationList = Object.entries(family.constellations);
    constellationList.forEach(([constellationName, nodes], constIndex) => {
      const constellationRadius = calculateConstellationRadius(nodes.length);
      const safeDist = calculateSafeConstellationDistance(family.radius, constellationRadius);
      const constDir = getAngularDirection(constIndex, constellationList.length);
      const constellationCenter = familyCenter.clone().add(constDir.clone().multiplyScalar(safeDist));
      
      positioned.constellationCenters[constellationName] = constellationCenter;
    });
  });
  
  return positioned;
}
