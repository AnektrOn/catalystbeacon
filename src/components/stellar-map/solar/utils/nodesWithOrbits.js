/**
 * Build flat list of nodes with orbit data: radius from difficulty, angle offset for same-orbit nodes.
 * @param {Object} grouped - Result of getNodesGroupedByHierarchy: { [familyName]: { [constellationName]: nodes[] } }
 * @returns {Array<{ node: Object, orbitRadius: number, angleOffset: number, difficulty: string }>}
 */
const ORBIT_RADIUS_BASE = 2;
const ORBIT_RADIUS_PER_DIFFICULTY = 1.2;

export function difficultyToOrbitRadius(difficulty) {
  const d = parseInt(String(difficulty || '1'), 10) || 1;
  return ORBIT_RADIUS_BASE + (d - 1) * ORBIT_RADIUS_PER_DIFFICULTY;
}

export function buildNodesWithOrbits(grouped) {
  if (!grouped || typeof grouped !== 'object') return [];

  const flatNodes = [];
  Object.values(grouped).forEach((constellations) => {
    if (!constellations || typeof constellations !== 'object') return;
    Object.values(constellations).forEach((nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => flatNodes.push(node));
    });
  });

  const byDifficulty = new Map();
  flatNodes.forEach((node) => {
    const d = String(node.difficulty ?? '1');
    if (!byDifficulty.has(d)) byDifficulty.set(d, []);
    byDifficulty.get(d).push(node);
  });

  const result = [];
  byDifficulty.forEach((nodesOnOrbit, difficulty) => {
    const orbitRadius = difficultyToOrbitRadius(difficulty);
    const n = nodesOnOrbit.length;
    nodesOnOrbit.forEach((node, index) => {
      const angleOffset = n <= 1 ? 0 : (index / n) * 2 * Math.PI;
      result.push({ node, orbitRadius, angleOffset, difficulty, showOrbitRing: index === 0 });
    });
  });

  return result;
}
