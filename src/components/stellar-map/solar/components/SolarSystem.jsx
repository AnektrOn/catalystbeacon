import { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import stellarMapService from '../../stellarMapService';
import { buildNodesWithOrbits } from '../utils/nodesWithOrbits';
import SceneBackground from './SceneBackground';
import Sun from './celestial/Sun';
import Node from './celestial/Node';
import CameraController from './motion/CameraController';
import NodesUpdater from './motion/NodesUpdater';
import NodeMenu from './ui/NodeMenu';
import SpeedControl from './ui/SpeedControl';
import NodeDetail from './ui/NodeDetail';
import ControlMenu from './ui/ControlMenu/ControlMenu';
import SceneLighting from './SceneLighting';
import IntroText from './ui/IntroText';

const DEFAULT_LEVEL = 'Ignition';

export default function SolarSystem() {
  const [nodesWithOrbits, setNodesWithOrbits] = useState([]);
  const [orbitProgressByDifficulty, setOrbitProgressByDifficulty] = useState({});
  const [loading, setLoading] = useState(true);

  const difficultyKeys = useMemo(() => {
    const set = new Set(nodesWithOrbits.map((item) => item.difficulty));
    return Array.from(set);
  }, [nodesWithOrbits]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: grouped, error } = await stellarMapService.getNodesGroupedByHierarchy(DEFAULT_LEVEL, 0);
        if (cancelled) return;
        if (error || !grouped) {
          setNodesWithOrbits([]);
          return;
        }
        const list = buildNodesWithOrbits(grouped);
        setNodesWithOrbits(list);
        setOrbitProgressByDifficulty((prev) => {
          const next = { ...prev };
          list.forEach(({ difficulty }) => {
            if (next[difficulty] == null) next[difficulty] = 0;
          });
          return next;
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 35, 55], fov: 50 }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <CameraController />
            <SceneBackground texturePath="/images/background/stars_8k.webp" />
            <SceneLighting />
            <Sun position={[0, 0, 0]} radius={1} />
            {nodesWithOrbits.map(({ node, orbitRadius, angleOffset, difficulty, showOrbitRing }) => (
              <Node
                key={node.id}
                node={node}
                orbitRadius={orbitRadius}
                angleOffset={angleOffset}
                orbitProgress={orbitProgressByDifficulty[difficulty] ?? 0}
                showOrbitRing={showOrbitRing}
              />
            ))}
            <NodesUpdater
              setOrbitProgressByDifficulty={setOrbitProgressByDifficulty}
              difficultyKeys={difficultyKeys}
            />
          </Suspense>
        </Canvas>
      </div>
      <NodeMenu nodesWithOrbits={nodesWithOrbits} />
      <SpeedControl />
      <AnimatePresence>
        <NodeDetail />
      </AnimatePresence>
      <ControlMenu />
      <IntroText />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
          <span className="text-white/80 text-sm">Chargement des nodes…</span>
        </div>
      )}
    </>
  );
}
