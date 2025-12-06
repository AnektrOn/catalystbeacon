import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Creates a fog material for constellation spheres
 */
function createFogMaterial(hex, peak = 0.20) {
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

/**
 * Create a constellation fog sphere
 */
export function createConstellationSphere(constellationAlias, familyAlias, position, radius, colorHex, scene) {
  const geo = new THREE.SphereGeometry(radius, 12, 12);
  const mat = createFogMaterial(colorHex, 0.20);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);
  mesh.userData = { 
    _is3DConstellation: true, 
    constellationAlias,
    familyAlias 
  };
  scene.add(mesh);
  return mesh;
}

/**
 * Hook to manage constellation sphere
 */
export function useConstellationSphere(scene, constellationAlias, familyAlias, position, radius, colorHex) {
  const meshRef = useRef(null);

  useEffect(() => {
    if (!scene || !position || !radius) return;

    const mesh = createConstellationSphere(constellationAlias, familyAlias, position, radius, colorHex, scene);
    meshRef.current = mesh;

    return () => {
      if (meshRef.current) {
        scene.remove(meshRef.current);
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }
    };
  }, [scene, constellationAlias, familyAlias, position, radius, colorHex]);

  return meshRef.current;
}
