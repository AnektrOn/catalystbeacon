import React, { useState } from 'react';
import { Info, X, Eye } from 'lucide-react';

/**
 * Legend and Information Panel for Stellar Map
 */
const StellarMapLegend = ({ visible = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(visible);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-2 rounded-md bg-black/80 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/30"
        title="Show Legend"
        aria-label="Show legend and information"
      >
        <Info size={18} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 p-4 shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Eye size={18} />
          Legend & Information
        </h3>
        <button
          onClick={() => {
            setIsOpen(false);
            if (onClose) onClose();
          }}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Close legend"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Node Types */}
        <div>
          <h4 className="text-white/90 font-medium mb-2">Node Types</h4>
          <div className="space-y-2 text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary-light"></div>
              <span>Core Node (Family)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-secondary border-2 border-secondary-light"></div>
              <span>Constellation Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Subnode (Difficulty 0-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Subnode (Difficulty 3-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Subnode (Difficulty 6-8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Subnode (Difficulty 9-10)</span>
            </div>
          </div>
        </div>

        {/* Completion Status */}
        <div>
          <h4 className="text-white/90 font-medium mb-2">Completion Status</h4>
          <div className="space-y-2 text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-400 relative">
                <span className="absolute -top-0.5 -right-0.5 text-[8px] text-white">✓</span>
              </div>
              <span>Completed Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-400"></div>
              <span>Incomplete Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-green-400 bg-green-500/50"></div>
              <span>Progress Ring (Constellation)</span>
            </div>
          </div>
        </div>

        {/* Difficulty Orbits */}
        <div>
          <h4 className="text-white/90 font-medium mb-2">Difficulty Orbits</h4>
          <div className="space-y-1 text-white/70 text-xs">
            <div>• Nodes are organized in orbital rings by difficulty</div>
            <div>• <strong>Difficulty 0:</strong> Inner orbit (closest)</div>
            <div>• <strong>Difficulty 5:</strong> Middle orbit</div>
            <div>• <strong>Difficulty 10:</strong> Outer orbit (furthest)</div>
            <div>• Higher difficulty = further from constellation core</div>
          </div>
        </div>

        {/* Interactions */}
        <div>
          <h4 className="text-white/90 font-medium mb-2">Interactions</h4>
          <div className="space-y-1 text-white/70 text-xs">
            <div>• <strong>Click:</strong> Open node content</div>
            <div>• <strong>Hover:</strong> Show tooltip</div>
            <div>• <strong>Drag:</strong> Pan map</div>
            <div>• <strong>Scroll/Wheel:</strong> Zoom (if enabled)</div>
            <div>• <strong>Arrow Keys:</strong> Pan</div>
            <div>• <strong>+/-:</strong> Zoom in/out</div>
            <div>• <strong>Shift+0:</strong> Reset view</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StellarMapLegend;

