import React, { useMemo } from 'react';
import * as THREE from 'three';

export function GoldLine({ start, end }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  return (
    <line userData={{ _is3DLine: true, lineType: 'gold' }}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={0xffd700} 
        transparent 
        opacity={0.75}
        linewidth={2}
      />
    </line>
  );
}

export function WhiteLine({ start, end, visible = true }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  if (!visible) return null;

  return (
    <line userData={{ _is3DLine: true, lineType: 'white' }}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={0xffffff} 
        transparent 
        opacity={0.4}
        linewidth={1}
      />
    </line>
  );
}
