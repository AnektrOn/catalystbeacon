import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useXPVisibility } from './hooks/useXPVisibility';
import { useThreeScene } from './hooks/useThreeScene';
import { useCameraFocus } from './hooks/useCameraFocus';
import { useNodeInteraction } from './hooks/useNodeInteraction';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';
import stellarMapService from '../../services/stellarMapService';
import {
  positionSubnodeMetatron,
  PLANET_RADII,
  calculateFamilyRadius,
  calculateConstellationRadius,
  calculateSafeConstellationDistance,
  calculateFamilyPlacementRadius,
  getAngularDirection
} from '../../utils/stellarMapPositioning';
import { createFamilySphere } from './FamilySphere';
import { createConstellationSphere } from './ConstellationSphere';
import { createSubnodeSphere } from './SubnodeSphere';
import {
  createFamilyConstellationLine,
  createIntraConstellationLines
} from './ConnectionLines';
import StellarMapControls from './StellarMapControls';
import NodeTooltip from './NodeTooltip';

// Family and constellation halo colors
const FAMILY_HALO_COLORS = {
  "Veil Piercers": 0x301934,
  "Mind Hackers": 0x203020,
  "Persona Shifters": 0x102030,
  "Reality Shatters": 0x303010,
  "Thought Catchers": 0x301030,
  "Heart Whisperers": 0x103030,
  "Routine Architects": 0x302010,
  "Safe Havens": 0x201020,
  "Path Makers": 0x301820,
  "Reality Tuners": 0x182030,
  "Energy Architects": 0x203018,
  "Inner Illuminators": 0x302810,
  "Ritual Grid": 0x281830
};

const CONSTELLATION_HALO_COLORS = {
  "Puppet Masters": 0x600000,
  "Smoke & Mirrors": 0x800000,
  "Golden Shackles": 0xA00000,
  "Panopticon": 0xC00000,
  "Lesson Leashes": 0xE00000,
  "Hidden Commands": 0x006000,
  "Feed Puppets": 0x008000,
  "Mind Traps": 0x00A000,
  "Voice of Deception": 0x00C000,
  "Mask Breakers": 0x000060,
  "Avatar Illusions": 0x000080,
  "I-Dissolvers": 0x0000A0,
  "Numbers Don't Lie": 0x606000,
  "Whistleblowers": 0x808000,
  "Double-Speak": 0xA0A000,
  "Pause Buttons": 0x301030,
  "Mirror Moments": 0x501050,
  "Grounding Gems": 0x701070,
  "Feeling Detectors": 0x106010,
  "Calm Cradles": 0x108010,
  "Mood Markers": 0x10A010,
  "Tiny Dawns": 0x606010,
  "Signal Guards": 0x808010,
  "Reset Pulses": 0xA0A010,
  "Mind Sanctum": 0x101060,
  "Breath Portals": 0x101080,
  "Rhythm Reset": 0x1010A0,
  "Thought Sculptors": 0x602000,
  "Mind Cartographers": 0x802000,
  "Body-Bridge": 0xA02000,
  "Witness Protocols": 0x006020,
  "Chance Benders": 0x008020,
  "Aura Sync": 0x00A020,
  "Wheel Harmonizers": 0x200060,
  "Energy Highways": 0x200080,
  "Prana Weaver": 0x2000A0,
  "Core Miners": 0x600060,
  "Voice Bridgers": 0x800080,
  "Shadow Ledger": 0xA000A0,
  "Dawn Circuit": 0x002060,
  "Unity Pulse": 0x002080,
  "Meta Map": 0x0020A0
};

const StellarMap = () => {
  const [currentCore, setCurrentCore] = useState('Ignition');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchyData, setHierarchyData] = useState({});
  const [constellationCenters, setConstellationCenters] = useState({});
  const [showWhiteLines, setShowWhiteLines] = useState(true);
  const [nodeMeshes, setNodeMeshes] = useState([]);
  
  const contextsRef = useRef({});
  const constellationCentersRef = useRef({});

  const visibilityData = useXPVisibility();

  // Create Three.js scenes for each core
  const ignitionContext = useThreeScene('core-ignition3D', 'Ignition', currentCore === 'Ignition');
  const insightContext = useThreeScene('core-insight3D', 'Insight', currentCore === 'Insight');
  const transformationContext = useThreeScene('core-transformation3D', 'Transformation', currentCore === 'Transformation');

  // Store contexts
  useEffect(() => {
    if (ignitionContext) contextsRef.current['Ignition'] = ignitionContext;
    if (insightContext) contextsRef.current['Insight'] = insightContext;
    if (transformationContext) contextsRef.current['Transformation'] = transformationContext;
  }, [ignitionContext, insightContext, transformationContext]);

  // Get current context
  const currentContext = contextsRef.current[currentCore];

  // Camera focus functions
  const { focusConstellation, focusSubnode } = useCameraFocus(currentContext);

  // Node interaction
  const { hoveredNode, tooltipPosition } = useNodeInteraction(currentContext, nodeMeshes);

  // Performance optimization
  usePerformanceOptimization(contextsRef.current);

  // Fetch data on mount and when core changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await stellarMapService.getNodesGroupedByHierarchy(
          currentCore,
          visibilityData.userXP
        );

        if (fetchError) throw fetchError;

        setHierarchyData(data || {});
      } catch (err) {
        console.error('Error loading stellar map data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentCore, visibilityData.userXP]);

  // Render nodes when data or context changes
  useEffect(() => {
    if (!currentContext || !hierarchyData || Object.keys(hierarchyData).length === 0) return;

    const scene = currentContext.scene;
    if (!scene) return;

    // Clear existing nodes, lines, and halos
    const objectsToRemove = [];
    scene.traverse((object) => {
      if (
        object.userData?._is3DSubnode ||
        object.userData?._is3DLine ||
        object.userData?._is3DHalo ||
        object.userData?._is3DFamily ||
        object.userData?._is3DConstellation
      ) {
        objectsToRemove.push(object);
      }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));

    const centers = {};
    const meshes = [];

    // Calculate positions
    const positioned = calculateHierarchyPositions(hierarchyData);

    // Render families and constellations
    Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
      // Calculate family center and radius
      const familyNodes = Object.values(constellations).flat();
      const familyTotalNodes = familyNodes.length;
      const familyRadius = calculateFamilyRadius(familyTotalNodes);
      
      // Get family index for positioning
      const familyList = Object.keys(hierarchyData);
      const familyIndex = familyList.indexOf(familyName);
      const maxFamilyRadius = Math.max(...familyList.map(f => 
        calculateFamilyRadius(Object.values(hierarchyData[f]).flat().length)
      ));
      const familyPlacementRadius = calculateFamilyPlacementRadius(maxFamilyRadius, familyList.length);
      const familyDir = getAngularDirection(familyIndex, familyList.length);
      const familyCenter = familyDir.clone().multiplyScalar(familyPlacementRadius);
      
      const familyColor = FAMILY_HALO_COLORS[familyName] || 0x333333;

      // Create family sphere
      createFamilySphere(familyName, familyCenter, familyRadius, familyColor, scene);

      // Render constellations within family
      const constellationList = Object.entries(constellations);
      constellationList.forEach(([constellationName, nodes], constIndex) => {
        if (!nodes || nodes.length === 0) return;

        // Calculate constellation position
        const constRadius = calculateConstellationRadius(nodes.length);
        const safeDist = calculateSafeConstellationDistance(familyRadius, constRadius);
        const constDir = getAngularDirection(constIndex, constellationList.length);
        const constPos = familyCenter.clone().add(constDir.clone().multiplyScalar(safeDist));
        const constColor = CONSTELLATION_HALO_COLORS[constellationName] || 0x666666;

        centers[constellationName] = constPos.clone();
        constellationCentersRef.current[constellationName] = constPos.clone();

        // Create constellation sphere
        createConstellationSphere(
          constellationName,
          familyName,
          constPos,
          constRadius,
          constColor,
          scene
        );

        // Render subnodes
        const nodePositions = [];
        nodes.forEach((node, index) => {
          const nodeRadius = PLANET_RADII[node.difficulty] || 0.3;
          const nodePos = positionSubnodeMetatron(
            index,
            nodes.length,
            constPos,
            constRadius,
            nodeRadius
          );

          nodePositions.push(nodePos);
          const { coreMesh } = createSubnodeSphere(
            {
              ...node,
              constellationAlias: constellationName,
              familyAlias: familyName
            },
            nodePos,
            scene
          );
          meshes.push(coreMesh);
        });

        // Create connection lines
        // Gold line from family center to constellation's easiest node
        if (nodes.length > 0) {
          const easiestNode = nodes.reduce((min, node) =>
            node.difficulty < min.difficulty ? node : min
          );
          const easiestIndex = nodes.findIndex(n => n.id === easiestNode.id);
          if (easiestIndex >= 0 && nodePositions[easiestIndex]) {
            createFamilyConstellationLine(
              familyCenter,
              nodePositions[easiestIndex],
              scene
            );
          }
        }

        // White lines between nodes in constellation
        if (showWhiteLines && nodePositions.length > 1) {
          createIntraConstellationLines(nodePositions, scene);
        }
      });
    });

    setConstellationCenters(centers);
    setNodeMeshes(meshes);

    // Reset camera
    if (currentContext.controls) {
      currentContext.controls.target.set(0, 0, 0);
      const dir = new THREE.Vector3()
        .subVectors(currentContext.camera.position, new THREE.Vector3(0, 0, 0))
        .normalize();
      currentContext.camera.position.copy(dir.multiplyScalar(15));
      currentContext.controls.update();
    }
  }, [currentContext, hierarchyData, showWhiteLines]);

  // Prepare constellation options for dropdown
  const constellationOptions = useMemo(() => {
    const options = [];
    Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
      Object.keys(constellations).forEach(constellationName => {
        options.push({
          familyAlias: familyName,
          constellationAlias: constellationName,
          displayName: `${familyName} / ${constellationName}`
        });
      });
    });
    return options;
  }, [hierarchyData]);

  // Prepare subnode options for dropdown
  const subnodeOptions = useMemo(() => {
    const nodes = [];
    Object.values(hierarchyData).forEach(constellations => {
      Object.values(constellations).forEach(nodeArray => {
        nodes.push(...nodeArray);
      });
    });
    return nodes;
  }, [hierarchyData]);

  // Handle core change
  const handleCoreChange = (coreName) => {
    const capitalized = coreName.charAt(0).toUpperCase() + coreName.slice(1);
    setCurrentCore(capitalized);
  };

  // Handle constellation selection
  const handleConstellationSelect = (familyAlias, constellationAlias) => {
    focusConstellation(constellationAlias, constellationCentersRef.current);
  };

  // Handle subnode selection
  const handleSubnodeSelect = (nodeId) => {
    const nodeMesh = nodeMeshes.find(m => m.userData?.id === nodeId);
    if (nodeMesh) {
      focusSubnode(nodeMesh.position);
    }
  };

  // Toggle white lines
  const handleToggleWhiteLines = () => {
    setShowWhiteLines(!showWhiteLines);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Stellar Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading stellar map: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-gradient-radial from-[#0a0a1e] to-black"
      role="main"
      aria-label="Stellar Map - 3D visualization of learning content"
    >
      {/* Starfield Background */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: "url('https://humancatalystprogram.com/wp-content/uploads/2025/06/pexels-frank-cone-140140-3607542.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        aria-hidden="true"
      />

      {/* Canvas Containers */}
      <div
        id="core-ignition3D"
        className={`absolute inset-0 ${currentCore === 'Ignition' ? 'block' : 'hidden'}`}
        role="tabpanel"
        aria-labelledby="core-ignition-tab"
        aria-hidden={currentCore !== 'Ignition'}
      />
      <div
        id="core-insight3D"
        className={`absolute inset-0 ${currentCore === 'Insight' ? 'block' : 'hidden'}`}
        role="tabpanel"
        aria-labelledby="core-insight-tab"
        aria-hidden={currentCore !== 'Insight'}
      />
      <div
        id="core-transformation3D"
        className={`absolute inset-0 ${currentCore === 'Transformation' ? 'block' : 'hidden'}`}
        role="tabpanel"
        aria-labelledby="core-transformation-tab"
        aria-hidden={currentCore !== 'Transformation'}
      />

      {/* Controls */}
      <StellarMapControls
        currentCore={currentCore}
        onCoreChange={handleCoreChange}
        constellations={constellationOptions}
        subnodes={subnodeOptions}
        onConstellationSelect={handleConstellationSelect}
        onSubnodeSelect={handleSubnodeSelect}
        showWhiteLines={showWhiteLines}
        onToggleWhiteLines={handleToggleWhiteLines}
      />

      {/* Tooltip */}
      <NodeTooltip
        node={hoveredNode?.userData}
        position={tooltipPosition}
        visible={tooltipPosition.visible}
      />
    </div>
  );
};

export default StellarMap;
