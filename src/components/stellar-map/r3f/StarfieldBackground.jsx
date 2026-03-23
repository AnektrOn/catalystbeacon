import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural starfield + golden galactic dust (no network textures).
 */
export default function StarfieldBackground() {
  const starsGroupRef = useRef(null);
  const dustGroupRef = useRef(null);

  const starsGeometry = useMemo(() => {
    const positions = new Float32Array(8000 * 3);
    for (let i = 0; i < 8000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const dustGeometry = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    const tiltX = 0.55;
    const cosT = Math.cos(tiltX);
    const sinT = Math.sin(tiltX);
    for (let i = 0; i < 3000; i++) {
      const r = 100 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      let x = Math.cos(theta) * r;
      const y0 = (Math.random() - 0.5) * 120;
      let z = Math.sin(theta) * r;
      const y = y0 * cosT - z * sinT;
      z = y0 * sinT + z * cosT;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (starsGroupRef.current) {
      starsGroupRef.current.rotation.y += 0.00004;
    }
    if (dustGroupRef.current) {
      dustGroupRef.current.rotation.y += 0.00006;
    }
  });

  return (
    <group>
      <group ref={starsGroupRef}>
        <points geometry={starsGeometry} frustumCulled={false}>
          <pointsMaterial
            color="#ffffff"
            size={0.5}
            sizeAttenuation
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </points>
      </group>
      <group ref={dustGroupRef}>
        <points geometry={dustGeometry} frustumCulled={false}>
          <pointsMaterial
            color="#C8A96E"
            size={0.35}
            sizeAttenuation
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </points>
      </group>
    </group>
  );
}
