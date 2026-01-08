import React, { useRef, useMemo, memo, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DIFFICULTY_STYLES = {
  0: { color: '#1a4d7a', size: 0.3 },      // Deep blue
  1: { color: '#2d6ba3', size: 0.4 },      // Medium blue
  2: { color: '#4089cc', size: 0.5 },      // Bright blue
  3: { color: '#53a7f5', size: 0.6 },      // Light blue
  4: { color: '#66c5ff', size: 0.7 },      // Cyan blue
  5: { color: '#79e3ff', size: 0.8 },      // Bright cyan
  6: { color: '#8cffff', size: 0.9 },      // Light cyan
  7: { color: '#9fffff', size: 1.0 },       // Very light cyan
  8: { color: '#b2ffff', size: 1.1 },      // Pale cyan
  9: { color: '#c5ffff', size: 1.2 },      // Almost white cyan
  10: { color: '#ffffff', size: 1.3 }      // Pure white
};

const NodeSphereComponent = ({ 
  position, 
  difficulty = 0, 
  userData,
  onHover,
  onClick,
  isHovered = false
}) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef(null);
  
  // Memoize style calculation
  const style = useMemo(() => DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES[0], [difficulty]);
  const nodeRadius = useMemo(() => style.size * 40, [style.size]); // Scale up for HTML (40px per unit)
  
  // Make node always face the camera (like cards)
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });
  
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
    if (onHover) onHover(userData, e);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
    if (onHover) onHover(null, e);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(userData, e);
  };

  const isActiveHovered = hovered || isHovered;
  const scale = isActiveHovered ? 1.35 : 1.0;
  const opacity = isActiveHovered ? 1.0 : 0.9;

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible plane for 3D interaction (raycasting) */}
      <mesh
        userData={{ ...userData, _is3DSubnode: true }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <planeGeometry args={[nodeRadius / 15, nodeRadius / 15]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* HTML overlay - styled as glowing sun ball, always faces camera */}
      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        center
        style={{
          pointerEvents: "none",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: `${nodeRadius}px`,
            height: `${nodeRadius}px`,
            borderRadius: '50%',
            backgroundColor: style.color,
            boxShadow: `
              0 0 ${nodeRadius * 0.6}px ${style.color}50,
              0 0 ${nodeRadius * 0.4}px ${style.color}70,
              0 0 ${nodeRadius * 0.2}px ${style.color}90,
              inset 0 0 ${nodeRadius * 0.15}px rgba(255, 255, 255, 0.3)
            `,
            opacity: opacity,
            transform: `scale(${scale})`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: `2px solid ${style.color}60`,
            filter: `brightness(${isActiveHovered ? 1.2 : 1})`,
          }}
        />
      </Html>
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
