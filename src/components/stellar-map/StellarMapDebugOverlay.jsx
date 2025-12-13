import React from 'react';
import { Info } from 'lucide-react';

/**
 * Debug overlay component for Stellar Map
 * Shows useful debugging information in development mode
 */
const StellarMapDebugOverlay = ({
  currentCore,
  userXP,
  visibilityGroup,
  nodeCount,
  familyCount,
  constellationCount,
  fps,
  sceneInfo
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4" />
        <span className="font-semibold">Debug Info</span>
      </div>
      <div className="space-y-1">
        <div><span className="text-gray-400">Core:</span> {currentCore}</div>
        <div><span className="text-gray-400">User XP:</span> {userXP !== null && userXP !== undefined ? userXP.toLocaleString() : 'Loading...'}</div>
        <div><span className="text-gray-400">Visibility:</span> {visibilityGroup}</div>
        <div><span className="text-gray-400">Nodes:</span> {nodeCount}</div>
        <div><span className="text-gray-400">Families:</span> {familyCount}</div>
        <div><span className="text-gray-400">Constellations:</span> {constellationCount}</div>
        {fps && <div><span className="text-gray-400">FPS:</span> {fps}</div>}
        {sceneInfo && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-gray-400">Scene Objects:</div>
            <div className="pl-2">
              <div>Total: {sceneInfo.total}</div>
              <div>Meshes: {sceneInfo.meshes}</div>
              <div>Lines: {sceneInfo.lines}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StellarMapDebugOverlay;
