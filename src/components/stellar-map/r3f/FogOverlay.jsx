import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { XP_THRESHOLDS, DEPTH_RANGES, getCurrentGroup } from '../hooks/useXPVisibility';

/**
 * 2D Fog Overlay Component
 * Hides nodes based on difficulty thresholds and user XP
 * 
 * Uses the existing XP visibility system:
 * - Fog: difficulties 0-2
 * - Lens: difficulties 3-5  
 * - Prism: difficulties 6-8
 * - Beam: difficulties 9-10
 */

export function FogOverlay({ 
  userXP = 0, 
  coreName = 'Ignition',
  nodePositions = {}, 
  nodeDifficulties = {},
  canvasSize = { width: 0, height: 0 },
  camera = null
}) {
  const fogCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate which nodes should be visible based on XP visibility system
  const visibleNodes = useMemo(() => {
    const visible = new Set();
    const currentGroup = getCurrentGroup(coreName, userXP);
    const difficultyRange = DEPTH_RANGES[currentGroup];
    const thresholds = XP_THRESHOLDS[coreName] || XP_THRESHOLDS.Ignition;
    
    // Get the XP threshold for the current visibility group
    const groupThreshold = thresholds[currentGroup] || 0;
    
    Object.entries(nodeDifficulties).forEach(([nodeId, difficulty]) => {
      // Check if difficulty is in the visible range for current group
      const isInRange = difficulty >= difficultyRange[0] && difficulty <= difficultyRange[1];
      
      // Check if user has enough XP for this group
      const hasEnoughXP = userXP >= groupThreshold;
      
      if (isInRange && hasEnoughXP) {
        visible.add(nodeId);
      }
    });
    
    return visible;
  }, [userXP, coreName, nodeDifficulties]);

  // Project 3D positions to 2D screen coordinates
  const projectToScreen = (position3D) => {
    if (!camera) return { x: 0, y: 0, visible: false };
    
    const vector = new THREE.Vector3(...position3D);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * canvasSize.width;
    const y = (-vector.y * 0.5 + 0.5) * canvasSize.height;
    
    return { x, y, visible: vector.z < 1 };
  };

  // Update fog canvas
  useEffect(() => {
    const fogCanvas = fogCanvasRef.current;
    if (!fogCanvas || canvasSize.width === 0 || canvasSize.height === 0 || !camera) return;

    const ctx = fogCanvas.getContext('2d');
    fogCanvas.width = canvasSize.width;
    fogCanvas.height = canvasSize.height;

    // Fill with fog
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

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
  }, [canvasSize, camera, nodePositions, visibleNodes]);

  if (canvasSize.width === 0 || canvasSize.height === 0 || !camera) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: canvasSize.width,
        height: canvasSize.height,
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

