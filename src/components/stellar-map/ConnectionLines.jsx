import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Gold line material for family connections
 */
const GOLD_MAT = new THREE.LineBasicMaterial({
  color: 0xffd700,
  transparent: true,
  opacity: 0.75,
  linewidth: 2
});

/**
 * White line material for intra-constellation connections
 */
const WHITE_MAT = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.4,
  linewidth: 1
});

/**
 * Create a connection line between two points
 */
export function createConnectionLine(start, end, material, scene) {
  const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
  const line = new THREE.Line(geo, material);
  line.userData = { _is3DLine: true, lineType: material === GOLD_MAT ? 'gold' : 'white' };
  scene.add(line);
  return line;
}

/**
 * Create gold line from family center to constellation's lowest difficulty node
 */
export function createFamilyConstellationLine(familyCenter, nodePosition, scene) {
  return createConnectionLine(familyCenter, nodePosition, GOLD_MAT, scene);
}

/**
 * Create white lines connecting all nodes within a constellation
 */
export function createIntraConstellationLines(nodePositions, scene) {
  const lines = [];
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const line = createConnectionLine(nodePositions[i], nodePositions[j], WHITE_MAT, scene);
      lines.push(line);
    }
  }
  return lines;
}

/**
 * Hook to manage connection lines
 */
export function useConnectionLines(scene, lines) {
  const linesRef = useRef([]);

  useEffect(() => {
    if (!scene || !lines || lines.length === 0) return;

    const createdLines = lines.map(({ start, end, type }) => {
      const material = type === 'gold' ? GOLD_MAT : WHITE_MAT;
      return createConnectionLine(start, end, material, scene);
    });

    linesRef.current = createdLines;

    return () => {
      createdLines.forEach(line => {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      });
    };
  }, [scene, lines]);

  return linesRef.current;
}
