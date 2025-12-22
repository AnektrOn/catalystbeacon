import React, { useState } from 'react';
import { Settings, X, Eye, EyeOff, Layers } from 'lucide-react';

/**
 * Customizable View Settings Panel
 */
const StellarMapSettings = ({
  visible = false,
  onClose,
  settings = {},
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState({
    showNodeLabels: true,
    showConnectionLines: true,
    connectionLineOpacity: 0.4,
    showDecorativeElements: true,
    ...settings
  });

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-40 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 p-4 shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Settings size={18} />
          View Settings
        </h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Node Labels Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90">
            {localSettings.showNodeLabels ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>Show Node Labels</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.showNodeLabels}
              onChange={(e) => handleSettingChange('showNodeLabels', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Connection Lines Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90">
            <Layers size={16} />
            <span>Show Connection Lines</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.showConnectionLines}
              onChange={(e) => handleSettingChange('showConnectionLines', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Connection Line Opacity */}
        {localSettings.showConnectionLines && (
          <div>
            <label className="block text-white/90 mb-2">
              Connection Line Opacity: {Math.round(localSettings.connectionLineOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.connectionLineOpacity}
              onChange={(e) => handleSettingChange('connectionLineOpacity', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Decorative Elements Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90">
            <Layers size={16} />
            <span>Show Decorative Elements</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.showDecorativeElements}
              onChange={(e) => handleSettingChange('showDecorativeElements', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default StellarMapSettings;

