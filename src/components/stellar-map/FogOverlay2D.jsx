import React, { useRef, useEffect, useMemo } from 'react';

/**
 * 2D Fog Overlay Component (Outside Canvas)
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

export function FogOverlay2D({ 
  userXP = 0, 
  nodePositions = {}, 
  nodeDifficulties = {},
  canvasSize = { width: 0, height: 0 }
}) {
  const fogCanvasRef = useRef(null);

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

  // Update fog canvas
  useEffect(() => {
    const fogCanvas = fogCanvasRef.current;
    if (!fogCanvas || canvasSize.width === 0 || canvasSize.height === 0) return;

    const ctx = fogCanvas.getContext('2d');
    fogCanvas.width = canvasSize.width;
    fogCanvas.height = canvasSize.height;

    // Fill with fog
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Clear fog around visible nodes
    ctx.globalCompositeOperation = 'destination-out';
    
    Object.entries(nodePositions).forEach(([nodeId, screenPos]) => {
      if (!visibleNodes.has(nodeId)) return;
      if (!screenPos || screenPos.x === undefined) return;

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
  }, [canvasSize, nodePositions, visibleNodes]);

  if (canvasSize.width === 0 || canvasSize.height === 0) return null;

  return (
    <canvas
      ref={fogCanvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        mixBlendMode: 'multiply',
      }}
    />
  );
}

