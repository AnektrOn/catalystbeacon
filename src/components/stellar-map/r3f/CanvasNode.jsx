import React, { useRef, useEffect, useMemo, memo, useState } from 'react';
import * as drei from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Html = drei.Html;

// Debug: Verify Html is imported
if (!Html) {
  console.error('[CanvasNode] Html component is undefined from @react-three/drei', drei);
}

// Node colors like HTML example
const NODE_COLORS = ['#ffffff', '#aaddff', '#ffddaa', '#ffaa88'];

const DIFFICULTY_STYLES = {
  0: { color: '#ffffff', size: 2 },
  1: { color: '#aaddff', size: 2.5 },
  2: { color: '#ffddaa', size: 3 },
  3: { color: '#ffaa88', size: 3.5 },
  4: { color: '#ffffff', size: 4 },
  5: { color: '#aaddff', size: 4.5 },
  6: { color: '#ffddaa', size: 5 },
  7: { color: '#ffaa88', size: 5.5 },
  8: { color: '#ffffff', size: 6 },
  9: { color: '#aaddff', size: 6.5 },
  10: { color: '#ffffff', size: 7 }
};

const CanvasNodeComponent = ({ 
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
  const animationIdRef = useRef(null);
  const timeRef = useRef(0);
  const pulseOffsetRef = useRef(Math.random() * Math.PI * 2);
  
  // Memoize style calculation
  const style = useMemo(() => {
    const baseStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES[0];
    // Random color from palette like HTML example
    const color = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
    return { ...baseStyle, color };
  }, [difficulty]);
  
  const nodeRadius = useMemo(() => style.size, [style.size]);
  const canvasSize = useMemo(() => Math.max(nodeRadius * 20, 60), [nodeRadius]); // Larger canvas for visibility
  
  // Make node always face the camera
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  // Animate canvas star (like HTML example)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size immediately
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Initial render
    const render = (time = 0) => {
      timeRef.current = time * 0.001;
      
      // Clear
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      
      // Pulse effect (like HTML example)
      const pulse = Math.sin(timeRef.current * 2 + pulseOffsetRef.current) * 0.5 + 1;
      const currentRadius = nodeRadius * pulse;
      
      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = style.color;
      
      // Core star
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Orbit ring for larger nodes (like HTML example)
      if (nodeRadius > 3.5) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, currentRadius * 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      animationIdRef.current = requestAnimationFrame(render);
    };
    
    // Start animation immediately
    render(0);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [canvasSize, nodeRadius, style.color]);
  
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

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible plane for interaction */}
      <mesh
        userData={{ ...userData, _is3DSubnode: true }}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[canvasSize / 15, canvasSize / 15]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* HTML overlay with canvas - always faces camera */}
      {Html ? (
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
            style={{
              width: `${canvasSize}px`,
              height: `${canvasSize}px`,
              transition: "all 0.3s ease",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            />
          </div>
        </Html>
      ) : null}
    </group>
  );
};

// Memoize component to prevent unnecessary re-renders
const CanvasNode = memo(CanvasNodeComponent, (prevProps, nextProps) => {
  return (
    prevProps.position === nextProps.position &&
    prevProps.difficulty === nextProps.difficulty &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.userData?.id === nextProps.userData?.id
  );
});

export { CanvasNode };

