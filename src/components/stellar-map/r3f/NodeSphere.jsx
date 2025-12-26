import React, { useRef, useEffect, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DIFFICULTY_STYLES = {
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

const NodeSphereComponent = ({ 
  position, 
  difficulty = 0, 
  userData,
  onHover,
  onClick,
  isHovered = false
}) => {
  const meshRef = useRef();
  const rimRef = useRef();
  
  // Memoize style calculation
  const style = useMemo(() => DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES[0], [difficulty]);
  const nodeRadius = useMemo(() => style.size, [style.size]);
  
  // Memoize geometry args to prevent recreation - Further reduced for performance
  const coreGeometryArgs = useMemo(() => [nodeRadius, 6, 6], [nodeRadius]);
  const rimGeometryArgs = useMemo(() => [nodeRadius * 1.05, 6, 6], [nodeRadius]);

  // Animate hover - throttled for performance
  const targetScale = useMemo(() => isHovered ? 1.35 : 1.0, [isHovered]);
  let lastFrame = 0;
  useFrame((state) => {
    // Only update every other frame for better performance
    if (state.clock.elapsedTime - lastFrame < 0.016) return;
    lastFrame = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (onHover) onHover(userData, e);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    if (onHover) onHover(null, e);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(userData, e);
  };

  return (
    <group position={position}>
      {/* Core sphere - Reduced segments for performance */}
      <mesh
        ref={meshRef}
        userData={{ ...userData, _is3DSubnode: true }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={coreGeometryArgs} />
        <meshBasicMaterial 
          color={style.color} 
          transparent 
          opacity={isHovered ? 1.0 : 0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Rim - Further reduced segments for performance */}
      <mesh ref={rimRef} userData={{ _is3DHalo: true }}>
        <sphereGeometry args={rimGeometryArgs} />
        <meshBasicMaterial 
          color={0x000000} 
          side={THREE.BackSide}
          transparent 
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// Memoize component to prevent unnecessary re-renders
export const NodeSphere = memo(NodeSphereComponent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.position === nextProps.position &&
    prevProps.difficulty === nextProps.difficulty &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.userData?.id === nextProps.userData?.id
  );
});
