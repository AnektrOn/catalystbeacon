import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getCurrentPaletteData } from '../../utils/colorPaletteSwitcher';

/**
 * 2D View Component for Stellar Map - Celestial Mandala Style
 * Uses the app's color palette system
 * Core, Constellation, and Subnode nodes have different colors
 */
const StellarMap2D = React.forwardRef(({
  hierarchyData,
  onNodeHover,
  onNodeClick,
  hoveredNodeId,
  currentCore,
  completionMap = new Map(),
  highlightedNodeIds = new Set(),
  bookmarkedNodeIds = new Set(),
  showAnimations = true,
  showZoomControls = true
}, ref) => {
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 1000 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [colorPalette, setColorPalette] = useState(() => getCurrentPaletteData());
  const [highlightedPath, setHighlightedPath] = useState(null);

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
  const coreColor = useMemo(() => getPaletteColor('--color-primary', '#B4833D'), []);
  const constellationColor = useMemo(() => getPaletteColor('--color-secondary', '#81754B'), []);
  const infoColor = useMemo(() => getPaletteColor('--color-info', '#3B82F6'), []);
  const successColor = useMemo(() => getPaletteColor('--color-success', '#10B981'), []);
  const warningColor = useMemo(() => getPaletteColor('--color-warning', '#F59E0B'), []);
  const backgroundColor = useMemo(() => {
    // Use dark background that complements the palette
    const bg = getPaletteColor('--bg-primary', '#0a0a1e');
    // If it's a light color, use dark variant
    if (bg.startsWith('#') && parseInt(bg.slice(1, 3), 16) > 200) {
      return '#0a0a1e';
    }
    return bg;
  }, []);

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

  // Viewport culling - only render nodes in viewport
  const isNodeInViewport = (nodeX, nodeY, nodeRadius = 50) => {
    const padding = 100;
    return (
      nodeX + nodeRadius + padding >= viewBox.x &&
      nodeX - nodeRadius - padding <= viewBox.x + viewBox.width &&
      nodeY + nodeRadius + padding >= viewBox.y &&
      nodeY - nodeRadius - padding <= viewBox.y + viewBox.height
    );
  };

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

    // Step 1: Collect all nodes and group by familyAlias and constellationAlias
    const groupedByAliases = {};
    Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
      Object.entries(constellations).forEach(([constellationName, nodes]) => {
        if (!nodes || nodes.length === 0) return;
        
        nodes.forEach(node => {
          // Use familyAlias and constellationAlias from node, fallback to hierarchy keys
          const familyAlias = node.familyAlias || familyName;
          const constellationAlias = node.constellationAlias || constellationName;
          
          if (!groupedByAliases[familyAlias]) {
            groupedByAliases[familyAlias] = {};
          }
          if (!groupedByAliases[familyAlias][constellationAlias]) {
            groupedByAliases[familyAlias][constellationAlias] = [];
          }
          
          groupedByAliases[familyAlias][constellationAlias].push(node);
        });
      });
    });

    const familyList = Object.keys(groupedByAliases);
    
    // Positioning constants with collision prevention
    const familyRadius = 200; // Inner ring for families (closest to core)
    const baseConstellationRadius = 250; // Base distance from family center
    const maxConstellationRadius = 600; // Maximum distance for constellations
    const minConstellationSpacing = 120; // Minimum distance between constellation centers
    const baseNodeRadius = 100; // Base distance from constellation center (inner orbit - difficulty 0)
    const maxNodeRadius = 1000; // Maximum distance for nodes (outer orbit - difficulty 10) - LARGE spacing for clear visual separation
    const minNodeSpacing = 80; // Minimum distance between node centers
    const nodeVisualRadius = 15; // Visual radius of a node (smaller for better density)

    // Step 2: Pre-calculate all constellation weights for dynamic scaling
    const allConstellationWeights = [];
    
    familyList.forEach((familyName) => {
      const constellations = groupedByAliases[familyName];
      Object.entries(constellations).forEach(([constellationName, nodes]) => {
        if (!nodes || nodes.length === 0) return;
        const weight = nodes.reduce((sum, node) => sum + (node.difficulty || 0), 0);
        allConstellationWeights.push(weight);
      });
    });

    // Calculate ranges for constellation weight normalization
    const minConstellationWeight = Math.min(...allConstellationWeights, 0);
    const maxConstellationWeight = Math.max(...allConstellationWeights, 0);
    const constellationWeightRange = maxConstellationWeight - minConstellationWeight || 1; // Avoid division by zero

    // Helper function to normalize and scale constellation weight
    const getConstellationDistance = (weight) => {
      if (constellationWeightRange === 0) return baseConstellationRadius;
      const normalized = (weight - minConstellationWeight) / constellationWeightRange;
      // Use square root for smoother distribution
      const scaled = Math.sqrt(normalized);
      return baseConstellationRadius + scaled * (maxConstellationRadius - baseConstellationRadius);
    };

    // Helper function to map difficulty (0-10 scale from DB) directly to distance
    // Difficulty 0 = closest, Difficulty 10 = furthest
    // Uses LINEAR mapping for clear orbital separation
    const getNodeDistance = (difficulty) => {
      // Clamp difficulty to valid range (0-10)
      const clampedDifficulty = Math.max(0, Math.min(10, difficulty || 0));
      // LINEAR mapping: difficulty 0 -> baseNodeRadius, difficulty 10 -> maxNodeRadius
      // Each difficulty level gets evenly spaced orbits
      const normalized = clampedDifficulty / 10;
      const distance = baseNodeRadius + normalized * (maxNodeRadius - baseNodeRadius);
      return distance;
    };

    familyList.forEach((familyName, familyIndex) => {
      // Start at top (0 degrees) instead of -90 degrees to fix upside down
      const familyAngle = (familyIndex / familyList.length) * Math.PI * 2;
      const familyX = centerX + Math.cos(familyAngle) * familyRadius;
      const familyY = centerY + Math.sin(familyAngle) * familyRadius;
      
      const constellations = groupedByAliases[familyName];
      const constellationList = Object.entries(constellations);
      
      const familyData = {
        name: familyName,
        x: familyX,
        y: familyY,
        angle: familyAngle,
        radius: familyRadius,
        constellations: []
      };

      // Calculate optimal angle spread for constellations to prevent overlap
      // Ensure each constellation has enough angular space based on minimum spacing
      const numConstellations = constellationList.length;
      const minAnglePerConstellation = Math.asin(minConstellationSpacing / (2 * baseConstellationRadius)) * 2;
      const totalAngleNeeded = numConstellations * minAnglePerConstellation;
      const maxAngleSpread = Math.min(Math.PI * 1.5, Math.max(totalAngleNeeded, (numConstellations - 1) * 0.4));
      const angleStep = numConstellations > 1 ? maxAngleSpread / (numConstellations - 1) : 0;

      constellationList.forEach(([constellationName, nodes], constIndex) => {
        if (!nodes || nodes.length === 0) return;

        // Step 3: Calculate constellation weight
        const constellationWeight = nodes.reduce((sum, node) => sum + (node.difficulty || 0), 0);
        
        // Step 4: Position constellation relative to family center based on weight (normalized)
        // Use calculated angle step to ensure proper spacing
        const constellationAngle = familyAngle + (constIndex - (numConstellations - 1) / 2) * angleStep;
        
        // Dynamic scaling based on actual data range
        const constellationDistance = getConstellationDistance(constellationWeight);
        const constellationX = familyX + Math.cos(constellationAngle) * constellationDistance;
        const constellationY = familyY + Math.sin(constellationAngle) * constellationDistance;
        
        const constellationData = {
          name: constellationName,
          x: constellationX,
          y: constellationY,
          angle: constellationAngle,
          radius: constellationDistance,
          weight: constellationWeight,
          nodes: []
        };

        // Step 5: Group nodes by difficulty to create orbital rings
        // Difficulty 0 = innermost orbit, Difficulty 10 = outermost orbit
        const nodesByDifficulty = {};
        nodes.forEach(node => {
          const difficulty = node.difficulty || 0;
          if (!nodesByDifficulty[difficulty]) {
            nodesByDifficulty[difficulty] = [];
          }
          nodesByDifficulty[difficulty].push(node);
        });

        // Sort difficulties from 0 to 10 to process inner to outer orbits
        const sortedDifficulties = Object.keys(nodesByDifficulty)
          .map(d => parseInt(d))
          .sort((a, b) => a - b);

        // Process each difficulty level as a separate orbit
        sortedDifficulties.forEach(difficulty => {
          const nodesAtDifficulty = nodesByDifficulty[difficulty];
          const orbitDistance = getNodeDistance(difficulty);
          
          // Calculate minimum angle needed between nodes to prevent overlap
          // Arc length = radius * angle, so angle = arc_length / radius
          // Use effective spacing that accounts for node visual size
          const effectiveSpacing = minNodeSpacing + (nodeVisualRadius * 2);
          const minAnglePerNode = effectiveSpacing / orbitDistance;
          
          // Distribute nodes evenly around the full circle (2π)
          // This ensures maximum spacing between nodes
          const angleStep = (Math.PI * 2) / nodesAtDifficulty.length;
          
          // Log orbit info in development
          if (isDevelopment) {
            console.log(`[StellarMap2D] Orbit ${difficulty}: ${nodesAtDifficulty.length} nodes at ${orbitDistance.toFixed(1)}px, step ${(angleStep * 180 / Math.PI).toFixed(1)}°`);
          }

          // Distribute nodes evenly around their orbit circle
          nodesAtDifficulty.forEach((node, orbitIndex) => {
          // Validate node has required properties
          if (!node.id) {
            if (isDevelopment) {
                console.warn(`[StellarMap2D] Node in constellation "${constellationName}" missing id`);
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
            if (isDevelopment && node.constellations.name !== constellationName) {
              console.warn(
                `[StellarMap2D] Node ${node.id} constellation relationship mismatch: ` +
                `expected "${constellationName}", got "${node.constellations.name}"`
              );
            }
          }

            // Position node at its difficulty orbit
            // Distribute nodes of the same difficulty evenly around their orbit circle
            const nodeAngle = constellationAngle + orbitIndex * angleStep;
            
            const nodeX = constellationX + Math.cos(nodeAngle) * orbitDistance;
            const nodeY = constellationY + Math.sin(nodeAngle) * orbitDistance;

            nodePositions[node.id] = { x: nodeX, y: nodeY };

          constellationData.nodes.push({
            ...node,
            x: nodeX,
            y: nodeY,
            angle: nodeAngle,
              distance: orbitDistance
          });

          minX = Math.min(minX, nodeX - 50);
          minY = Math.min(minY, nodeY - 50);
          maxX = Math.max(maxX, nodeX + 50);
          maxY = Math.max(maxY, nodeY + 50);
          });
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

  // Expose imperative controls via ref (used by parent page buttons)
  React.useImperativeHandle(ref, () => ({
    zoomOut: () => {
      // Kept for backwards compatibility; "zoom out" button should reset to full view.
      handleReset();
    },
    resetView: () => {
      handleReset();
    }
  }));

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

  // Touch gesture support
  const [touchStart, setTouchStart] = useState(null);
  const [touchDistance, setTouchDistance] = useState(null);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setTouchDistance(Math.sqrt(dx * dx + dy * dy));
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && touchStart) {
      // Single touch panning
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;
        
        const deltaX = (e.touches[0].clientX - touchStart.x) * scaleX;
        const deltaY = (e.touches[0].clientY - touchStart.y) * scaleY;
        
        setViewBox(prev => ({
          ...prev,
          x: prev.x - deltaX,
          y: prev.y - deltaY
        }));
        
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    } else if (e.touches.length === 2 && touchDistance) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      const scale = newDistance / touchDistance;
      
      if (scale > 1.05) {
        handleZoomIn();
        setTouchDistance(newDistance);
      } else if (scale < 0.95) {
        handleZoomOut();
        setTouchDistance(newDistance);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setTouchDistance(null);
  };

  // Double tap to zoom
  const [lastTap, setLastTap] = useState(0);
  const handleDoubleTap = (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected - zoom to node if clicked on one
      handleZoomIn();
    }
    setLastTap(now);
  };

  const getDifficultySize = (difficulty) => {
    // Smaller base size for better density
    return 10 + (difficulty || 0) * 1.5;
  };

  // Calculate text size based on zoom level
  const getTextSize = (baseSize, minSize = 8, maxSize = 18) => {
    const zoomFactor = 1000 / viewBox.width; // Normalized zoom (1.0 = default)
    const size = baseSize * zoomFactor;
    return Math.max(minSize, Math.min(maxSize, size));
  };

  // Determine if text should be visible based on zoom
  const shouldShowText = (zoomThreshold = 800) => {
    return viewBox.width <= zoomThreshold;
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const panSpeed = viewBox.width * 0.1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setViewBox(prev => ({ ...prev, y: prev.y + panSpeed }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setViewBox(prev => ({ ...prev, y: prev.y - panSpeed }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setViewBox(prev => ({ ...prev, x: prev.x + panSpeed }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setViewBox(prev => ({ ...prev, x: prev.x - panSpeed }));
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          if (e.shiftKey) {
            e.preventDefault();
            handleReset();
          }
          break;
        case 'Escape':
          if (onNodeHover) {
            onNodeHover(null, null);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewBox.width, onNodeHover]);

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
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes pathDraw {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .node-enter {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
      {/* Zoom Controls (optional) */}
      {showZoomControls && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
            title="Zoom In (+ or =)"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
            title="Zoom Out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
            title="Reset View (Shift+0)"
            aria-label="Reset view"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      )}

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
        style={{ touchAction: 'none' }}
        role="img"
        aria-label={`Stellar Map visualization for ${currentCore} core`}
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
              
              {shouldShowText(1200) && (
                <text
                  x={family.x}
                  y={family.y - 60}
                  fill={coreGradient.light}
                  fontSize={getTextSize(18, 12, 20)}
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
              )}

              {/* Render constellations (CONSTELLATION NODES - use secondary color) */}
              {family.constellations.map((constellation) => {
                // Calculate completion progress for this constellation
                const totalNodes = constellation.nodes.length;
                const completedNodes = constellation.nodes.filter(node => {
                  const comp = completionMap.get(node.id);
                  return comp?.completed || false;
                }).length;
                const progressPercent = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

                return (
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

                    {/* Progress ring for constellation */}
                    {totalNodes > 0 && (
                      <circle
                        cx={constellation.x}
                        cy={constellation.y}
                        r="28"
                        fill="none"
                        stroke={successColor}
                        strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 28 * (progressPercent / 100)} ${2 * Math.PI * 28}`}
                        strokeDashoffset={-2 * Math.PI * 28 * 0.25}
                        opacity={progressPercent > 0 ? "0.8" : "0"}
                        transform={`rotate(-90 ${constellation.x} ${constellation.y})`}
                        filter="url(#goldGlow)"
                        style={{ transition: 'opacity 0.3s ease' }}
                      />
                    )}

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

                    {/* Progress text */}
                    {totalNodes > 0 && (
                      <text
                        x={constellation.x}
                        y={constellation.y + 5}
                        fill={successColor}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"
                        style={{ 
                          textShadow: '0 0 6px rgba(16, 185, 129, 0.8)'
                        }}
                      >
                        {completedNodes}/{totalNodes}
                      </text>
                    )}

                    {shouldShowText(1000) && (
                      <text
                        x={constellation.x}
                        y={constellation.y - 40}
                        fill={constellationGradient.light}
                        fontSize={getTextSize(14, 10, 16)}
                        fontWeight="bold"
                        textAnchor="middle"
                        style={{ 
                          textShadow: `0 0 10px ${constellationColor}80, 0 2px 4px rgba(0,0,0,1)`,
                          pointerEvents: 'none'
                        }}
                      >
                        {constellation.name}
                      </text>
                    )}

                    {/* Render subnodes (SUBNODES - use info/success/warning/primary based on difficulty) */}
                    {constellation.nodes
                    .filter(node => isNodeInViewport(node.x, node.y, getDifficultySize(node.difficulty) + 20))
                    .map((node) => {
                    const isHovered = hoveredNodeId === node.id;
                    const isHighlighted = highlightedNodeIds.has(node.id);
                    const isBookmarked = bookmarkedNodeIds.has(node.id);
                    const nodeColor = getSubnodeColor(node.difficulty);
                    const nodeSize = getDifficultySize(node.difficulty);
                    const completion = completionMap.get(node.id);
                    const isCompleted = completion?.completed || false;
                    
                    // Add bookmark status to node data
                    const nodeWithBookmark = { ...node, isBookmarked };

                    return (
                      <g key={node.id}>
                        <line
                          x1={constellation.x}
                          y1={constellation.y}
                          x2={node.x}
                          y2={node.y}
                          stroke={isHovered || isHighlighted ? successColor : "url(#constellationGradient)"}
                          strokeWidth={isHovered || isHighlighted ? "3" : "1.5"}
                          opacity={isHovered || isHighlighted ? "0.8" : (isCompleted ? "0.6" : "0.4")}
                          filter="url(#shadow)"
                          style={{
                            transition: showAnimations ? 'all 0.3s ease' : 'none',
                            strokeDasharray: isHovered && showAnimations ? '5,5' : 'none',
                            animation: isHovered && showAnimations ? 'pathDraw 1s ease-in-out' : 'none'
                          }}
                        />

                        {(isHovered || isHighlighted) && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={nodeSize + (isHighlighted ? 12 : 8)}
                            fill={isHighlighted ? "#FFD700" : nodeColor}
                            opacity={isHighlighted ? "0.4" : "0.3"}
                            filter="url(#strongGlow)"
                            style={{
                              animation: isHighlighted ? 'pulse 2s ease-in-out infinite' : 'none'
                            }}
                          />
                        )}

                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={nodeSize + 3}
                          fill="none"
                          stroke={nodeColor}
                          strokeWidth="2"
                          opacity={isCompleted ? "0.7" : "0.5"}
                          filter="url(#goldGlow)"
                        />

                        {/* SUBNODE - Different color based on difficulty, with completion indicator */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isHovered ? nodeSize + 2 : nodeSize}
                          fill={isCompleted ? successColor : nodeColor}
                          stroke={isHovered ? "#fff" : (isCompleted ? successColor : nodeColor)}
                          strokeWidth={isHovered ? 4 : (isCompleted ? 3 : 2.5)}
                          opacity={isHovered ? 1 : (isCompleted ? 0.95 : 0.9)}
                          filter="url(#goldGlow)"
                          className={showAnimations ? "node-enter" : ""}
                          style={{ 
                            cursor: 'pointer',
                            transition: showAnimations ? 'all 0.3s ease' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            setHighlightedPath({
                              from: { x: constellation.x, y: constellation.y },
                              to: { x: node.x, y: node.y }
                            });
                            if (onNodeHover) {
                              onNodeHover({
                                ...nodeWithBookmark,
                                isCompleted: isCompleted,
                                completion: completion
                              }, {
                                clientX: e.clientX,
                                clientY: e.clientY
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            setHighlightedPath(null);
                            if (onNodeHover) {
                              onNodeHover(null, null);
                            }
                          }}
                          onClick={() => {
                            if (onNodeClick) {
                              onNodeClick({
                                ...nodeWithBookmark,
                                isCompleted: isCompleted
                              });
                            }
                          }}
                        />

                        {/* Completion checkmark badge */}
                        {isCompleted && (
                          <g>
                            <circle
                              cx={node.x + nodeSize * 0.6}
                              cy={node.y - nodeSize * 0.6}
                              r={nodeSize * 0.4}
                              fill={successColor}
                              stroke="#fff"
                              strokeWidth="1.5"
                              filter="url(#strongGlow)"
                            />
                            <text
                              x={node.x + nodeSize * 0.6}
                              y={node.y - nodeSize * 0.6}
                              fill="#fff"
                              fontSize={nodeSize * 0.5}
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              pointerEvents="none"
                              style={{ 
                                textShadow: '0 0 4px rgba(0,0,0,0.8)'
                              }}
                            >
                              ✓
                            </text>
                          </g>
                        )}

                        {/* Bookmark indicator */}
                        {isBookmarked && (
                          <g>
                            <circle
                              cx={node.x - nodeSize * 0.6}
                              cy={node.y - nodeSize * 0.6}
                              r={nodeSize * 0.35}
                              fill="#FFD700"
                              stroke="#fff"
                              strokeWidth="1.5"
                              filter="url(#strongGlow)"
                            />
                            <text
                              x={node.x - nodeSize * 0.6}
                              y={node.y - nodeSize * 0.6}
                              fill="#000"
                              fontSize={nodeSize * 0.4}
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              pointerEvents="none"
                            >
                              ★
                            </text>
                          </g>
                        )}

                        {shouldShowText(800) && (
                          <text
                            x={node.x}
                            y={node.y + 6}
                            fill="#fff"
                            fontSize={getTextSize(12, 8, 14)}
                            fontWeight="bold"
                            textAnchor="middle"
                            pointerEvents="none"
                            style={{ 
                              textShadow: '0 0 8px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,1)'
                            }}
                          >
                            {node.difficulty || 0}
                          </text>
                        )}

                        {shouldShowText(600) && (
                          <text
                            x={node.x}
                            y={node.y - nodeSize - 18}
                            fill={constellationGradient.light}
                            fontSize={getTextSize(11, 8, 13)}
                            fontWeight="600"
                            textAnchor="middle"
                            pointerEvents="none"
                            style={{ 
                              textShadow: `0 0 10px ${constellationColor}80, 0 2px 4px rgba(0,0,0,1)`
                            }}
                          >
                            {node.title.length > 28 ? node.title.substring(0, 25) + '...' : node.title}
                          </text>
                        )}
                      </g>
                    );
                    })}
                  </g>
                );
              })}
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
});

StellarMap2D.displayName = 'StellarMap2D';

export default StellarMap2D;
