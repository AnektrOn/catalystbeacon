import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * Control panel component for Stellar Map
 */
const StellarMapControls = ({
  currentCore,
  onCoreChange,
  constellations = [],
  subnodes = [],
  onConstellationSelect,
  onSubnodeSelect,
  showWhiteLines,
  onToggleWhiteLines
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const burgerRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [isOpen]);

  const cores = ['Ignition', 'Insight', 'Transformation'];

  return (
    <>
      {/* Hamburger Button */}
      <button
        ref={burgerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 w-11 h-11 rounded-md bg-black/55 text-white shadow-lg hover:bg-white/18 transition-all duration-250 flex items-center justify-center"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Control Panel */}
      <div
        id="stellar-map-controls-panel"
        ref={panelRef}
        className={`fixed top-4 left-12 z-40 bg-black/60 p-2 rounded-md shadow-lg transition-all duration-350 ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'
        }`}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-120%)'
        }}
      >
        {/* Core Selector Buttons */}
        <div className="flex flex-wrap gap-1 mb-2" role="tablist" aria-label="Core selector">
          {cores.map((core) => (
            <button
              key={core}
              onClick={() => {
                onCoreChange(core); // Keep capitalized - database expects "Insight", "Transformation", etc.
                setIsOpen(false);
              }}
              role="tab"
              aria-selected={currentCore === core || currentCore === core.toLowerCase()}
              aria-controls={`core-${core.toLowerCase()}3D`}
              className={`px-4 py-2 text-sm rounded border transition-all ${
                currentCore === core || currentCore === core.toLowerCase()
                  ? 'bg-white/20 border-white/50 text-white'
                  : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
              }`}
            >
              {core}
            </button>
          ))}
        </div>

        {/* Constellation Picker */}
        <div className="mb-2">
          <label htmlFor="constellation-picker" className="block text-xs text-white/80 mb-1">
            Focus:
          </label>
          <select
            id="constellation-picker"
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                const [familyAlias, constellationAlias] = value.split('|');
                onConstellationSelect(familyAlias, constellationAlias);
              }
            }}
            aria-label="Select constellation to focus on"
            className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/30 rounded text-white appearance-none bg-gradient-to-br from-white/10 to-white/5 pr-8 focus:border-white/60 focus:outline-none"
            defaultValue=""
          >
            <option value="">– Select constellation –</option>
            {Array.isArray(constellations) && constellations
              .filter(constellation => constellation != null) // Filter out null/undefined
              .map((constellation, index) => {
                // Handle both old format (with familyAlias/constellationAlias) and new format (with value/label)
                const familyAlias = constellation?.familyAlias || constellation?.familyName || '';
                const constellationAlias = constellation?.constellationAlias || constellation?.value || constellation?.label || '';
                const displayName = constellation?.displayName || constellation?.label || constellation?.value || `${familyAlias} / ${constellationAlias}`;
                
                // Generate unique key - always include index to ensure uniqueness, sanitize to avoid special chars
                const safeFamilyAlias = String(familyAlias || '').replace(/[|]/g, '_');
                const safeConstellationAlias = String(constellationAlias || '').replace(/[|]/g, '_');
                let key;
                if (safeFamilyAlias && safeConstellationAlias) {
                  key = `constellation-${safeFamilyAlias}-${safeConstellationAlias}-${index}`;
                } else if (constellation?.value) {
                  key = `constellation-${String(constellation.value).replace(/[|]/g, '_')}-${index}`;
                } else if (constellation?.id) {
                  key = `constellation-${String(constellation.id)}-${index}`;
                } else {
                  key = `constellation-${index}`;
                }
                
                // Generate value for the option
                const value = safeFamilyAlias && safeConstellationAlias 
                  ? `${safeFamilyAlias}|${safeConstellationAlias}` 
                  : constellation?.value || safeConstellationAlias || `option-${index}`;

                return (
                  <option
                    key={key}
                    value={value}
                    className="bg-black text-white"
                  >
                    {displayName || `Constellation ${index + 1}`}
                  </option>
                );
              })}
          </select>
        </div>

        {/* Toggle White Lines Button */}
        <button
          onClick={onToggleWhiteLines}
          aria-label={showWhiteLines ? 'Hide white connection lines' : 'Show white connection lines'}
          className="w-full px-4 py-2 text-sm rounded border bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all mb-2"
        >
          {showWhiteLines ? 'Hide white links' : 'Show white links'}
        </button>

        {/* Subnode Picker */}
        <div>
          <label htmlFor="subnode-picker" className="block text-xs text-white/80 mb-1">
            Sub-node:
          </label>
          <select
            id="subnode-picker"
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                onSubnodeSelect(value);
              }
            }}
            aria-label="Select sub-node to focus on"
            className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/30 rounded text-white appearance-none bg-gradient-to-br from-white/10 to-white/5 pr-8 focus:border-white/60 focus:outline-none"
            defaultValue=""
          >
            <option value="">– Select sub-node –</option>
            {subnodes
              .filter(node => node != null) // Filter out null/undefined
              .map((node, index) => {
                // Ensure unique key - use node.id if available, otherwise use index
                const key = node.id ? `subnode-${node.id}` : `subnode-${index}`;
                const value = node.id || node.value || `subnode-${index}`;
                const title = node.title || node.label || `Subnode ${index + 1}`;
                
                return (
                  <option key={key} value={value} className="bg-black text-white">
                    {title}
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Mobile Styles */}
      <style>{`
        @media (max-width: 600px) {
          #stellar-map-controls-panel {
            top: auto !important;
            bottom: 16px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 92vw !important;
            padding: 10px 6px 12px !important;
            border-radius: 10px !important;
          }
          
          #stellar-map-controls-panel button,
          #stellar-map-controls-panel select {
            display: block !important;
            width: 100% !important;
            margin: 6px 0 !important;
            font-size: 16px !important;
            padding: 12px 0 !important;
            min-height: 44px !important;
          }
        }
      `}</style>
    </>
  );
};

export default StellarMapControls;
