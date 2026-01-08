import React, { useRef, useMemo, memo, useState } from 'react';
import { Html, Plane } from '@react-three/drei';
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

const StarNodeComponent = ({ 
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
  const nodeSize = useMemo(() => style.size * 50, [style.size]); // Scale up for HTML
  
  // Make node always face the camera
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

  // Generate random rays for organic look
  const rays = useMemo(() => {
    const rayCount = 32;
    const raysArray = [];
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const length = 50 + Math.random() * 50;
      const waveAmplitude = 3 + Math.random() * 5;
      const waveCount = 2 + Math.random() * 4;
      const delay = Math.random() * 2;
      raysArray.push({
        angle,
        length,
        waveAmplitude,
        waveCount,
        delay,
        opacity: 0.2 + Math.random() * 0.5,
        thickness: 0.5 + Math.random() * 1.5
      });
    }
    return raysArray;
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible plane for interaction - exactly like card gallery */}
      <Plane
        args={[nodeSize / 15, nodeSize / 15]}
        userData={{ ...userData, _is3DSubnode: true }}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      {/* HTML overlay - Radiating star node, always faces camera - like card gallery */}
      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "all 0.3s ease",
          transform: isActiveHovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="relative select-none"
          style={{
            width: `${nodeSize * 1.5}px`,
            height: `${nodeSize * 1.5}px`,
            transition: "all 0.3s ease",
            boxShadow: isActiveHovered
              ? `0 25px 50px ${style.color}50, 0 0 30px ${style.color}30`
              : `0 15px 30px rgba(0, 0, 0, 0.6)`,
            border: isActiveHovered ? `2px solid ${style.color}50` : `1px solid ${style.color}20`,
          }}
        >
          {/* Radiating wavy lines using SVG */}
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{
              overflow: 'visible',
              pointerEvents: 'none',
            }}
            viewBox={`0 0 ${nodeSize * 2} ${nodeSize * 2}`}
          >
            {rays.map((ray, index) => {
              const centerX = nodeSize;
              const centerY = nodeSize;
              const endX = centerX + Math.cos(ray.angle) * ray.length;
              const endY = centerY + Math.sin(ray.angle) * ray.length;
              
              // Create smooth wavy path using quadratic curves
              const pathPoints = [];
              const segments = 15;
              for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const x = centerX + (endX - centerX) * t;
                const y = centerY + (endY - centerY) * t;
                const perpAngle = ray.angle + Math.PI / 2;
                const waveOffset = Math.sin(t * Math.PI * ray.waveCount + ray.delay) * ray.waveAmplitude;
                const offsetX = Math.cos(perpAngle) * waveOffset;
                const offsetY = Math.sin(perpAngle) * waveOffset;
                pathPoints.push({ x: x + offsetX, y: y + offsetY });
              }
              
              // Build smooth path with quadratic curves
              let pathD = `M ${centerX},${centerY}`;
              for (let i = 0; i < pathPoints.length - 1; i++) {
                const current = pathPoints[i];
                const next = pathPoints[i + 1];
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;
                if (i === 0) {
                  pathD += ` Q ${current.x},${current.y} ${midX},${midY}`;
                } else {
                  pathD += ` T ${midX},${midY}`;
                }
              }
              pathD += ` L ${endX},${endY}`;
              
              return (
                <g key={index}>
                  <path
                    d={pathD}
                    stroke={style.color}
                    strokeWidth={ray.thickness}
                    fill="none"
                    opacity={ray.opacity}
                    strokeLinecap="round"
                    style={{
                      filter: 'blur(0.8px)',
                      animation: `pulse-${index} ${2 + ray.delay}s ease-in-out infinite`,
                      animationDelay: `${ray.delay}s`,
                    }}
                  />
                  <style>{`
                    @keyframes pulse-${index} {
                      0%, 100% {
                        opacity: ${ray.opacity};
                      }
                      50% {
                        opacity: ${Math.min(ray.opacity * 1.3, 1)};
                      }
                    }
                  `}</style>
                </g>
              );
            })}
          </svg>

          {/* Central bright core */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${nodeSize * 0.4}px`,
              height: `${nodeSize * 0.4}px`,
              backgroundColor: style.color,
              boxShadow: `
                0 0 ${nodeSize * 0.6}px ${style.color}80,
                0 0 ${nodeSize * 0.4}px ${style.color}60,
                0 0 ${nodeSize * 0.2}px ${style.color}40,
                inset 0 0 ${nodeSize * 0.15}px rgba(255, 255, 255, 0.5)
              `,
              filter: `brightness(${isActiveHovered ? 1.3 : 1})`,
              transition: "all 0.3s ease",
            }}
          />

          {/* Inner glow halo */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${nodeSize * 0.6}px`,
              height: `${nodeSize * 0.6}px`,
              backgroundColor: 'transparent',
              boxShadow: `0 0 ${nodeSize * 0.3}px ${style.color}40`,
              filter: 'blur(2px)',
            }}
          />
        </div>
      </Html>
    </group>
  );
};

// Memoize component to prevent unnecessary re-renders
export const StarNode = memo(StarNodeComponent, (prevProps, nextProps) => {
  return (
    prevProps.position === nextProps.position &&
    prevProps.difficulty === nextProps.difficulty &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.userData?.id === nextProps.userData?.id
  );
});

