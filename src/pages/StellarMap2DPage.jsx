import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useXPVisibility } from '../components/stellar-map/hooks/useXPVisibility';
import stellarMapService from '../services/stellarMapService';
import StellarMapControls from '../components/stellar-map/StellarMapControls';
import NodeTooltip from '../components/stellar-map/NodeTooltip';
import StellarMapDebugOverlay from '../components/stellar-map/StellarMapDebugOverlay';
import StellarMap2D from '../components/stellar-map/StellarMap2D';
import YouTubePlayerModal from '../components/stellar-map/YouTubePlayerModal';
import StellarMapErrorBoundary from '../components/stellar-map/StellarMapErrorBoundary';

const DEBUG = process.env.NODE_ENV === 'development';

const StellarMap2DPage = () => {
  const [currentCore, setCurrentCore] = useState('Ignition');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchyData, setHierarchyData] = useState({});
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
      console.log('[StellarMap2D] Profile loaded:', profile);
      console.log('[StellarMap2D] Profile current_xp:', profile?.current_xp);
      console.log('[StellarMap2D] Visibility data userXP:', visibilityData.userXP);
    }
  }, [profile, visibilityData.userXP]);

  // Fetch data when core or XP changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (DEBUG) {
          console.log(`[StellarMap2D] Loading data for core: ${currentCore}, XP: ${visibilityData.userXP}`);
        }

        const { data, error: fetchError } = await stellarMapService.getNodesGroupedByHierarchy(
          currentCore,
          visibilityData.userXP
        );

        if (fetchError) {
          console.error('[StellarMap2D] Data fetch error:', fetchError);
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

    if (isYouTubeUrl(nodeData.link)) {
      const videoId = extractYouTubeVideoId(nodeData.link);
      if (videoId) {
        setYoutubeModal({
          isOpen: true,
          nodeData: nodeData,
          videoId: videoId
        });
      } else {
        console.warn('Could not extract YouTube video ID from URL:', nodeData.link);
        window.open(nodeData.link, '_blank');
      }
    } else {
      window.open(nodeData.link, '_blank');
    }
  };

  // Handle core change
  const handleCoreChange = (core) => {
    setCurrentCore(core);
  };

  // Get constellation and subnode options for controls
  const constellationOptions = useMemo(() => {
    const options = [];
    const seenKeys = new Set();
    
    Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
      Object.keys(constellations).forEach((constellationName) => {
        // Create unique key based on both family and constellation
        const uniqueKey = `${familyName}|${constellationName}`;
        
        // Only add if we haven't seen this combination before
        if (!seenKeys.has(uniqueKey)) {
          seenKeys.add(uniqueKey);
          options.push({ 
            familyAlias: familyName,
            constellationAlias: constellationName,
            value: uniqueKey, // Use unique key as value for consistency
            label: constellationName,
            displayName: `${familyName} / ${constellationName}`
          });
        }
      });
    });
    return options;
  }, [hierarchyData]);

  const subnodeOptions = useMemo(() => {
    const options = [];
    Object.values(hierarchyData).forEach((family) => {
      Object.values(family).forEach((nodes) => {
        nodes.forEach((node) => {
          if (!options.find(opt => opt.value === node.id)) {
            options.push({ value: node.id, label: node.title });
          }
        });
      });
    });
    return options;
  }, [hierarchyData]);

  const handleConstellationSelect = (constellationName) => {
    if (focusConstellationRef.current) {
      focusConstellationRef.current(constellationName);
    }
  };

  const handleSubnodeSelect = (nodeId) => {
    if (focusSubnodeRef.current) {
      focusSubnodeRef.current(nodeId);
    }
  };

  const handleYoutubeModalClose = () => {
    setYoutubeModal({ isOpen: false, nodeData: null, videoId: null });
  };

  const handleVideoComplete = async () => {
    // Refresh profile to update XP
    if (user?.id) {
      await fetchProfile();
    }
  };

  return (
    <StellarMapErrorBoundary>
      <div
        className="relative overflow-hidden bg-gradient-radial from-[#0a0a1e] to-black"
        style={{ 
          width: '100%', 
          height: '100vh', 
          margin: 0,
          padding: 0
        }}
        role="main"
        aria-label="Stellar Map 2D - Lightweight visualization of learning content"
      >

        {/* 2D View */}
        <div className="absolute inset-0">
          <StellarMap2D
            hierarchyData={hierarchyData}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            hoveredNodeId={hoveredNodeId}
            currentCore={currentCore}
          />
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
          showWhiteLines={false}
          onToggleWhiteLines={() => {}}
        />

        {/* Tooltip */}
        <NodeTooltip
          node={tooltipData.node}
          visible={tooltipData.visible}
          position={tooltipData.position}
        />

        {/* Debug Overlay */}
        {DEBUG && (
          <StellarMapDebugOverlay
            currentCore={currentCore}
            userXP={visibilityData.userXP}
            visibilityGroup={visibilityData.visibilityGroup}
            nodeCount={Object.values(hierarchyData).flatMap(family => 
              Object.values(family).flat()
            ).length}
            familyCount={Object.keys(hierarchyData).length}
            constellationCount={Object.values(hierarchyData).reduce((sum, family) => 
              sum + Object.keys(family).length, 0
            )}
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
    </StellarMapErrorBoundary>
  );
};

export default StellarMap2DPage;
