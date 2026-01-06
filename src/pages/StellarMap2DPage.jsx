import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useXPVisibility } from '../components/stellar-map/hooks/useXPVisibility';
import stellarMapService from '../services/stellarMapService';
import StellarMapControls from '../components/stellar-map/StellarMapControls';
import NodeTooltip from '../components/stellar-map/NodeTooltip';
import StellarMap2D from '../components/stellar-map/StellarMap2D';
import YouTubePlayerModal from '../components/stellar-map/YouTubePlayerModal';
import StellarMapErrorBoundary from '../components/stellar-map/StellarMapErrorBoundary';
import { ZoomOut } from 'lucide-react';

const StellarMap2DPage = () => {
  const [currentCore, setCurrentCore] = useState('Ignition');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchyData, setHierarchyData] = useState({});
  const [completionMap, setCompletionMap] = useState(new Map());
  const [tooltipData, setTooltipData] = useState({ visible: false, node: null, position: { x: 0, y: 0 } });
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [youtubeModal, setYoutubeModal] = useState({ isOpen: false, nodeData: null, videoId: null });
  const [highlightedNodeIds, setHighlightedNodeIds] = useState(new Set());
  const [bookmarkedNodes, setBookmarkedNodes] = useState(new Set());
  const [nodeHistory, setNodeHistory] = useState([]);
  const stellarMap2DRef = useRef(null);

  const { user, fetchProfile } = useAuth();
  const visibilityData = useXPVisibility();

  // Minimal UI: per product requirement, keep only the Zoom Out button (no extra right-side panels/buttons).
  const minimalUI = true;
  const handleCoreChange = (core) => {
    setCurrentCore(core);
  };

  const subnodeOptions = useMemo(() => {
    const options = [];
    const seenTitles = new Set();
    Object.values(hierarchyData).forEach((family) => {
      Object.values(family).forEach((nodes) => {
        nodes.forEach((node) => {
          const title = (node?.title || node?.name || '').toString().trim();
          if (!title || seenTitles.has(title)) return;
          seenTitles.add(title);
          options.push({ title });
        });
      });
    });
    return options;
  }, [hierarchyData]);

  const constellationOptions = useMemo(() => {
    const options = [];
    const seen = new Set();
    Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
      Object.keys(constellations).forEach((constellationName) => {
        const key = `${familyName}|${constellationName}`;
        if (seen.has(key)) return;
        seen.add(key);
        options.push({
          familyAlias: familyName,
          constellationAlias: constellationName,
          displayName: `${familyName} / ${constellationName}`,
        });
      });
    });
    return options;
  }, [hierarchyData]);

  const findNodeByTitle = (title) => {
    const normalized = (title || '').toString().trim();
    if (!normalized) return null;
    for (const family of Object.values(hierarchyData)) {
      for (const nodes of Object.values(family)) {
        const found = nodes.find((n) => ((n?.title || n?.name || '').toString().trim() === normalized));
        if (found) return found;
      }
    }
    return null;
  };

  const handleSubnodeSelect = (title) => {
    const node = findNodeByTitle(title);
    if (!node?.id) return;
    setHighlightedNodeIds(new Set([node.id]));
  };

  const handleConstellationSelect = () => {
    // Minimal UI: focusing constellations is optional. Kept as no-op for now.
  };

  const handleOpenNode = (title) => {
    const node = findNodeByTitle(title);
    if (!node) {
      console.warn('Could not find node in hierarchyData:', title);
      return;
    }
    console.log('[StellarMap2DPage] Open node', {
      title,
      id: node.id,
      link: node.link,
    });
    handleNodeClick(node);
  };

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

  // Note: core/constellation/subnode selectors are intentionally removed in minimal UI mode.

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
            ref={stellarMap2DRef}
            hierarchyData={hierarchyData}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            hoveredNodeId={hoveredNodeId}
            currentCore={currentCore}
            completionMap={completionMap}
            highlightedNodeIds={highlightedNodeIds}
            bookmarkedNodeIds={bookmarkedNodes}
            showZoomControls={false}
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

        {/* Minimal UI: keep map + node interactions only */}
        {/* Left/bottom menu for picking nodes (not on the right side) */}
        {minimalUI && (
          <StellarMapControls
            currentCore={currentCore}
            onCoreChange={handleCoreChange}
            constellations={constellationOptions}
            subnodes={subnodeOptions}
            onConstellationSelect={handleConstellationSelect}
            onSubnodeSelect={handleSubnodeSelect}
            onOpenNode={handleOpenNode}
            showWhiteLines={false}
            onToggleWhiteLines={() => {}}
          />
        )}

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

        {/* (Legend / Analytics / Settings / Search / Breadcrumb intentionally removed in minimal UI mode) */}

        {/* Zoom Out Button Only */}
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={() => {
              // Reset view to full-map bounds
              if (stellarMap2DRef.current && typeof stellarMap2DRef.current.resetView === 'function') {
                stellarMap2DRef.current.resetView();
              } else if (stellarMap2DRef.current && typeof stellarMap2DRef.current.zoomOut === 'function') {
                stellarMap2DRef.current.zoomOut();
              } else {
                // Fallback: Reset view to default zoom via SVG
                const svgElement = document.querySelector('svg');
                if (svgElement) {
                  svgElement.setAttribute('viewBox', '0 0 1000 1000');
                }
              }
            }}
            className="p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Zoom Out"
            aria-label="Zoom out to full view"
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </StellarMapErrorBoundary>
  );
};

export default StellarMap2DPage;
