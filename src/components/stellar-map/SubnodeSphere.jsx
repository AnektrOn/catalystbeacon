import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Difficulty level styles (blue-to-white gradient)
 */
export const DIFFICULTY_STYLES = {
  0: { color: 0x2A3E66, size: 0.3 },
  1: { color: 0x3A527A, size: 0.4 },
  2: { color: 0x4B668E, size: 0.5 },
  3: { color: 0x5C7AA2, size: 0.6 },
  4: { color: 0x6D8EB6, size: 0.7 },
  5: { color: 0x7EA2CA, size: 0.8 },
  6: { color: 0x8FB6DE, size: 0.9 },
  7: { color: 0xA0CAEE, size: 1.0 },
  8: { color: 0xB1DEFF, size: 1.1 },
  9: { color: 0xC2F2FF, size: 1.2 },
  10: { color: 0xFFFFFF, size: 1.3 }
};

/**
 * Create a subnode sphere
 */
export function createSubnodeSphere(nodeData, position, scene) {
  const difficulty = nodeData.difficulty || 0;
  const style = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES[0];
  const radius = style.size;

  // Core sphere
  const coreGeo = new THREE.SphereGeometry(radius, 12, 12);
  const coreMat = new THREE.MeshBasicMaterial({
    color: style.color,
    transparent: true,
    opacity: 0.9
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.copy(position);

  // Thin black rim
  const rimGeo = new THREE.SphereGeometry(radius * 1.05, 12, 12);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.35
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.copy(position);

  // User data
  coreMesh.userData = {
    _is3DSubnode: true,
    id: nodeData.id,
    title: nodeData.title,
    link: nodeData.link,
    constellationAlias: nodeData.constellationAlias,
    familyAlias: nodeData.familyAlias,
    difficulty: nodeData.difficulty,
    label: nodeData.difficulty_label
  };

  rimMesh.userData._is3DHalo = true;

  // Add to scene (rim first so it sits behind)
  scene.add(rimMesh);
  scene.add(coreMesh);

  return { coreMesh, rimMesh };
}

/**
 * Hook to manage subnode sphere
 */
export function useSubnodeSphere(scene, nodeData, position) {
  const meshesRef = useRef(null);

  useEffect(() => {
    if (!scene || !position || !nodeData) return;

    const meshes = createSubnodeSphere(nodeData, position, scene);
    meshesRef.current = meshes;

    return () => {
      if (meshesRef.current) {
        scene.remove(meshesRef.current.coreMesh);
        scene.remove(meshesRef.current.rimMesh);
        meshesRef.current.coreMesh.geometry.dispose();
        meshesRef.current.coreMesh.material.dispose();
        meshesRef.current.rimMesh.geometry.dispose();
        meshesRef.current.rimMesh.material.dispose();
      }
    };
  }, [scene, nodeData, position]);

  return meshesRef.current?.coreMesh;
}
