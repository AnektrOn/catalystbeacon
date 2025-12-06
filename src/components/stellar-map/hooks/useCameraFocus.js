import { useCallback } from 'react';
import * as THREE from 'three';

/**
 * Hook for camera focusing functionality
 * @param {Object} context - Three.js context with camera and controls
 * @returns {Object} Focus functions
 */
export function useCameraFocus(context) {
  /**
   * Focus camera on a constellation
   * @param {string} constellationName - Name of the constellation
   * @param {Object} constellationCenters - Map of constellation names to positions
   */
  const focusConstellation = useCallback((constellationName, constellationCenters) => {
    if (!context?.camera || !context?.controls) return;

    const centerPos = constellationCenters[constellationName];
    if (!centerPos) {
      console.warn(`No position found for constellation "${constellationName}"`);
      return;
    }

    // Convert to THREE.Vector3 if needed
    const targetPos = centerPos instanceof THREE.Vector3 
      ? centerPos 
      : new THREE.Vector3(centerPos.x, centerPos.y, centerPos.z);

    // Move controls target to constellation center
    context.controls.target.copy(targetPos);

    // Reposition camera behind the constellation
    const dir = new THREE.Vector3()
      .subVectors(context.camera.position, targetPos)
      .normalize();
    
    const desiredDistance = 15;
    context.camera.position.copy(
      targetPos.clone().add(dir.multiplyScalar(desiredDistance))
    );

    // Update controls
    context.controls.update();
  }, [context]);

  /**
   * Focus camera on a specific subnode
   * @param {THREE.Vector3|Object} nodePosition - Position of the node
   */
  const focusSubnode = useCallback((nodePosition) => {
    if (!context?.camera || !context?.controls) return;

    const targetPos = nodePosition instanceof THREE.Vector3
      ? nodePosition
      : new THREE.Vector3(nodePosition.x, nodePosition.y, nodePosition.z);

    // Move controls target to node position
    context.controls.target.copy(targetPos);

    // Reposition camera closer to the node
    const dir = new THREE.Vector3()
      .subVectors(context.camera.position, targetPos)
      .normalize();
    
    const desiredDistance = 10;
    context.camera.position.copy(
      targetPos.clone().add(dir.multiplyScalar(desiredDistance))
    );

    // Update controls
    context.controls.update();
  }, [context]);

  /**
   * Reset camera to default position (looking at core)
   */
  const resetCamera = useCallback(() => {
    if (!context?.camera || !context?.controls) return;

    context.controls.target.set(0, 0, 0);
    const dir = new THREE.Vector3()
      .subVectors(context.camera.position, new THREE.Vector3(0, 0, 0))
      .normalize();
    context.camera.position.copy(dir.multiplyScalar(15));
    context.controls.update();
  }, [context]);

  return {
    focusConstellation,
    focusSubnode,
    resetCamera
  };
}
