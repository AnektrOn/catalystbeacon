import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getCurrentPaletteData } from '../../utils/colorPaletteSwitcher';

/**
 * 2D View Component for Stellar Map - Celestial Mandala Style
 * Uses the app's color palette system
 * Core, Constellation, and Subnode nodes have different colors
 */
const StellarMap2D = ({
  hierarchyData,
  onNodeHover,
  onNodeClick,
  hoveredNodeId,
  currentCore
}) => {
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 1000 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [colorPalette, setColorPalette] = useState(() => getCurrentPaletteData());

  // Listen for color palette changes
  useEffect(() => {
    const handlePaletteChange = () => {
      setColorPalette(getCurrentPaletteData());
    };

    window.addEventListener('colorPaletteChanged', handlePaletteChange);
    return () => window.removeEventListener('colorPaletteChanged', handlePaletteChange);
  }, []);

  // Get colors from current palette
  const getPaletteColor = (variable, fallback) => {
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(variable).trim();
    return value || fallback;
  };

  // Get colors for different node types
  const coreColor = useMemo(() => getPaletteColor('--color-primary', '#B4833D'), [colorPalette]);
  const constellationColor = useMemo(() => getPaletteColor('--color-secondary', '#81754B'), [colorPalette]);
  const infoColor = useMemo(() => getPaletteColor('--color-info', '#3B82F6'), [colorPalette]);
  const successColor = useMemo(() => getPaletteColor('--color-success', '#10B981'), [colorPalette]);
  const warningColor = useMemo(() => getPaletteColor('--color-warning', '#F59E0B'), [colorPalette]);
  const backgroundColor = useMemo(() => {
    // Use dark background that complements the palette
    const bg = getPaletteColor('--bg-primary', '#0a0a1e');
    // If it's a light color, use dark variant
    if (bg.startsWith('#') && parseInt(bg.slice(1, 3), 16) > 200) {
      return '#0a0a1e';
    }
    return bg;
  }, [colorPalette]);

  // Generate subnode colors based on difficulty using palette colors
  const getSubnodeColor = (difficulty) => {
    // Use different palette colors for different difficulty ranges
    if (difficulty <= 2) return infoColor;
    if (difficulty <= 5) return successColor;
    if (difficulty <= 8) return warningColor;
    return coreColor; // Highest difficulty uses primary color
  };

  // Generate gradient colors from base color
  const generateGradientColors = (baseColor) => {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 180, g: 131, b: 61 };
    };

    const rgbToHex = (r, g, b) => {
      return "#" + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }).join("");
    };

    const baseRgb = hexToRgb(baseColor);
    
    const light = rgbToHex(
      Math.min(255, baseRgb.r + 60),
      Math.min(255, baseRgb.g + 60),
      Math.min(255, baseRgb.b + 60)
    );
    const mid = baseColor;
    const dark = rgbToHex(
      Math.max(0, baseRgb.r - 80),
      Math.max(0, baseRgb.g - 80),
      Math.max(0, baseRgb.b - 80)
    );

    return { light, mid, dark };
  };

  const coreGradient = useMemo(() => generateGradientColors(coreColor), [coreColor]);
  const constellationGradient = useMemo(() => generateGradientColors(constellationColor), [constellationColor]);

  // Calculate radial radar positions
  const layout = useMemo(() => {
    if (!hierarchyData || Object.keys(hierarchyData).length === 0) {
      return { families: [], bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }, center: { x: 0, y: 0 } };
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    const centerX = 0;
    const centerY = 0;
    const families = [];
    const nodePositions = {};
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const familyList = Object.keys(hierarchyData);
    
    // Reversed layout: families closest to core, subnodes outermost
    const familyRadius = 150; // Inner ring for families (closest to core)
    const constellationRadius = 300; // Middle ring for constellations
    const nodeRadius = 450; // Outer ring for subnodes (furthest from core)

    familyList.forEach((familyName, familyIndex) => {
      // Start at top (0 degrees) instead of -90 degrees to fix upside down
      const familyAngle = (familyIndex / familyList.length) * Math.PI * 2;
      const familyX = centerX + Math.cos(familyAngle) * familyRadius;
      const familyY = centerY + Math.sin(familyAngle) * familyRadius;
      
      const constellations = hierarchyData[familyName];
      const constellationList = Object.entries(constellations);
      
      const familyData = {
        name: familyName,
        x: familyX,
        y: familyY,
        angle: familyAngle,
        radius: familyRadius,
        constellations: []
      };

      constellationList.forEach(([constellationName, nodes], constIndex) => {
        if (!nodes || nodes.length === 0) return;

        const angleSpread = Math.min(1.2, constellationList.length * 0.2);
        const constellationAngle = familyAngle + (constIndex - (constellationList.length - 1) / 2) * angleSpread;
        const constellationX = centerX + Math.cos(constellationAngle) * constellationRadius;
        const constellationY = centerY + Math.sin(constellationAngle) * constellationRadius;
        
        const constellationData = {
          name: constellationName,
          x: constellationX,
          y: constellationY,
          angle: constellationAngle,
          radius: constellationRadius,
          nodes: []
        };

        nodes.forEach((node, nodeIndex) => {
          // Validate node has required properties
          if (!node.id) {
            if (isDevelopment) {
              console.warn(`[StellarMap2D] Node at index ${nodeIndex} in constellation "${constellationName}" missing id`);
            }
            return;
          }

          // Validate node-constellation-family relationships
          if (node.constellationAlias && node.constellationAlias !== constellationName) {
            if (isDevelopment) {
              console.warn(
                `[StellarMap2D] Node ${node.id} (${node.title || 'unnamed'}) has mismatched constellationAlias: ` +
                `expected "${constellationName}", got "${node.constellationAlias}"`
              );
            }
          }

          if (node.familyAlias && node.familyAlias !== familyName) {
            if (isDevelopment) {
              console.warn(
                `[StellarMap2D] Node ${node.id} (${node.title || 'unnamed'}) has mismatched familyAlias: ` +
                `expected "${familyName}", got "${node.familyAlias}"`
              );
            }
          }

          // Validate node has constellation_id if available
          if (node.constellation_id && node.constellations) {
            // This validation is already done in the service, but we can double-check here
            if (isDevelopment && node.constellations.name !== constellationName) {
              console.warn(
                `[StellarMap2D] Node ${node.id} constellation relationship mismatch: ` +
                `expected "${constellationName}", got "${node.constellations.name}"`
              );
            }
          }

          const nodeAngle = constellationAngle + (nodeIndex / nodes.length) * Math.PI * 2;
          // Subnodes are further out, with difficulty affecting distance
          const nodeDistance = nodeRadius + (node.difficulty || 0) * 15;
          const nodeX = centerX + Math.cos(nodeAngle) * nodeDistance;
          const nodeY = centerY + Math.sin(nodeAngle) * nodeDistance;

          nodePositions[node.id] = { x: nodeX, y: nodeY };

          constellationData.nodes.push({
            ...node,
            x: nodeX,
            y: nodeY,
            angle: nodeAngle,
            distance: nodeDistance
          });

          minX = Math.min(minX, nodeX - 50);
          minY = Math.min(minY, nodeY - 50);
          maxX = Math.max(maxX, nodeX + 50);
          maxY = Math.max(maxY, nodeY + 50);
        });

        familyData.constellations.push(constellationData);
      });

      families.push(familyData);
    });

    families.forEach(family => {
      minX = Math.min(minX, family.x - 120);
      minY = Math.min(minY, family.y - 120);
      maxX = Math.max(maxX, family.x + 120);
      maxY = Math.max(maxY, family.y + 120);
      
      family.constellations.forEach(constellation => {
        minX = Math.min(minX, constellation.x - 60);
        minY = Math.min(minY, constellation.y - 60);
        maxX = Math.max(maxX, constellation.x + 60);
        maxY = Math.max(maxY, constellation.y + 60);
      });
    });

    return {
      families,
      nodePositions,
      bounds: { minX, minY, maxX, maxY },
      center: { x: centerX, y: centerY }
    };
  }, [hierarchyData]);

  const handleZoomIn = () => {
    setViewBox(prev => ({
      ...prev,
      x: prev.x + prev.width * 0.1,
      y: prev.y + prev.height * 0.1,
      width: prev.width * 0.8,
      height: prev.height * 0.8
    }));
  };

  const handleZoomOut = () => {
    setViewBox(prev => ({
      ...prev,
      x: prev.x - prev.width * 0.125,
      y: prev.y - prev.height * 0.125,
      width: prev.width * 1.25,
      height: prev.height * 1.25
    }));
  };

  const handleReset = () => {
    if (layout.families.length) {
      const padding = 200;
      const size = Math.max(
        Math.abs(layout.bounds.maxX - layout.bounds.minX),
        Math.abs(layout.bounds.maxY - layout.bounds.minY)
      ) + padding * 2;
      setViewBox({
        x: layout.center.x - size / 2,
        y: layout.center.y - size / 2,
        width: size,
        height: size
      });
    }
  };

  // Fixed panning
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ 
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;
      
      const deltaX = (e.clientX - panStart.x) * scaleX;
      const deltaY = (e.clientY - panStart.y) * scaleY;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - deltaX,
        y: prev.y - deltaY
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const getDifficultySize = (difficulty) => {
    return 14 + (difficulty || 0) * 2;
  };

  // Initialize viewBox
  useEffect(() => {
    if (layout.families.length && viewBox.width === 1000) {
      const padding = 200;
      const size = Math.max(
        Math.abs(layout.bounds.maxX - layout.bounds.minX),
        Math.abs(layout.bounds.maxY - layout.bounds.minY)
      ) + padding * 2;
      setViewBox({
        x: layout.center.x - size / 2,
        y: layout.center.y - size / 2,
        width: size,
        height: size
      });
    }
  }, [layout, viewBox.width]);

  if (!layout.families.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No nodes to display
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full"
      style={{ 
        background: backgroundColor,
        backgroundImage: `radial-gradient(circle at center, ${backgroundColor}22, ${backgroundColor})`
      }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
          title="Reset View"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Core gradient (for families/core nodes) */}
          <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={coreGradient.light} stopOpacity="1" />
            <stop offset="50%" stopColor={coreGradient.mid} stopOpacity="1" />
            <stop offset="100%" stopColor={coreGradient.dark} stopOpacity="1" />
          </linearGradient>

          {/* Constellation gradient */}
          <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={constellationGradient.light} stopOpacity="1" />
            <stop offset="50%" stopColor={constellationGradient.mid} stopOpacity="1" />
            <stop offset="100%" stopColor={constellationGradient.dark} stopOpacity="1" />
          </linearGradient>

          {/* Metallic gradient for core */}
          <linearGradient id="metallicCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={coreGradient.light} stopOpacity="1" />
            <stop offset="30%" stopColor={coreGradient.mid} stopOpacity="1" />
            <stop offset="70%" stopColor={coreGradient.dark} stopOpacity="1" />
            <stop offset="100%" stopColor={coreGradient.dark} stopOpacity="0.8" />
          </linearGradient>

          {/* Metallic gradient for constellation */}
          <linearGradient id="metallicConstellation" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={constellationGradient.light} stopOpacity="1" />
            <stop offset="30%" stopColor={constellationGradient.mid} stopOpacity="1" />
            <stop offset="70%" stopColor={constellationGradient.dark} stopOpacity="1" />
            <stop offset="100%" stopColor={constellationGradient.dark} stopOpacity="0.8" />
          </linearGradient>

          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.8"/>
          </filter>
        </defs>

        <g>
          {/* Decorative outer border ring */}
          <circle
            cx={layout.center.x}
            cy={layout.center.y}
            r="550"
            fill="none"
            stroke="url(#coreGradient)"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Main concentric rings - Updated for reversed layout */}
          <circle cx={layout.center.x} cy={layout.center.y} r="150" fill="none" stroke="url(#coreGradient)" strokeWidth="2" opacity="0.4" />
          <circle cx={layout.center.x} cy={layout.center.y} r="300" fill="none" stroke="url(#constellationGradient)" strokeWidth="2" opacity="0.4" />
          <circle cx={layout.center.x} cy={layout.center.y} r="450" fill="none" stroke="url(#coreGradient)" strokeWidth="2" opacity="0.4" />
          
          {/* Angular degree markings */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const radius = 520;
            const x1 = layout.center.x + Math.cos(angle) * (radius - 20);
            const y1 = layout.center.y + Math.sin(angle) * (radius - 20);
            const x2 = layout.center.x + Math.cos(angle) * radius;
            const y2 = layout.center.y + Math.sin(angle) * radius;
            const textX = layout.center.x + Math.cos(angle) * (radius + 25);
            const textY = layout.center.y + Math.sin(angle) * (radius + 25);
            
            return (
              <g key={`degree-${i * 30}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#coreGradient)"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <text
                  x={textX}
                  y={textY}
                  fill={coreColor}
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ textShadow: `0 0 8px ${coreColor}80` }}
                >
                  {i * 30}°
                </text>
              </g>
            );
          })}

          {/* Radial lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
            const rad = angle * Math.PI / 180;
            const length = 550;
            return (
              <line
                key={`radial-${angle}`}
                x1={layout.center.x}
                y1={layout.center.y}
                x2={layout.center.x + Math.cos(rad) * length}
                y2={layout.center.y + Math.sin(rad) * length}
                stroke="url(#coreGradient)"
                strokeWidth="1.5"
                opacity="0.3"
              />
            );
          })}

          {/* Decorative star patterns */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15) * Math.PI / 180;
            const radius = 480;
            const x = layout.center.x + Math.cos(angle) * radius;
            const y = layout.center.y + Math.sin(angle) * radius;
            return (
              <circle
                key={`star-${i}`}
                cx={x}
                cy={y}
                r="2"
                fill={coreColor}
                opacity="0.6"
                filter="url(#goldGlow)"
              />
            );
          })}

          {/* Render families (CORE NODES - use primary color) */}
          {layout.families.map((family, familyIndex) => (
            <g key={family.name}>
              <line
                x1={layout.center.x}
                y1={layout.center.y}
                x2={family.x}
                y2={family.y}
                stroke="url(#coreGradient)"
                strokeWidth="3"
                strokeDasharray="8,4"
                opacity="0.5"
                filter="url(#shadow)"
              />

              <circle
                cx={family.x}
                cy={family.y}
                r="45"
                fill="none"
                stroke="url(#coreGradient)"
                strokeWidth="3"
                opacity="0.4"
                filter="url(#goldGlow)"
              />

              {/* CORE NODE - Primary color */}
              <circle
                cx={family.x}
                cy={family.y}
                r="35"
                fill="url(#metallicCore)"
                stroke={coreGradient.light}
                strokeWidth="4"
                filter="url(#strongGlow)"
                style={{ cursor: 'pointer' }}
              />

              <circle
                cx={family.x}
                cy={family.y}
                r="20"
                fill="none"
                stroke={coreGradient.light}
                strokeWidth="2"
                opacity="0.6"
              />
              
              <text
                x={family.x}
                y={family.y - 60}
                fill={coreGradient.light}
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
                style={{ 
                  textShadow: `0 0 12px ${coreColor}80, 0 2px 6px rgba(0,0,0,1)`,
                  pointerEvents: 'none',
                  filter: 'url(#goldGlow)'
                }}
              >
                {family.name}
              </text>

              {/* Render constellations (CONSTELLATION NODES - use secondary color) */}
              {family.constellations.map((constellation) => (
                <g key={constellation.name}>
                  <line
                    x1={family.x}
                    y1={family.y}
                    x2={constellation.x}
                    y2={constellation.y}
                    stroke="url(#constellationGradient)"
                    strokeWidth="2.5"
                    opacity="0.6"
                    filter="url(#shadow)"
                  />

                  <circle
                    cx={constellation.x}
                    cy={constellation.y}
                    r="30"
                    fill="none"
                    stroke="url(#constellationGradient)"
                    strokeWidth="2"
                    opacity="0.3"
                    filter="url(#goldGlow)"
                  />

                  {/* CONSTELLATION NODE - Secondary color */}
                  <circle
                    cx={constellation.x}
                    cy={constellation.y}
                    r="22"
                    fill="url(#metallicConstellation)"
                    stroke={constellationGradient.light}
                    strokeWidth="3"
                    filter="url(#goldGlow)"
                    style={{ cursor: 'pointer' }}
                  />

                  <circle
                    cx={constellation.x}
                    cy={constellation.y}
                    r="12"
                    fill="none"
                    stroke={constellationGradient.light}
                    strokeWidth="1.5"
                    opacity="0.5"
                  />

                  <text
                    x={constellation.x}
                    y={constellation.y - 40}
                    fill={constellationGradient.light}
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ 
                      textShadow: `0 0 10px ${constellationColor}80, 0 2px 4px rgba(0,0,0,1)`,
                      pointerEvents: 'none'
                    }}
                  >
                    {constellation.name}
                  </text>

                  {/* Render subnodes (SUBNODES - use info/success/warning/primary based on difficulty) */}
                  {constellation.nodes.map((node) => {
                    const isHovered = hoveredNodeId === node.id;
                    const nodeColor = getSubnodeColor(node.difficulty);
                    const nodeSize = getDifficultySize(node.difficulty);

                    return (
                      <g key={node.id}>
                        <line
                          x1={constellation.x}
                          y1={constellation.y}
                          x2={node.x}
                          y2={node.y}
                          stroke="url(#constellationGradient)"
                          strokeWidth="1.5"
                          opacity="0.4"
                          filter="url(#shadow)"
                        />

                        {isHovered && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={nodeSize + 8}
                            fill={nodeColor}
                            opacity="0.3"
                            filter="url(#strongGlow)"
                          />
                        )}

                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={nodeSize + 3}
                          fill="none"
                          stroke={nodeColor}
                          strokeWidth="2"
                          opacity="0.5"
                          filter="url(#goldGlow)"
                        />

                        {/* SUBNODE - Different color based on difficulty */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isHovered ? nodeSize + 2 : nodeSize}
                          fill={nodeColor}
                          stroke={isHovered ? "#fff" : nodeColor}
                          strokeWidth={isHovered ? 4 : 2.5}
                          opacity={isHovered ? 1 : 0.9}
                          filter="url(#goldGlow)"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            if (onNodeHover) {
                              onNodeHover({
                                id: node.id,
                                title: node.title,
                                link: node.link,
                                difficulty: node.difficulty,
                                difficulty_label: node.difficulty_label
                              }, {
                                clientX: e.clientX,
                                clientY: e.clientY
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            if (onNodeHover) {
                              onNodeHover(null, null);
                            }
                          }}
                          onClick={() => {
                            if (onNodeClick) {
                              onNodeClick({
                                id: node.id,
                                title: node.title,
                                link: node.link,
                                difficulty: node.difficulty,
                                difficulty_label: node.difficulty_label
                              });
                            }
                          }}
                        />

                        <text
                          x={node.x}
                          y={node.y + 6}
                          fill="#fff"
                          fontSize="12"
                          fontWeight="bold"
                          textAnchor="middle"
                          pointerEvents="none"
                          style={{ 
                            textShadow: '0 0 8px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,1)'
                          }}
                        >
                          {node.difficulty || 0}
                        </text>

                        <text
                          x={node.x}
                          y={node.y - nodeSize - 18}
                          fill={constellationGradient.light}
                          fontSize="11"
                          fontWeight="600"
                          textAnchor="middle"
                          pointerEvents="none"
                          style={{ 
                            textShadow: `0 0 10px ${constellationColor}80, 0 2px 4px rgba(0,0,0,1)`
                          }}
                        >
                          {node.title.length > 28 ? node.title.substring(0, 25) + '...' : node.title}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}
            </g>
          ))}

          {/* Central core - CORE COLOR */}
          <circle
            cx={layout.center.x}
            cy={layout.center.y}
            r="25"
            fill="url(#metallicCore)"
            stroke={coreGradient.light}
            strokeWidth="4"
            filter="url(#strongGlow)"
          />
          <circle
            cx={layout.center.x}
            cy={layout.center.y}
            r="15"
            fill="none"
            stroke={coreGradient.light}
            strokeWidth="2"
            opacity="0.6"
          />
          <circle
            cx={layout.center.x}
            cy={layout.center.y}
            r="8"
            fill="#000"
            opacity="0.8"
          />

          {/* Decorative inner patterns */}
          {[0, 120, 240].map((angle, i) => {
            const rad = angle * Math.PI / 180;
            const x = layout.center.x + Math.cos(rad) * 40;
            const y = layout.center.y + Math.sin(rad) * 40;
            return (
              <path
                key={`moon-${i}`}
                d={`M ${x} ${y} A 8 8 0 0 1 ${x + 16 * Math.cos(rad)} ${y + 16 * Math.sin(rad)}`}
                fill="none"
                stroke={coreColor}
                strokeWidth="1.5"
                opacity="0.5"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default StellarMap2D;
