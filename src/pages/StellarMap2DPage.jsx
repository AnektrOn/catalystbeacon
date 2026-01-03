import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useXPVisibility } from '../components/stellar-map/hooks/useXPVisibility';
import stellarMapService from '../services/stellarMapService';
import StellarMapControls from '../components/stellar-map/StellarMapControls';
import NodeTooltip from '../components/stellar-map/NodeTooltip';
import StellarMap2D from '../components/stellar-map/StellarMap2D';
import YouTubePlayerModal from '../components/stellar-map/YouTubePlayerModal';
import StellarMapErrorBoundary from '../components/stellar-map/StellarMapErrorBoundary';
import StellarMapSearch from '../components/stellar-map/StellarMapSearch';
import StellarMapLegend from '../components/stellar-map/StellarMapLegend';
import StellarMapMiniMap from '../components/stellar-map/StellarMapMiniMap';
import StellarMapAnalytics from '../components/stellar-map/StellarMapAnalytics';
import StellarMapBreadcrumb from '../components/stellar-map/StellarMapBreadcrumb';
import StellarMapSettings from '../components/stellar-map/StellarMapSettings';
import { Download, Share2, Settings } from 'lucide-react';

const StellarMap2DPage = () => {
  const [currentCore, setCurrentCore] = useState('Ignition');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchyData, setHierarchyData] = useState({});
  const [completionMap, setCompletionMap] = useState(new Map());
  const [tooltipData, setTooltipData] = useState({ visible: false, node: null, position: { x: 0, y: 0 } });
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [youtubeModal, setYoutubeModal] = useState({ isOpen: false, nodeData: null, videoId: null });
  const [searchVisible, setSearchVisible] = useState(false);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState(new Set());
  const [analyticsVisible, setAnalyticsVisible] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedConstellation, setSelectedConstellation] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [bookmarkedNodes, setBookmarkedNodes] = useState(new Set());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [viewSettings, setViewSettings] = useState({
    showNodeLabels: true,
    showConnectionLines: true,
    connectionLineOpacity: 0.4,
    showDecorativeElements: true
  });
  const focusConstellationRef = useRef(null);
  const focusSubnodeRef = useRef(null);

  const { user, fetchProfile } = useAuth();
  const visibilityData = useXPVisibility();

  // Load bookmarks and history from localStorage
  useEffect(() => {
    if (!user?.id) return;
    
    const savedBookmarks = localStorage.getItem(`stellar_map_bookmarks_${user.id}`);
    if (savedBookmarks) {
      setBookmarkedNodes(new Set(JSON.parse(savedBookmarks)));
    }
    const savedHistory = localStorage.getItem(`stellar_map_history_${user.id}`);
    if (savedHistory) {
      setNodeHistory(JSON.parse(savedHistory));
    }
  }, [user?.id]);

  // Save bookmarks to localStorage
  const toggleBookmark = (nodeId) => {
    setBookmarkedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      if (user?.id) {
        localStorage.setItem(`stellar_map_bookmarks_${user.id}`, JSON.stringify(Array.from(newSet)));
      }
      return newSet;
    });
  };

  // Track node history
  const addToHistory = (nodeData) => {
    if (!nodeData?.id) return;
    setNodeHistory(prev => {
      const filtered = prev.filter(n => n.id !== nodeData.id);
      const updated = [{ ...nodeData, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 10);
      if (user?.id) {
        localStorage.setItem(`stellar_map_history_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Fetch data when core or XP changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await stellarMapService.getNodesGroupedByHierarchy(
          currentCore,
          visibilityData.userXP
        );

        if (fetchError) {
          console.error('[StellarMap2D] Data fetch error:', fetchError);
          throw fetchError;
        }

        setHierarchyData(data || {});

        // Fetch completion statuses for all visible nodes
        if (user?.id && data) {
          const allNodeIds = [];
          Object.values(data).forEach((family) => {
            Object.values(family).forEach((nodes) => {
              nodes.forEach((node) => {
                if (node.id) {
                  allNodeIds.push(node.id);
                }
              });
            });
          });

          if (allNodeIds.length > 0) {
            const { data: completions, error: completionError } = await stellarMapService.getBulkCompletionStatus(
              user.id,
              allNodeIds
            );

            if (completionError) {
              console.warn('[StellarMap2D] Error fetching completion statuses:', completionError);
            } else {
              setCompletionMap(completions || new Map());
            }
          }
        }
      } catch (err) {
        console.error('Error loading stellar map data:', err);
        setError(err.message || 'Failed to load stellar map data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentCore, visibilityData.userXP, user?.id]);

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

    // Add to history
    addToHistory(nodeData);

    // Update breadcrumb
    setSelectedNode(nodeData);
    if (nodeData.constellationAlias) {
      setSelectedConstellation(nodeData.constellationAlias);
    }
    if (nodeData.familyAlias) {
      setSelectedFamily(nodeData.familyAlias);
    }

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
      
      // Refresh completion status for the completed node
      if (youtubeModal.nodeData?.id) {
        const { data: completions } = await stellarMapService.getBulkCompletionStatus(
          user.id,
          [youtubeModal.nodeData.id]
        );
        if (completions) {
          setCompletionMap(prev => {
            const newMap = new Map(prev);
            completions.forEach((value, key) => {
              newMap.set(key, value);
            });
            return newMap;
          });
        }
      }
    }
  };

  // Export/Share functionality
  const handleExportImage = async () => {
    try {
      const svgElement = document.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.download = `stellar-map-${currentCore}-${Date.now()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(url);
        });
      };

      img.src = url;
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?core=${currentCore}`;
    if (navigator.share) {
      navigator.share({
        title: `Stellar Map - ${currentCore}`,
        text: `Check out my progress on the ${currentCore} core!`,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
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
            completionMap={completionMap}
            highlightedNodeIds={highlightedNodeIds}
            bookmarkedNodeIds={bookmarkedNodes}
          />
        </div>

        {/* Loading Overlay with Skeleton */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground mb-6">Loading Stellar Map...</p>
              
              {/* Skeleton Structure */}
              <div className="relative w-96 h-96 mx-auto opacity-30">
                <svg viewBox="0 0 1000 1000" className="w-full h-full">
                  {/* Skeleton center */}
                  <circle cx="500" cy="500" r="25" fill="currentColor" className="text-primary animate-pulse" />
                  
                  {/* Skeleton rings */}
                  <circle cx="500" cy="500" r="150" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/50" />
                  <circle cx="500" cy="500" r="300" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary/50" />
                  <circle cx="500" cy="500" r="450" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/50" />
                  
                  {/* Skeleton nodes */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = 150;
                    const x = 500 + Math.cos(angle) * radius;
                    const y = 500 + Math.sin(angle) * radius;
                    return (
                      <circle
                        key={`skeleton-family-${i}`}
                        cx={x}
                        cy={y}
                        r="35"
                        fill="currentColor"
                        className="text-primary animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    );
                  })}
                  
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    const radius = 300;
                    const x = 500 + Math.cos(angle) * radius;
                    const y = 500 + Math.sin(angle) * radius;
                    return (
                      <circle
                        key={`skeleton-constellation-${i}`}
                        cx={x}
                        cy={y}
                        r="22"
                        fill="currentColor"
                        className="text-secondary animate-pulse"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      />
                    );
                  })}
                  
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * Math.PI * 2;
                    const radius = 450;
                    const x = 500 + Math.cos(angle) * radius;
                    const y = 500 + Math.sin(angle) * radius;
                    return (
                      <circle
                        key={`skeleton-node-${i}`}
                        cx={x}
                        cy={y}
                        r="12"
                        fill="currentColor"
                        className="text-info animate-pulse"
                        style={{ animationDelay: `${i * 0.03}s` }}
                      />
                    );
                  })}
                </svg>
              </div>
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

        {/* Search and Filter */}
        <StellarMapSearch
          hierarchyData={hierarchyData}
          completionMap={completionMap}
          onNodeSelect={(node) => {
            // Center view on selected node and highlight it
            setHoveredNodeId(node.id);
            setHighlightedNodeIds(new Set([node.id]));
            // Could add zoom/pan to node here
          }}
          onFilterChange={(filters, filteredNodes) => {
            // Highlight filtered nodes
            setHighlightedNodeIds(new Set(filteredNodes.map(n => n.id)));
          }}
          visible={searchVisible}
        />

        {/* Search Toggle Button */}
        <button
          onClick={() => setSearchVisible(!searchVisible)}
          className="absolute top-4 left-4 z-40 p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
          title="Search and Filter"
          style={{ display: searchVisible ? 'none' : 'block' }}
        >
          <Search size={18} />
        </button>

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
          completionMap={completionMap}
          isBookmarked={tooltipData.node ? bookmarkedNodes.has(tooltipData.node.id) : false}
          onToggleBookmark={toggleBookmark}
        />

        {/* YouTube Player Modal */}
        <YouTubePlayerModal
          isOpen={youtubeModal.isOpen}
          onClose={handleYoutubeModalClose}
          nodeData={youtubeModal.nodeData}
          videoId={youtubeModal.videoId}
          onComplete={handleVideoComplete}
        />

        {/* Legend */}
        <StellarMapLegend />

        {/* Breadcrumb Navigation */}
        <StellarMapBreadcrumb
          currentCore={currentCore}
          selectedFamily={selectedFamily}
          selectedConstellation={selectedConstellation}
          selectedNode={selectedNode}
          onNavigate={(type, data) => {
            if (type === 'core') {
              setSelectedFamily(null);
              setSelectedConstellation(null);
              setSelectedNode(null);
            } else if (type === 'family') {
              setSelectedFamily(data);
              setSelectedConstellation(null);
              setSelectedNode(null);
            } else if (type === 'constellation') {
              setSelectedConstellation(data);
              setSelectedNode(null);
            } else if (type === 'node') {
              setSelectedNode(data);
            }
          }}
        />

        {/* Analytics Panel */}
        <StellarMapAnalytics
          hierarchyData={hierarchyData}
          completionMap={completionMap}
          currentCore={currentCore}
          userXP={visibilityData.userXP}
          visible={analyticsVisible}
          onClose={() => setAnalyticsVisible(false)}
        />

        {/* Analytics Toggle Button */}
        <button
          onClick={() => setAnalyticsVisible(!analyticsVisible)}
          className="fixed top-20 right-4 z-40 p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
          title="Show Analytics"
        >
          <BarChart3 size={18} />
        </button>

        {/* Settings Toggle Button */}
        <button
          onClick={() => setSettingsVisible(!settingsVisible)}
          className="fixed top-32 right-4 z-40 p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
          title="View Settings"
        >
          <Settings size={18} />
        </button>

        {/* Settings Panel */}
        <StellarMapSettings
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          settings={viewSettings}
          onSettingsChange={setViewSettings}
        />

        {/* Export/Share Buttons */}
        <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2">
          <button
            onClick={handleExportImage}
            className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
            title="Export as Image"
            aria-label="Export map as image"
          >
            <Download size={18} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
            title="Share Map"
            aria-label="Share map link"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </StellarMapErrorBoundary>
  );
};

export default StellarMap2DPage;
