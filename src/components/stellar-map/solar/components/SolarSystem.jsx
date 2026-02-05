import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import stellarMapService from '../../stellarMapService';
import { buildStellarHierarchy } from '../utils/stellarHierarchy';
import SceneBackground from './SceneBackground';
import Sun from './celestial/Sun';
import FamilyOrbit from './celestial/FamilyOrbit';
import CameraController from './motion/CameraController';
import NodeMenu from './ui/NodeMenu';
import SpeedControl from './ui/SpeedControl';
import NodeDetail from './ui/NodeDetail';
import ControlMenu from './ui/ControlMenu/ControlMenu';
import SceneLighting from './SceneLighting';
import IntroText from './ui/IntroText';

const DEFAULT_LEVEL = 'Ignition';

export default function SolarSystem() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: grouped, error } = await stellarMapService.getNodesGroupedByHierarchy(DEFAULT_LEVEL, 0);
        if (cancelled) return;
        if (error || !grouped) {
          setFamilies([]);
          return;
        }
        const hierarchy = buildStellarHierarchy(grouped);
        setFamilies(hierarchy);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Extract all nodes for NodeMenu (flat list for compatibility)
  const allNodesFlat = families.flatMap(family => 
    family.constellations.flatMap(constellation => 
      constellation.nodes.map(node => ({
        node,
        familyName: family.name,
        constellationName: constellation.name
      }))
    )
  );

  return (
    <>
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 50, 80], fov: 60 }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <CameraController />
            <SceneBackground texturePath="/images/background/stars_8k.webp" />
            <SceneLighting />
            
            {/* Central Sun/Nucleus */}
            <Sun position={[0, 0, 0]} radius={1.5} />
            
            {/* Render hierarchical structure: Families > Constellations > Nodes */}
            {families.map((family) => (
              <FamilyOrbit
                key={`family-${family.name}-${family.index}`}
                family={family}
                totalFamilies={families.length}
              />
            ))}
          </Suspense>
        </Canvas>
      </div>
      <NodeMenu nodesWithOrbits={allNodesFlat} />
      <SpeedControl />
      <AnimatePresence>
        <NodeDetail />
      </AnimatePresence>
      <ControlMenu />
      <IntroText />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
          <span className="text-white/80 text-sm">Chargement de la carte stellaire…</span>
        </div>
      )}
    </>
  );
}
