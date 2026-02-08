import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Navigation Component
 */
const StellarMapBreadcrumb = ({
  currentCore,
  selectedFamily,
  selectedConstellation,
  selectedNode,
  onNavigate
}) => {
  const breadcrumbs = [
    { label: currentCore || 'Stellar Map', type: 'core', data: currentCore },
    selectedFamily && { label: typeof selectedFamily === 'string' ? selectedFamily : selectedFamily?.name, type: 'family', data: selectedFamily },
    selectedConstellation && { label: typeof selectedConstellation === 'string' ? selectedConstellation : selectedConstellation?.name, type: 'constellation', data: { constellation: selectedConstellation, family: selectedFamily } },
    selectedNode && { label: selectedNode.title || selectedNode?.id, type: 'node', data: selectedNode }
  ].filter(Boolean);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      className="fixed top-16 left-4 z-40 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 px-3 py-2 flex items-center gap-1 text-sm"
      aria-label="Breadcrumb navigation"
    >
      <button
        onClick={() => onNavigate && onNavigate('core', currentCore)}
        className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
        aria-label="Go to core"
      >
        <Home size={14} />
        <span>{currentCore}</span>
      </button>
      
      {breadcrumbs.slice(1).map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-white/40" />
          <button
            onClick={() => onNavigate && onNavigate(crumb.type, crumb.data)}
            className="text-white/80 hover:text-white transition-colors truncate max-w-[120px]"
            aria-label={`Go to ${crumb.label}`}
          >
            {crumb.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default StellarMapBreadcrumb;

