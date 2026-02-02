import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Providers from './solar/Providers';
import SolarSystem from './solar/components/SolarSystem';

/**
 * Stellar Map page.
 * Renders the full solar system from greengem/threejs-solar-system (ref repo).
 * Next step: adapt data/UX to stellar map nodes/constellations.
 */
export default function StellarMap() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="fixed top-4 right-4 z-[100] w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        aria-label="Retour"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="absolute inset-0 w-full h-full">
        <Providers>
          <SolarSystem />
        </Providers>
      </div>
    </div>
  );
}
