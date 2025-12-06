import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeSceneManager } from './core/ThreeSceneManager';
import { NodeRenderer } from './core/NodeRenderer';
import { InteractionManager } from './core/InteractionManager';
import { useXPVisibility } from './hooks/useXPVisibility';
import stellarMapService from '../../services/stellarMapService';
import StellarMapControls from './StellarMapControls';
import NodeTooltip from './NodeTooltip';
import StellarMapDebugOverlay from './StellarMapDebugOverlay';
import * as debugHelpers from './utils/debugHelpers';

const DEBUG = process.env.NODE_ENV === 'development';

const StellarMap = () => {
  const [currentCore, setCurrentCore] = useState('Ignition');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchyData, setHierarchyData] = useState({});
  const [showWhiteLines, setShowWhiteLines] = useState(true);
  const [tooltipData, setTooltipData] = useState({ visible: false, node: null, position: { x: 0, y: 0 } });

  const sceneManagerRef = useRef(null);
  const nodeRendererRef = useRef({});
  const interactionManagerRef = useRef({});
  const containerRefs = useRef({
    ignition: null,
    insight: null,
    transformation: null
  });
  const constellationCentersRef = useRef({});
  const nodeMeshesRef = useRef([]);

  const visibilityData = useXPVisibility();

  // Initialize Three.js scenes
  useEffect(() => {
    if (DEBUG) {
      console.log('[StellarMap] Initializing Three.js scenes...');
      debugHelpers.checkThreeJS();
      debugHelpers.checkContainers();
    }

    const manager = new ThreeSceneManager();

    // Initialize all three scenes
    const ignitionCtx = manager.initializeScene('core-ignition3D', 'Ignition');
    const insightCtx = manager.initializeScene('core-insight3D', 'Insight');
    const transformationCtx = manager.initializeScene('core-transformation3D', 'Transformation');

    if (!ignitionCtx || !insightCtx || !transformationCtx) {
      const errorMsg = 'Failed to initialize 3D scenes. Please refresh the page.';
      console.error('[StellarMap]', errorMsg);
      if (DEBUG) {
        debugHelpers.checkContainers();
      }
      setError(errorMsg);
      return;
    }

    if (DEBUG) {
      console.log('[StellarMap] All scenes initialized successfully');
      ['Ignition', 'Insight', 'Transformation'].forEach(coreName => {
        const ctx = manager.getScene(coreName);
        if (ctx) {
          debugHelpers.inspectScene(ctx.scene, ctx.camera, ctx.renderer);
        }
      });
    }

    // Create node renderers for each scene
    nodeRendererRef.current = {
      Ignition: new NodeRenderer(ignitionCtx.scene),
      Insight: new NodeRenderer(insightCtx.scene),
      Transformation: new NodeRenderer(transformationCtx.scene)
    };

    // Create interaction managers for each scene
    interactionManagerRef.current = {
      Ignition: new InteractionManager(
        ignitionCtx.scene,
        ignitionCtx.camera,
        ignitionCtx.renderer,
        []
      ),
      Insight: new InteractionManager(
        insightCtx.scene,
        insightCtx.camera,
        insightCtx.renderer,
        []
      ),
      Transformation: new InteractionManager(
        transformationCtx.scene,
        transformationCtx.camera,
        transformationCtx.renderer,
        []
      )
    };

    // Set up interaction callbacks
    Object.values(interactionManagerRef.current).forEach(im => {
      im.setOnNodeHover((data) => {
        setTooltipData(data);
      });
      im.setOnNodeClick((nodeData) => {
        // Node click handled by InteractionManager (opens link)
      });
    });

    // Attach event listeners
    Object.values(interactionManagerRef.current).forEach(im => {
      im.attachListeners();
    });

    sceneManagerRef.current = manager;
    manager.startAnimation();

    // Handle resize
    const handleResize = () => {
      manager.handleResize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      manager.stopAnimation();
      manager.dispose();
      Object.values(interactionManagerRef.current).forEach(im => im.dispose());
    };
  }, []);

  // Fetch data when core or XP changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (DEBUG) {
          console.log(`[StellarMap] Loading data for core: ${currentCore}, XP: ${visibilityData.userXP}`);
        }

        const { data, error: fetchError } = await stellarMapService.getNodesGroupedByHierarchy(
          currentCore,
          visibilityData.userXP
        );

        if (fetchError) {
          console.error('[StellarMap] Data fetch error:', fetchError);
          throw fetchError;
        }

        if (DEBUG) {
          debugHelpers.checkNodeData(data);
          debugHelpers.checkXPVisibility(visibilityData.userXP, currentCore);
        }

        setHierarchyData(data || {});
      } catch (err) {
        console.error('Error loading stellar map data:', err);
        setError(err.message || 'Failed to load stellar map data');
      } finally {
        setLoading(false);
      }
    };

    if (sceneManagerRef.current) {
      loadData();
    }
  }, [currentCore, visibilityData.userXP]);

  // Render nodes when data changes
  useEffect(() => {
    const renderer = nodeRendererRef.current[currentCore];
    const interactionManager = interactionManagerRef.current[currentCore];
    const sceneContext = sceneManagerRef.current?.getScene(currentCore);

    if (!renderer || !interactionManager || !sceneContext || !hierarchyData || Object.keys(hierarchyData).length === 0) {
      return;
    }

    // Render nodes
    if (DEBUG) {
      console.log(`[StellarMap] Rendering nodes for ${currentCore}...`);
    }

    const { nodeMeshes, constellationCenters } = renderer.render(hierarchyData, showWhiteLines);
    nodeMeshesRef.current = nodeMeshes;
    constellationCentersRef.current = constellationCenters;

    if (DEBUG) {
      console.log(`[StellarMap] Rendered ${nodeMeshes.length} node meshes`);
      const sceneContext = sceneManagerRef.current?.getScene(currentCore);
      if (sceneContext) {
        debugHelpers.countSceneObjects(sceneContext.scene);
      }
    }

    // Update interaction manager with new meshes
    interactionManager.updateNodeMeshes(nodeMeshes);

    // Reset camera position
    if (sceneContext.controls) {
      sceneContext.controls.target.set(0, 0, 0);
      const dir = new THREE.Vector3()
        .subVectors(sceneContext.camera.position, new THREE.Vector3(0, 0, 0))
        .normalize();
      sceneContext.camera.position.copy(dir.multiplyScalar(15));
      sceneContext.controls.update();
    }
  }, [hierarchyData, currentCore, showWhiteLines]);

  // Update white lines visibility
  useEffect(() => {
    const renderer = nodeRendererRef.current[currentCore];
    if (renderer) {
      renderer.toggleWhiteLines(showWhiteLines);
    }
  }, [showWhiteLines, currentCore]);

  // Prepare constellation and subnode options for controls
  const constellationOptions = React.useMemo(() => {
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

  const subnodeOptions = React.useMemo(() => {
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
    const interactionManager = interactionManagerRef.current[currentCore];
    const sceneContext = sceneManagerRef.current?.getScene(currentCore);

    if (interactionManager && sceneContext?.controls) {
      interactionManager.focusConstellation(
        constellationAlias,
        constellationCentersRef.current,
        sceneContext.controls
      );
    }
  };

  // Handle subnode selection
  const handleSubnodeSelect = (nodeId) => {
    const nodeMesh = nodeMeshesRef.current.find(m => m.userData?.id === nodeId);
    const interactionManager = interactionManagerRef.current[currentCore];
    const sceneContext = sceneManagerRef.current?.getScene(currentCore);

    if (nodeMesh && interactionManager && sceneContext?.controls) {
      interactionManager.focusSubnode(nodeMesh.position, sceneContext.controls);
    }
  };

  // Toggle white lines
  const handleToggleWhiteLines = () => {
    setShowWhiteLines(!showWhiteLines);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-radial from-[#0a0a1e] to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Stellar Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-radial from-[#0a0a1e] to-black p-4">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-4">Error loading stellar map: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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

      {/* Canvas Containers - Always rendered with dimensions */}
      <div
        ref={el => containerRefs.current.ignition = el}
        id="core-ignition3D"
        className="absolute inset-0"
        style={{
          visibility: currentCore === 'Ignition' ? 'visible' : 'hidden',
          pointerEvents: currentCore === 'Ignition' ? 'auto' : 'none',
          zIndex: currentCore === 'Ignition' ? 1 : 0
        }}
        role="tabpanel"
        aria-labelledby="core-ignition-tab"
        aria-hidden={currentCore !== 'Ignition'}
      />
      <div
        ref={el => containerRefs.current.insight = el}
        id="core-insight3D"
        className="absolute inset-0"
        style={{
          visibility: currentCore === 'Insight' ? 'visible' : 'hidden',
          pointerEvents: currentCore === 'Insight' ? 'auto' : 'none',
          zIndex: currentCore === 'Insight' ? 1 : 0
        }}
        role="tabpanel"
        aria-labelledby="core-insight-tab"
        aria-hidden={currentCore !== 'Insight'}
      />
      <div
        ref={el => containerRefs.current.transformation = el}
        id="core-transformation3D"
        className="absolute inset-0"
        style={{
          visibility: currentCore === 'Transformation' ? 'visible' : 'hidden',
          pointerEvents: currentCore === 'Transformation' ? 'auto' : 'none',
          zIndex: currentCore === 'Transformation' ? 1 : 0
        }}
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
        node={tooltipData.node}
        position={tooltipData.position}
        visible={tooltipData.visible}
      />

      {/* Debug Overlay */}
      {DEBUG && (
        <StellarMapDebugOverlay
          currentCore={currentCore}
          userXP={visibilityData.userXP}
          visibilityGroup={visibilityData.getGroup(currentCore)}
          nodeCount={nodeMeshesRef.current.length}
          familyCount={Object.keys(hierarchyData).length}
          constellationCount={Object.values(hierarchyData).reduce((sum, c) => sum + Object.keys(c).length, 0)}
        />
      )}
    </div>
  );
};

export default StellarMap;
