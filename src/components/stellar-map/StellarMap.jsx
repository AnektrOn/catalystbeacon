import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Providers from './solar/Providers';
import SolarSystem from './solar/components/SolarSystem';
import LevelSelector, { getLastVisitedLevel } from './LevelSelector';

/**
 * Stellar Map page.
 * Level must be selected before entering the canvas. Last visited level is used as default.
 */
export default function StellarMap() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(null);

  const showLevelSelector = selectedLevel === null;

  return (
    <div className="w-full h-full min-h-0 flex-1 overflow-hidden bg-black relative">
      {showLevelSelector ? (
        <LevelSelector
          defaultLevel={getLastVisitedLevel()}
          onSelectLevel={setSelectedLevel}
        />
      ) : (
        <>
          <div className="absolute inset-0 w-full h-full z-0">
            <Providers>
              <SolarSystem level={selectedLevel} />
            </Providers>
          </div>
          <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedLevel(null)}
              className="px-3 py-2 rounded-lg bg-white/10 text-white/90 text-sm hover:bg-white/20 transition-colors"
            >
              Changer de niveau
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
