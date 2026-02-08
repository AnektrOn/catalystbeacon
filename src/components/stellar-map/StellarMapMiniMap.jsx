import React, { useMemo } from 'react';
import { Minimize2, Maximize2, Map } from 'lucide-react';

/**
 * Mini-Map Overview Component. Collapsible: when collapsed shows only a toggle button.
 */
const StellarMapMiniMap = ({
  layout,
  viewBox,
  onViewportClick,
  visible = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const viewportRect = useMemo(() => {
    if (!viewBox || !layout?.bounds) return null;
    const mapWidth = Math.abs(layout.bounds.maxX - layout.bounds.minX) || 1000;
    const mapHeight = Math.abs(layout.bounds.maxY - layout.bounds.minY) || 1000;
    const offsetX = layout.bounds.minX || 0;
    const offsetY = layout.bounds.minY || 0;
    
    const x = ((viewBox.x - offsetX) / mapWidth) * (isExpanded ? 300 : 150);
    const y = ((viewBox.y - offsetY) / mapHeight) * (isExpanded ? 300 : 150);
    const width = (viewBox.width / mapWidth) * (isExpanded ? 300 : 150);
    const height = (viewBox.height / mapHeight) * (isExpanded ? 300 : 150);
    
    return { x, y, width, height };
  }, [viewBox, layout?.bounds, isExpanded]);

  if (!visible) return null;

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 rounded-lg bg-black/90 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Afficher la mini-carte"
        >
          <Map size={18} />
        </button>
      </div>
    );
  }

  if (!layout?.families?.length) {
    return (
      <div className="fixed bottom-4 left-4 z-40 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-xs">Overview</span>
          <button type="button" onClick={() => setIsCollapsed(true)} className="text-white/60 hover:text-white">
            <Minimize2 size={14} />
          </button>
        </div>
        <p className="text-white/50 text-xs mt-1">Chargement…</p>
      </div>
    );
  }

  const size = isExpanded ? 300 : 150;

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg transition-all ${
        isExpanded ? 'p-4' : 'p-2'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-xs font-medium">Overview</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Replier la mini-carte"
          >
            <span className="text-xs">×</span>
          </button>
        </div>
      </div>

      <svg
        width={size}
        height={size}
        viewBox={`${layout.bounds.minX} ${layout.bounds.minY} ${Math.abs(layout.bounds.maxX - layout.bounds.minX) || 1000} ${Math.abs(layout.bounds.maxY - layout.bounds.minY) || 1000}`}
        className="border border-white/20 rounded"
        onClick={(e) => {
          if (onViewportClick && e.target === e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * (layout.bounds.maxX - layout.bounds.minX) + layout.bounds.minX;
            const y = ((e.clientY - rect.top) / rect.height) * (layout.bounds.maxY - layout.bounds.minY) + layout.bounds.minY;
            onViewportClick(x, y);
          }
        }}
      >
        {/* Render simplified nodes */}
        {layout.families.map((family) => (
          <g key={family.name}>
            <circle
              cx={family.x}
              cy={family.y}
              r="8"
              fill="#B4833D"
              opacity="0.8"
            />
            {family.constellations.map((constellation) => (
              <g key={constellation.name}>
                <circle
                  cx={constellation.x}
                  cy={constellation.y}
                  r="5"
                  fill="#81754B"
                  opacity="0.7"
                />
                {constellation.nodes.map((node) => (
                  <circle
                    key={node.id}
                    cx={node.x}
                    cy={node.y}
                    r="2"
                    fill="#3B82F6"
                    opacity="0.6"
                  />
                ))}
              </g>
            ))}
          </g>
        ))}

        {/* Viewport indicator */}
        {viewportRect && (
          <rect
            x={viewportRect.x}
            y={viewportRect.y}
            width={viewportRect.width}
            height={viewportRect.height}
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            opacity="0.8"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>
    </div>
  );
};

export default StellarMapMiniMap;

