import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useXPVisibility } from './hooks/useXPVisibility';
import stellarMapService from '../../services/stellarMapService';
import StellarMapControls from './StellarMapControls';
import NodeTooltip from './NodeTooltip';
import StellarMapDebugOverlay from './StellarMapDebugOverlay';
import YouTubePlayerModal from './YouTubePlayerModal';
import { StarfieldBackground } from './r3f/StarfieldBackground';

// Lazy load 3D scene
const StellarMapScene = lazy(() => import('./r3f/StellarMapScene').then(module => ({ default: module.StellarMapScene })));

const DEBUG = process.env.NODE_ENV === 'development';

const StellarMap = () => {
  const [currentCore, setCurrentCore] = useState('Ignition');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchyData, setHierarchyData] = useState({});
  const [showWhiteLines, setShowWhiteLines] = useState(true);
  const [tooltipData, setTooltipData] = useState({ visible: false, node: null, position: { x: 0, y: 0 } });
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [youtubeModal, setYoutubeModal] = useState({ isOpen: false, nodeData: null, videoId: null });
  const focusConstellationRef = useRef(null);
  const focusSubnodeRef = useRef(null);

  const { profile, user, fetchProfile } = useAuth();
  const visibilityData = useXPVisibility();
  
  // Debug: Log profile and XP
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[StellarMap] Profile loaded:', profile);
      console.log('[StellarMap] Profile current_xp:', profile?.current_xp);
      console.log('[StellarMap] Visibility data userXP:', visibilityData.userXP);
    }
  }, [profile, visibilityData.userXP]);

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

        setHierarchyData(data || {});
      } catch (err) {
        console.error('Error loading stellar map data:', err);
        setError(err.message || 'Failed to load stellar map data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentCore, visibilityData.userXP]);

  // Handle node hover
  const handleNodeHover = (nodeData, event) => {
    if (nodeData) {
      setHoveredNodeId(nodeData.id);
      if (event) {
        setTooltipData({
          visible: true,
          node: nodeData,
          position: { x: event.clientX, y: event.clientY }
        });
      }
    } else {
      setHoveredNodeId(null);
      setTooltipData({ visible: false, node: null, position: { x: 0, y: 0 } });
    }
  };

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return /youtube\.com|youtu\.be/.test(url);
  };

  // Handle node click
  const handleNodeClick = (nodeData) => {
    if (!nodeData?.link) return;

    // Check if it's a YouTube URL
    if (isYouTubeUrl(nodeData.link)) {
      const videoId = extractYouTubeVideoId(nodeData.link);
      if (videoId) {
        // Show YouTube modal
        setYoutubeModal({
          isOpen: true,
          nodeData: nodeData,
          videoId: videoId
        });
      } else {
        // Invalid YouTube URL, open in new tab
        console.warn('Could not extract YouTube video ID from URL:', nodeData.link);
        window.open(nodeData.link, '_blank');
      }
    } else {
      // Not a YouTube URL, open in new tab (existing behavior)
      window.open(nodeData.link, '_blank');
    }
  };

  // Handle YouTube modal close
  const handleYoutubeModalClose = () => {
    setYoutubeModal({ isOpen: false, nodeData: null, videoId: null });
  };

  // Handle video completion
  const handleVideoComplete = async (completionData) => {
    // Refresh profile to update XP display
    // This will automatically update visibilityData since it depends on profile.current_xp
    if (user?.id && fetchProfile) {
      await fetchProfile(user.id);
    }
    
    // The useEffect that loads data will automatically re-run when visibilityData.userXP changes
    // No manual refresh needed
  };

  // Prepare constellation and subnode options for controls
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

  // Handle constellation selection (focus camera)
  const handleConstellationSelect = (familyAlias, constellationAlias) => {
    if (focusConstellationRef.current) {
      focusConstellationRef.current(constellationAlias);
    }
  };

  // Handle subnode selection (focus camera)
  const handleSubnodeSelect = (nodeId) => {
    if (focusSubnodeRef.current) {
      focusSubnodeRef.current(nodeId);
    }
  };

  // Toggle white lines
  const handleToggleWhiteLines = () => {
    setShowWhiteLines(!showWhiteLines);
  };

  return (
    <div
      className="relative overflow-hidden bg-black w-full h-screen"
      style={{ 
        padding: 0,
        margin: 0
      }}
      role="main"
      aria-label="Stellar Map - 3D visualization of learning content"
    >
      {/* Starfield Background */}
      <StarfieldBackground />


      {/* 3D Scene - Transparent so starfield shows through */}
      <div className="absolute inset-0 w-full h-full z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading 3D view...</p>
            </div>
          </div>
        }>
          <StellarMapScene
            coreName={currentCore}
            hierarchyData={hierarchyData}
            showWhiteLines={showWhiteLines}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            hoveredNodeId={hoveredNodeId}
            onConstellationFocus={(focusFn) => { focusConstellationRef.current = focusFn; }}
            onSubnodeFocus={(focusFn) => { focusSubnodeRef.current = focusFn; }}
            userXP={visibilityData.userXP}
          />
        </Suspense>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Stellar Map...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="text-center max-w-md bg-background/90 p-6 rounded-lg">
            <p className="text-destructive mb-4">Error loading stellar map: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

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
          nodeCount={Object.values(hierarchyData).reduce((sum, constellations) => 
            sum + Object.values(constellations).reduce((s, nodes) => s + nodes.length, 0), 0
          )}
          familyCount={Object.keys(hierarchyData).length}
          constellationCount={Object.values(hierarchyData).reduce((sum, c) => sum + Object.keys(c).length, 0)}
        />
      )}

      {/* YouTube Player Modal */}
      <YouTubePlayerModal
        isOpen={youtubeModal.isOpen}
        onClose={handleYoutubeModalClose}
        nodeData={youtubeModal.nodeData}
        videoId={youtubeModal.videoId}
        onComplete={handleVideoComplete}
      />
    </div>
  );
};

export default StellarMap;
