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
    // Use base style color for consistent visibility (was random before)
    const color = baseStyle.color;
    return { ...baseStyle, color };
  }, [difficulty]);
  
  const nodeRadius = useMemo(() => style.size, [style.size]);
  // Scale canvas size with difficulty - higher difficulty = larger node
  // Base size scales from 60px (difficulty 0) to 140px (difficulty 10)
  const baseSize = 60 + (difficulty * 8);
  const canvasSize = useMemo(() => baseSize, [baseSize]);
  
  // Make node always face the camera
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  // Animate canvas star (like HTML example)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CanvasNode] Canvas ref is null');
      }
      return;
    }
    
    // Set canvas size immediately
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CanvasNode] Could not get 2D context');
      }
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[CanvasNode] Rendering node:', {
        canvasSize,
        difficulty,
        color: style.color,
        baseRadius: 5 + (difficulty * 1.5)
      });
    }
    
    // Initial render
    const render = (time = 0) => {
      timeRef.current = time * 0.001;
      
      // Clear with transparent background
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      
      // Pulse effect - subtle pulse (15% variation)
      const pulse = Math.sin(timeRef.current * 2 + pulseOffsetRef.current) * 0.15 + 1;
      // Scale radius with difficulty - higher difficulty = larger radius
      // Base radius scales from 5px (difficulty 0) to 20px (difficulty 10)
      const baseRadius = 5 + (difficulty * 1.5);
      const currentRadius = baseRadius * pulse;
      
      // Draw outer glow - bright and visible
      const gradient = ctx.createRadialGradient(
        canvasSize / 2, canvasSize / 2, 0,
        canvasSize / 2, canvasSize / 2, currentRadius * 2.5
      );
      // Convert hex to rgba for opacity
      const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      gradient.addColorStop(0, hexToRgba(style.color, 1.0));
      gradient.addColorStop(0.3, hexToRgba(style.color, 0.8));
      gradient.addColorStop(0.6, hexToRgba(style.color, 0.4));
      gradient.addColorStop(1, hexToRgba(style.color, 0));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, currentRadius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Core star - bright and visible
      ctx.fillStyle = style.color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = style.color;
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Always draw orbit ring for visibility
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, currentRadius * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      
      animationIdRef.current = requestAnimationFrame(render);
    };
    
    // Start animation immediately
    render(0);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [canvasSize, difficulty, style.color]);
  
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

  // Calculate interaction plane size to match visible node size
  // Base radius: 5px + 1.5px per difficulty, with 15% pulse margin
  const interactionSize = useMemo(() => {
    const nodeBaseRadius = 5 + (difficulty * 1.5);
    const maxRadius = nodeBaseRadius * 1.15; // Account for pulse (15% max)
    // Convert pixel size to 3D units (approximately 0.01 units per pixel at distanceFactor 12)
    return (maxRadius * 2) / 1000;
  }, [difficulty]);

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible plane for interaction - precise size matching visible node */}
      <mesh
        userData={{ ...userData, _is3DSubnode: true }}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Match interaction area to actual visible node size for precise mouse events */}
        <planeGeometry args={[interactionSize, interactionSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* HTML overlay with canvas - always faces camera */}
      {Html ? (
        <Html
          transform
          distanceFactor={12}
          position={[0, 0, 0.01]}
          center
          zIndexRange={[100, 0]}
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
              position: 'relative',
              zIndex: 1000,
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
                imageRendering: 'auto',
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

