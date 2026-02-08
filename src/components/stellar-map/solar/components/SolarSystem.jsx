import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import stellarMapService from '../../stellarMapService';
import { buildStellarHierarchy } from '../utils/stellarHierarchy';
import { useAuth } from '../../../../contexts/AuthContext';
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
import StellarMapProgressionPanel from '../../StellarMapProgressionPanel';
import StellarMapFamilyConstellationSearch from '../../StellarMapFamilyConstellationSearch';
import StellarMapMiniMapWrapper from '../../StellarMapMiniMapWrapper';
import StellarMapBreadcrumb from '../../StellarMapBreadcrumb';
import { useFocus } from '../contexts/FocusContext';
import { useSelectedNode } from '../contexts/SelectedNodeContext';
import { useCameraContext } from '../contexts/CameraContext';

export default function SolarSystem({ level }) {
  const { profile } = useAuth();
  const { focus, setFocus } = useFocus();
  const [selectedNode, setSelectedNode] = useSelectedNode();
  const { setCameraState } = useCameraContext();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedFamily = focus?.type === 'family' ? focus.family : focus?.type === 'constellation' ? focus.family : selectedNode?.familyAlias && families?.length ? families.find((f) => f.name === selectedNode.familyAlias) : null;
  const selectedConstellation = focus?.type === 'constellation' ? focus.constellation : selectedNode?.constellationAlias && selectedFamily ? selectedFamily.constellations?.find((c) => c.name === selectedNode.constellationAlias) : null;

  const userXP = profile?.current_xp != null ? Number(profile.current_xp) : (profile?.total_xp_earned != null ? Number(profile.total_xp_earned) : 0);

  useEffect(() => {
    if (!level) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: grouped, error } = await stellarMapService.getNodesGroupedByHierarchy(level, userXP);
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
  }, [level, userXP]);

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
      <NodeDetail />
      <ControlMenu />
      <IntroText />
      <StellarMapBreadcrumb
        currentCore={level}
        selectedFamily={selectedFamily}
        selectedConstellation={selectedConstellation}
        selectedNode={selectedNode}
        onNavigate={(type, data) => {
          if (type === 'core') setFocus('sun');
          else if (type === 'family') setFocus({ type: 'family', family: data });
          else if (type === 'constellation' && data?.constellation && data?.family) setFocus({ type: 'constellation', constellation: data.constellation, family: data.family });
          else if (type === 'node' && data) {
            setSelectedNode(data);
            setCameraState('ZOOMING_IN');
          }
        }}
      />
      <StellarMapFamilyConstellationSearch
        families={families}
        onSelect={({ type, family, constellation }) => {
          if (type === 'family') setFocus({ type: 'family', family });
          else setFocus({ type: 'constellation', constellation, family });
        }}
      />
      <StellarMapProgressionPanel families={families} />
      <StellarMapMiniMapWrapper families={families} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
          <span className="text-white/80 text-sm">Chargement de la carte stellaire…</span>
        </div>
      )}
    </>
  );
}
