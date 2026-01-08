import React, { useRef, useMemo, memo, useState, useEffect } from 'react';
import { Html, Plane } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DIFFICULTY_STYLES = {
  0: { color: '#1a4d7a', size: 0.3 },
  1: { color: '#2d6ba3', size: 0.4 },
  2: { color: '#4089cc', size: 0.5 },
  3: { color: '#53a7f5', size: 0.6 },
  4: { color: '#66c5ff', size: 0.7 },
  5: { color: '#79e3ff', size: 0.8 },
  6: { color: '#8cffff', size: 0.9 },
  7: { color: '#9fffff', size: 1.0 },
  8: { color: '#b2ffff', size: 1.1 },
  9: { color: '#c5ffff', size: 1.2 },
  10: { color: '#ffffff', size: 1.3 }
};

const CanvasStarNodeComponent = ({ 
  position, 
  difficulty = 0, 
  userData,
  onHover,
  onClick,
  isHovered = false
}) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  
  // Memoize style calculation
  const style = useMemo(() => DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES[0], [difficulty]);
  const nodeSize = useMemo(() => style.size * 50, [style.size]);
  const nodeRadius = useMemo(() => Math.random() * 2 + 2, []);
  const pulseOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  
  // Make node always face the camera
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  // Animate the canvas star
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = nodeSize;
    canvas.width = size;
    canvas.height = size;
    
    let animationId;
    const animate = (time) => {
      timeRef.current = time * 0.001;
      
      // Clear
      ctx.clearRect(0, 0, size, size);
      
      // Pulse effect
      const pulse = Math.sin(timeRef.current * 2 + pulseOffset) * 0.5 + 1;
      const currentRadius = nodeRadius * pulse;
      
      // Glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = style.color;
      
      // Core star
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Orbit ring for larger nodes
      if (nodeRadius > 3.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, currentRadius * 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Radiating lines effect (like the HTML example)
      const rayCount = 8;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + timeRef.current * 0.5;
        const rayLength = currentRadius * 3;
        const startX = size / 2 + Math.cos(angle) * currentRadius;
        const startY = size / 2 + Math.sin(angle) * currentRadius;
        const endX = size / 2 + Math.cos(angle) * rayLength;
        const endY = size / 2 + Math.sin(angle) * rayLength;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(timeRef.current + i) * 0.2})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate(0);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [nodeSize, nodeRadius, pulseOffset, style.color]);
  
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
      {/* Invisible plane for interaction - like card gallery */}
      <Plane
        args={[nodeSize / 15, nodeSize / 15]}
        userData={{ ...userData, _is3DSubnode: true }}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      {/* HTML overlay - Canvas-based animated star, always faces camera */}
      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "all 0.3s ease",
          transform: `scale(${scale})`,
          pointerEvents: "none",
        }}
      >
        <div
          className="relative select-none"
          style={{
            width: `${nodeSize}px`,
            height: `${nodeSize}px`,
            opacity: opacity,
            transition: "all 0.3s ease",
            boxShadow: isActiveHovered
              ? `0 25px 50px ${style.color}50, 0 0 30px ${style.color}30`
              : `0 15px 30px rgba(0, 0, 0, 0.6)`,
            border: isActiveHovered ? `2px solid ${style.color}50` : `1px solid ${style.color}20`,
            filter: `brightness(${isActiveHovered ? 1.2 : 1})`,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </div>
      </Html>
    </group>
  );
};

// Memoize component to prevent unnecessary re-renders
export const CanvasStarNode = memo(CanvasStarNodeComponent, (prevProps, nextProps) => {
  return (
    prevProps.position === nextProps.position &&
    prevProps.difficulty === nextProps.difficulty &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.userData?.id === nextProps.userData?.id
  );
});

