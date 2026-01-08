import React, { useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 2D Fog Overlay Component
 * Hides nodes based on difficulty thresholds and user XP
 * 
 * Difficulty thresholds (to be filled in):
 * - Each difficulty level requires a minimum XP to be visible
 * - Format: { difficulty: minXP }
 */
const DIFFICULTY_THRESHOLDS = {
  // TODO: Fill in XP thresholds for each difficulty level
  // Example: { 0: 0, 1: 100, 2: 500, 3: 1000, ... }
};

export function FogOverlay({ userXP = 0, nodePositions = {}, nodeDifficulties = {} }) {
  const { size, camera } = useThree();
  const fogCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate which nodes should be visible
  const visibleNodes = useMemo(() => {
    const visible = new Set();
    
    Object.entries(nodeDifficulties).forEach(([nodeId, difficulty]) => {
      const threshold = DIFFICULTY_THRESHOLDS[difficulty] ?? 0;
      if (userXP >= threshold) {
        visible.add(nodeId);
      }
    });
    
    return visible;
  }, [userXP, nodeDifficulties]);

  // Project 3D positions to 2D screen coordinates
  const projectToScreen = (position3D) => {
    const vector = new THREE.Vector3(...position3D);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * size.width;
    const y = (-vector.y * 0.5 + 0.5) * size.height;
    
    return { x, y, visible: vector.z < 1 };
  };

  // Update fog canvas
  useEffect(() => {
    const fogCanvas = fogCanvasRef.current;
    if (!fogCanvas) return;

    const ctx = fogCanvas.getContext('2d');
    fogCanvas.width = size.width;
    fogCanvas.height = size.height;

    // Fill with fog
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, size.width, size.height);

    // Clear fog around visible nodes
    ctx.globalCompositeOperation = 'destination-out';
    
    Object.entries(nodePositions).forEach(([nodeId, position3D]) => {
      if (!visibleNodes.has(nodeId)) return;
      
      const screenPos = projectToScreen(position3D);
      if (!screenPos.visible) return;

      // Create radial gradient for soft edges
      const gradient = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, 30
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 30, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [size, camera, nodePositions, visibleNodes]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size.width,
        height: size.height,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <canvas
        ref={fogCanvasRef}
        style={{
          width: '100%',
          height: '100%',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}

