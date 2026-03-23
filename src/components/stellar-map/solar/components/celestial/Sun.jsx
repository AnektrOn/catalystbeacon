import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Sun({ position, radius }) {
  const coronaMeshRef = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const mat = coronaMeshRef.current?.material;
    if (mat) {
      mat.opacity = 0.12 + Math.sin(t * 0.7) * 0.04;
    }
    if (coronaMeshRef.current) {
      coronaMeshRef.current.rotation.y += 0.0008;
    }
  });

  return (
    <group position={position}>
      <pointLight
        color="#FFF8E0"
        intensity={2.5}
        decay={2}
        distance={120}
        position={[0, 0, 0]}
      />
      <mesh>
        <sphereGeometry args={[radius * 5, 32, 32]} />
        <meshBasicMaterial
          color="#FFF0C0"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={coronaMeshRef}>
        <sphereGeometry args={[radius * 2.2, 32, 32]} />
        <meshBasicMaterial
          color="#FFE8A0"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 0.6, 24, 24]} />
        <meshBasicMaterial color="#FFFEF0" />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 0.3, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}
