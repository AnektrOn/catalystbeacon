import * as THREE from 'three';

/**
 * Debug utilities for Stellar Map
 * Use these functions to diagnose issues
 */

/**
 * Check if Three.js is loaded
 */
export function checkThreeJS() {
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded');
    return false;
  }
  console.log('Three.js version:', THREE.REVISION);
  return true;
}

/**
 * Check if containers exist and have dimensions
 */
export function checkContainers() {
  const containers = ['core-ignition3D', 'core-insight3D', 'core-transformation3D'];
  const results = {};

  containers.forEach(id => {
    const el = document.getElementById(id);
    if (!el) {
      results[id] = { exists: false, error: 'Not found' };
      return;
    }

    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    
    results[id] = {
      exists: true,
      width: rect.width,
      height: rect.height,
      display: styles.display,
      visibility: styles.visibility,
      hasCanvas: !!el.querySelector('canvas')
    };
  });

  console.table(results);
  return results;
}

/**
 * Inspect Three.js scene
 */
export function inspectScene(scene, camera, renderer) {
  if (!scene || !camera || !renderer) {
    console.error('Scene, camera, or renderer is missing');
    return null;
  }

  const info = {
    scene: {
      children: scene.children.length,
      background: scene.background,
      fog: scene.fog
    },
    camera: {
      position: camera.position.toArray(),
      rotation: camera.rotation.toArray(),
      fov: camera.fov,
      aspect: camera.aspect
    },
    renderer: {
      domElement: renderer.domElement ? 'exists' : 'missing',
      size: { width: renderer.domElement?.width, height: renderer.domElement?.height },
      pixelRatio: renderer.getPixelRatio()
    },
    objects: {
      total: scene.children.length,
      byType: {}
    }
  };

  // Count objects by type
  scene.traverse((object) => {
    const type = object.type || 'Unknown';
    info.objects.byType[type] = (info.objects.byType[type] || 0) + 1;
  });

  console.log('Scene Info:', info);
  return info;
}

/**
 * Check node data structure
 */
export function checkNodeData(hierarchyData) {
  if (!hierarchyData || Object.keys(hierarchyData).length === 0) {
    console.warn('Hierarchy data is empty');
    return { valid: false, error: 'Empty data' };
  }

  const issues = [];
  let totalNodes = 0;

  Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
    if (!constellations || typeof constellations !== 'object') {
      issues.push(`Family "${familyName}" has invalid constellations`);
      return;
    }

    Object.entries(constellations).forEach(([constellationName, nodes]) => {
      if (!Array.isArray(nodes)) {
        issues.push(`Constellation "${constellationName}" has invalid nodes array`);
        return;
      }

      nodes.forEach((node, index) => {
        totalNodes++;
        if (!node.id) issues.push(`Node ${index} in "${constellationName}" missing id`);
        if (!node.title) issues.push(`Node ${index} in "${constellationName}" missing title`);
        if (node.difficulty === undefined) issues.push(`Node ${index} in "${constellationName}" missing difficulty`);
        if (!node.constellationAlias) issues.push(`Node ${index} in "${constellationName}" missing constellationAlias`);
        if (!node.familyAlias) issues.push(`Node ${index} in "${constellationName}" missing familyAlias`);
      });
    });
  });

  const result = {
    valid: issues.length === 0,
    totalFamilies: Object.keys(hierarchyData).length,
    totalConstellations: Object.values(hierarchyData).reduce((sum, c) => sum + Object.keys(c).length, 0),
    totalNodes,
    issues
  };

  if (issues.length > 0) {
    console.warn('Node Data Issues:', issues);
  } else {
    console.log('Node Data Valid:', result);
  }

  return result;
}

/**
 * Check XP visibility calculation
 */
export function checkXPVisibility(userXP, coreName) {
  const XP_THRESHOLDS = {
    Ignition: { Fog: 0, Lens: 3750, Prism: 7500, Beam: 11250 },
    Insight: { Fog: 15000, Lens: 20250, Prism: 25500, Beam: 30750 },
    Transformation: { Fog: 36000, Lens: 52000, Prism: 68000, Beam: 84000 }
  };

  const DEPTH_RANGES = {
    Fog: [0, 2],
    Lens: [3, 5],
    Prism: [6, 8],
    Beam: [9, 10]
  };

  const thresholds = XP_THRESHOLDS[coreName];
  if (!thresholds) {
    console.error(`Invalid core name: ${coreName}`);
    return null;
  }

  let group = 'Fog';
  if (userXP >= thresholds.Beam) group = 'Beam';
  else if (userXP >= thresholds.Prism) group = 'Prism';
  else if (userXP >= thresholds.Lens) group = 'Lens';

  const range = DEPTH_RANGES[group];

  const result = {
    userXP,
    coreName,
    group,
    difficultyRange: range,
    willShow: `Difficulties ${range[0]}-${range[1]}`,
    nextThreshold: group === 'Beam' ? 'Max' : 
      group === 'Prism' ? thresholds.Beam :
      group === 'Lens' ? thresholds.Prism : thresholds.Lens,
    xpToNext: group === 'Beam' ? 0 :
      group === 'Prism' ? thresholds.Beam - userXP :
      group === 'Lens' ? thresholds.Prism - userXP : thresholds.Lens - userXP
  };

  console.log('XP Visibility:', result);
  return result;
}

/**
 * Performance monitor
 */
export function startPerformanceMonitor() {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;

  const monitor = () => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime >= lastTime + 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;
      console.log(`FPS: ${fps}`);
    }

    requestAnimationFrame(monitor);
  };

  monitor();
  return () => {
    // Return cleanup function
    frameCount = 0;
  };
}

/**
 * Memory usage checker
 */
export function checkMemoryUsage() {
  if (performance.memory) {
    const memory = performance.memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
    return memory;
  } else {
    console.warn('Memory API not available');
    return null;
  }
}

/**
 * Count Three.js objects in scene
 */
export function countSceneObjects(scene) {
  if (!scene) {
    console.error('Scene is null');
    return null;
  }

  const counts = {
    total: 0,
    meshes: 0,
    lines: 0,
    points: 0,
    lights: 0,
    cameras: 0,
    groups: 0,
    other: 0,
    byUserData: {}
  };

  scene.traverse((object) => {
    counts.total++;
    
    if (object.isMesh) counts.meshes++;
    else if (object.isLine) counts.lines++;
    else if (object.isPoints) counts.points++;
    else if (object.isLight) counts.lights++;
    else if (object.isCamera) counts.cameras++;
    else if (object.isGroup) counts.groups++;
    else counts.other++;

    // Count by userData flags
    if (object.userData) {
      Object.keys(object.userData).forEach(key => {
        if (key.startsWith('_is3D')) {
          counts.byUserData[key] = (counts.byUserData[key] || 0) + 1;
        }
      });
    }
  });

  console.log('Scene Object Counts:', counts);
  return counts;
}

/**
 * Validate node grouping to ensure correct constellation-family relationships
 * @param {Object} hierarchyData - Hierarchical data structure { familyName: { constellationName: [nodes] } }
 * @param {string} level - Level name (Ignition, Insight, etc.)
 * @returns {Object} Validation report with issues found
 */
export function validateNodeGrouping(hierarchyData, level) {
  if (!hierarchyData || Object.keys(hierarchyData).length === 0) {
    return {
      valid: false,
      error: 'Empty hierarchy data',
      issues: [],
      summary: {
        totalFamilies: 0,
        totalConstellations: 0,
        totalNodes: 0,
        misgroupedNodes: 0
      }
    };
  }

  const issues = [];
  let totalNodes = 0;
  let misgroupedNodes = 0;

  Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
    if (!constellations || typeof constellations !== 'object') {
      issues.push({
        type: 'invalid_constellations',
        family: familyName,
        message: `Family "${familyName}" has invalid constellations structure`
      });
      return;
    }

    Object.entries(constellations).forEach(([constellationName, nodes]) => {
      if (!Array.isArray(nodes)) {
        issues.push({
          type: 'invalid_nodes_array',
          family: familyName,
          constellation: constellationName,
          message: `Constellation "${constellationName}" has invalid nodes array`
        });
        return;
      }

      nodes.forEach((node, index) => {
        totalNodes++;

        // Check required properties
        if (!node.id) {
          issues.push({
            type: 'missing_id',
            family: familyName,
            constellation: constellationName,
            nodeIndex: index,
            message: `Node at index ${index} in "${constellationName}" missing id`
          });
        }

        if (!node.title) {
          issues.push({
            type: 'missing_title',
            family: familyName,
            constellation: constellationName,
            nodeIndex: index,
            nodeId: node.id,
            message: `Node ${node.id} in "${constellationName}" missing title`
          });
        }

        // Validate constellation alias
        if (node.constellationAlias && node.constellationAlias !== constellationName) {
          misgroupedNodes++;
          issues.push({
            type: 'mismatched_constellation_alias',
            family: familyName,
            constellation: constellationName,
            nodeId: node.id,
            nodeTitle: node.title,
            expected: constellationName,
            actual: node.constellationAlias,
            message: `Node ${node.id} (${node.title}) has mismatched constellationAlias: expected "${constellationName}", got "${node.constellationAlias}"`
          });
        }

        // Validate family alias
        if (node.familyAlias && node.familyAlias !== familyName) {
          misgroupedNodes++;
          issues.push({
            type: 'mismatched_family_alias',
            family: familyName,
            constellation: constellationName,
            nodeId: node.id,
            nodeTitle: node.title,
            expected: familyName,
            actual: node.familyAlias,
            message: `Node ${node.id} (${node.title}) has mismatched familyAlias: expected "${familyName}", got "${node.familyAlias}"`
          });
        }

        // Validate constellation_id relationship if available
        if (node.constellation_id && node.constellations) {
          if (node.constellations.name !== constellationName) {
            misgroupedNodes++;
            issues.push({
              type: 'mismatched_constellation_relationship',
              family: familyName,
              constellation: constellationName,
              nodeId: node.id,
              nodeTitle: node.title,
              expected: constellationName,
              actual: node.constellations.name,
              message: `Node ${node.id} (${node.title}) has constellation_id pointing to "${node.constellations.name}" but is grouped under "${constellationName}"`
            });
          }

          // Validate constellation's family_id if available
          if (node.constellations.family_id) {
            // We can't directly validate this without the family ID, but we can note it
            // The service layer should handle this validation
          }
        }

        // Validate level if available
        if (level && node.constellations && node.constellations.level && node.constellations.level !== level) {
          issues.push({
            type: 'mismatched_level',
            family: familyName,
            constellation: constellationName,
            nodeId: node.id,
            nodeTitle: node.title,
            expected: level,
            actual: node.constellations.level,
            message: `Node ${node.id} (${node.title}) belongs to constellation with level "${node.constellations.level}" but requested level is "${level}"`
          });
        }
      });
    });
  });

  const totalFamilies = Object.keys(hierarchyData).length;
  const totalConstellations = Object.values(hierarchyData).reduce(
    (sum, constellations) => sum + Object.keys(constellations).length,
    0
  );

  const result = {
    valid: issues.length === 0,
    totalFamilies,
    totalConstellations,
    totalNodes,
    misgroupedNodes,
    issues,
    summary: {
      totalFamilies,
      totalConstellations,
      totalNodes,
      misgroupedNodes,
      issuesByType: issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {})
    }
  };

  if (issues.length > 0) {
    console.warn('[validateNodeGrouping] Validation issues found:', result);
  } else {
    console.log('[validateNodeGrouping] All nodes correctly grouped:', {
      totalFamilies,
      totalConstellations,
      totalNodes
    });
  }

  return result;
}

/**
 * Export all debug functions
 */
export default {
  checkThreeJS,
  checkContainers,
  inspectScene,
  checkNodeData,
  checkXPVisibility,
  startPerformanceMonitor,
  checkMemoryUsage,
  countSceneObjects,
  validateNodeGrouping
};
