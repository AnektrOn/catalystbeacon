import React, { useRef, useEffect, useMemo, useState } from 'react';

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

const CONNECTION_DISTANCE = 100;
const SCANNER_RADIUS = 150;

export function CanvasStellarMap({
  hierarchyData,
  onNodeHover,
  onNodeClick,
  hoveredNodeId,
  showWhiteLines = true
}) {
  const canvasRef = useRef(null);
  const fogCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationIdRef = useRef(null);
  const timeRef = useRef(0);
  const [tooltip, setTooltip] = useState({ visible: false, node: null, x: 0, y: 0 });
  const [discoveredNodes, setDiscoveredNodes] = useState(new Set());

  // Flatten nodes with random positions (like the HTML example)
  const nodesWithPositions = useMemo(() => {
    if (!hierarchyData || Object.keys(hierarchyData).length === 0) return [];
    
    const nodes = [];
    const allNodes = [];
    
    // Collect all nodes
    Object.values(hierarchyData).forEach((constellations) => {
      Object.values(constellations).forEach((nodeList) => {
        allNodes.push(...nodeList);
      });
    });
    
    // Assign random positions (like the HTML example)
    allNodes.forEach((node, index) => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      const x = Math.random() * (width - 100) + 50;
      const y = Math.random() * (height - 100) + 50;
      
      nodes.push({
        ...node,
        x,
        y,
        pulseOffset: Math.random() * Math.PI * 2,
        discovered: discoveredNodes.has(node.id)
      });
    });
    
    return nodes;
  }, [hierarchyData, discoveredNodes]);

  // Generate connections
  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < nodesWithPositions.length; i++) {
      for (let j = i + 1; j < nodesWithPositions.length; j++) {
        const dx = nodesWithPositions[i].x - nodesWithPositions[j].x;
        const dy = nodesWithPositions[i].y - nodesWithPositions[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < CONNECTION_DISTANCE) {
          conns.push({
            from: nodesWithPositions[i],
            to: nodesWithPositions[j],
            dist
          });
        }
      }
    }
    return conns;
  }, [nodesWithPositions]);

  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const fogCanvas = fogCanvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !fogCanvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      fogCanvas.width = rect.width;
      fogCanvas.height = rect.height;
      
      // Initialize fog
      const fogCtx = fogCanvas.getContext('2d');
      fogCtx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop (like the HTML example)
  useEffect(() => {
    const canvas = canvasRef.current;
    const fogCanvas = fogCanvasRef.current;
    if (!canvas || !fogCanvas) return;

    const animate = (time) => {
      timeRef.current = time * 0.001;
      const ctx = canvas.getContext('2d');
      const fogCtx = fogCanvas.getContext('2d');
      const mouse = mouseRef.current;

    // Clear main canvas
    ctx.fillStyle = '#020204';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update fog of war
    fogCtx.globalCompositeOperation = 'destination-out';
    const gradient = fogCtx.createRadialGradient(
      mouse.x, mouse.y, SCANNER_RADIUS * 0.5,
      mouse.x, mouse.y, SCANNER_RADIUS
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    fogCtx.fillStyle = gradient;
    fogCtx.beginPath();
    fogCtx.arc(mouse.x, mouse.y, SCANNER_RADIUS, 0, Math.PI * 2);
    fogCtx.fill();
    fogCtx.globalCompositeOperation = 'source-over';

    // Draw connections
    if (showWhiteLines) {
      connections.forEach(conn => {
        const alpha = 1 - (conn.dist / CONNECTION_DISTANCE);
        ctx.strokeStyle = `rgba(0, 100, 150, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
      });
    }

    // Draw nodes and track hover/discovery
    let hoveredNode = null;
    const newDiscovered = new Set(discoveredNodes);
    
    nodesWithPositions.forEach(node => {
      const style = DIFFICULTY_STYLES[node.difficulty || 0] || DIFFICULTY_STYLES[0];
      const pulse = Math.sin(timeRef.current * 2 + node.pulseOffset) * 0.5 + 1;
      const radius = style.size * pulse;
      const isHovered = hoveredNodeId === node.id;
      
      // Check mouse hover and discovery
      const dx = node.x - mouse.x;
      const dy = node.y - mouse.y;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      
      // Discover nodes in scanner range
      if (distToMouse < SCANNER_RADIUS) {
        newDiscovered.add(node.id);
      }
      
      // Check hover
      if (distToMouse < 20) {
        hoveredNode = node;
      }

      // Glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = style.color;
      
      // Core star
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      // Orbit ring for larger nodes
      if (radius > 3.5) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Hover highlight
      if (isHovered || hoveredNode?.id === node.id) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    // Update discovered nodes
    if (newDiscovered.size !== discoveredNodes.size) {
      setDiscoveredNodes(newDiscovered);
    }

    // Draw scanner reticle
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, SCANNER_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

      // Draw fog layer on top
      ctx.drawImage(fogCanvas, 0, 0);

      // Update tooltip
      if (hoveredNode) {
        setTooltip({
          visible: true,
          node: hoveredNode,
          x: hoveredNode.x + 15,
          y: hoveredNode.y + 15
        });
        if (onNodeHover) onNodeHover(hoveredNode, { clientX: mouse.x, clientY: mouse.y });
      } else {
        setTooltip({ visible: false, node: null, x: 0, y: 0 });
        if (onNodeHover) onNodeHover(null, null);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [nodesWithPositions, connections, showWhiteLines, hoveredNodeId, discoveredNodes, onNodeHover]);

  const handleCanvasClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find clicked node
    for (const node of nodesWithPositions) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20) {
        if (onNodeClick) onNodeClick(node);
        break;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      onClick={handleCanvasClick}
      style={{ cursor: 'crosshair' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'auto' }}
      />
      <canvas
        ref={fogCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
      />
      {tooltip.visible && tooltip.node && (
        <div
          className="absolute bg-black/90 border border-cyan-500 p-2 rounded pointer-events-none z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(15px, 15px)',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
          }}
        >
          <div className="text-white font-bold text-sm">{tooltip.node.title}</div>
          <div className="text-cyan-400 text-xs mt-1">{tooltip.node.constellationAlias}</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-2 animate-pulse" />
        </div>
      )}
    </div>
  );
}

