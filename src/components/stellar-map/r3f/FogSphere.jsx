import React, { useMemo } from 'react';
import * as THREE from 'three';

function createFogMaterial(hex, peak = 0.15) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hex) },
      uPeak: { value: peak }
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPos;
      uniform vec3  uColor;
      uniform float uPeak;
      void main() {
        float r = length(vPos);
        float edge = smoothstep(0.7,1.0,r);
        gl_FragColor = vec4(uColor, (1.0 - edge) * uPeak);
      }
    `
  });
}

export function FogSphere({ radius, color, peak = 0.15, position, userData }) {
  const material = useMemo(() => createFogMaterial(color, peak), [color, peak]);

  return (
    <mesh position={position} material={material} userData={userData}>
      <sphereGeometry args={[radius, 8, 8]} />
    </mesh>
  );
}
