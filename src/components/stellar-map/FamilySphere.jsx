import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Creates a fog material for family/constellation spheres
 */
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

/**
 * Component to render a family fog sphere
 * This is a helper function, not a React component, since Three.js objects
 * are managed directly in the scene
 */
export function createFamilySphere(familyAlias, position, radius, colorHex, scene) {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = createFogMaterial(colorHex, 0.15);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);
  mesh.userData = { 
    _is3DFamily: true, 
    familyAlias 
  };
  scene.add(mesh);
  return mesh;
}

/**
 * Hook to manage family sphere in React component
 */
export function useFamilySphere(scene, familyAlias, position, radius, colorHex) {
  const meshRef = useRef(null);

  useEffect(() => {
    if (!scene || !position || !radius) return;

    const mesh = createFamilySphere(familyAlias, position, radius, colorHex, scene);
    meshRef.current = mesh;

    return () => {
      if (meshRef.current) {
        scene.remove(meshRef.current);
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }
    };
  }, [scene, familyAlias, position, radius, colorHex]);

  return meshRef.current;
}
