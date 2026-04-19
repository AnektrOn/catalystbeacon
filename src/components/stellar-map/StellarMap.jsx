import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import Providers from './solar/Providers';
import LevelSelector, { getLastVisitedLevel } from './LevelSelector';
import ControlMenu from './solar/components/ui/ControlMenu/ControlMenu';
import SpeedControl from './solar/components/ui/SpeedControl';

const SolarSystem = lazy(() => import('./solar/components/SolarSystem'));

/**
 * Stellar Map page.
 * Level must be selected before entering the canvas. Last visited level is used as default.
 */
export default function StellarMap() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const showLevelSelector = selectedLevel === null;

  return (
    <div className="w-full h-full min-h-0 flex-1 overflow-hidden bg-black relative">
      {showLevelSelector ? (
        <LevelSelector
          defaultLevel={getLastVisitedLevel()}
          onSelectLevel={setSelectedLevel}
        />
      ) : (
        <Providers>
          <>
            <div className="absolute inset-0 w-full h-full z-0 min-h-[60vh] md:min-h-[80vh] lg:min-h-[90vh]">
              <Suspense fallback={<div className="w-full h-full bg-black" />}>
                <SolarSystem
                  level={selectedLevel}
                  onExitLevel={() => setSelectedLevel(null)}
                  onNavigateDashboard={() => navigate('/dashboard')}
                  setDrawerOpen={setDrawerOpen}
                />
              </Suspense>
            </div>
            {drawerOpen && (
              <>
                <button
                  type="button"
                  className="absolute inset-0 z-[60] bg-black/60 border-0 p-0 cursor-default"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fermer le menu"
                />
                <aside className="absolute top-0 left-0 bottom-0 w-72 z-[60] bg-black/95 border-r border-white/10 p-4 flex flex-col gap-4 overflow-y-auto">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      className="w-8 h-8 rounded-lg text-white/90 hover:bg-white/10 text-lg leading-none"
                      aria-label="Fermer"
                    >
                      ×
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/dashboard');
                      setDrawerOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 text-white/90 text-sm border border-white/15 hover:bg-white/15 text-left"
                  >
                    ← Tableau de bord
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLevel(null);
                      setDrawerOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 text-white/90 text-sm border border-white/15 hover:bg-white/15 text-left"
                  >
                    Changer de niveau
                  </button>
                  <ControlMenu variant="drawer" />
                  <SpeedControl variant="drawer" />
                </aside>
              </>
            )}
          </>
        </Providers>
      )}
    </div>
  );
}
