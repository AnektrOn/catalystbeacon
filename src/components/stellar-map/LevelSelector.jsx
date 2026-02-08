import React from 'react';
import { Sparkles } from 'lucide-react';

const STELLAR_MAP_LAST_LEVEL_KEY = 'stellar_map_last_level';

export const STELLAR_LEVELS = ['Ignition', 'Insight', 'Transformation'];

export function getLastVisitedLevel() {
  try {
    const stored = localStorage.getItem(STELLAR_MAP_LAST_LEVEL_KEY);
    if (stored && STELLAR_LEVELS.includes(stored)) return stored;
  } catch (_) {}
  return 'Ignition';
}

export function setLastVisitedLevel(level) {
  try {
    localStorage.setItem(STELLAR_MAP_LAST_LEVEL_KEY, level);
  } catch (_) {}
}

/**
 * Level selector shown before entering the Stellar Map canvas.
 * User picks a core level; selection is persisted as "last visited".
 */
export default function LevelSelector({ onSelectLevel, defaultLevel }) {
  const [selected, setSelected] = React.useState(defaultLevel || getLastVisitedLevel());

  const handleEnter = () => {
    setLastVisitedLevel(selected);
    onSelectLevel(selected);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-10 p-6">
      <div className="flex items-center gap-2 mb-8 text-white/90">
        <Sparkles className="w-8 h-8" />
        <h1 className="text-2xl font-semibold tracking-tight">Stellar Map</h1>
      </div>
      <p className="text-white/70 text-sm mb-6">Choisis un niveau pour entrer dans la carte</p>
      <div className="flex flex-wrap gap-4 justify-center max-w-md">
        {STELLAR_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setSelected(level)}
            className={`px-6 py-4 rounded-xl border-2 transition-all min-w-[140px] ${
              selected === level
                ? 'border-amber-400/80 bg-amber-500/20 text-white'
                : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleEnter}
        className="mt-8 px-8 py-3 rounded-xl bg-amber-500/90 text-black font-medium hover:bg-amber-400 transition-colors"
      >
        Entrer dans la carte
      </button>
    </div>
  );
}
