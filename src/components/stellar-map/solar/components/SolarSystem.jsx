import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowLeft, Menu } from 'lucide-react';
import stellarMapService from '../../stellarMapService';
import { buildStellarHierarchy } from '../utils/stellarHierarchy';
import { useAuth } from '../../../../contexts/AuthContext';
import StarfieldBackground from '../../r3f/StarfieldBackground';
import Sun from './celestial/Sun';
import FamilyOrbit from './celestial/FamilyOrbit';
import CameraController from './motion/CameraController';
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

export default function SolarSystem({
  level,
  onExitLevel,
  onNavigateDashboard,
  setDrawerOpen = () => {},
}) {
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

  const searchOnSelect = ({ type, family, constellation }) => {
    if (type === 'family') setFocus({ type: 'family', family });
    else setFocus({ type: 'constellation', constellation, family });
  };

  const levelButtons = (
    <>
      <button
        type="button"
        onClick={onExitLevel}
        className="px-3 py-1.5 rounded-lg bg-black/70 text-white/90 text-xs border border-white/15 hover:bg-white/10 transition-colors shrink-0 hidden md:inline-flex items-center justify-center"
      >
        Changer de niveau
      </button>
      <button
        type="button"
        onClick={onExitLevel}
        className="px-2 py-1.5 rounded-lg bg-black/70 text-white/90 text-xs border border-white/15 hover:bg-white/10 transition-colors shrink-0 md:hidden"
      >
        Changer
      </button>
      <button
        type="button"
        onClick={onNavigateDashboard}
        className="w-8 h-8 shrink-0 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white/10 transition-colors border border-white/15"
        aria-label="Retour"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <>
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 50, 80], fov: 60 }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000');
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={null}>
            <CameraController />
            <StarfieldBackground />
            <SceneLighting />

            <Sun position={[0, 0, 0]} radius={1.5} />

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

      <div className="hidden lg:flex absolute top-3 left-3 z-[100] items-center gap-2">
        <ControlMenu variant="panel" />
        <StellarMapFamilyConstellationSearch
          families={families}
          onSelect={searchOnSelect}
          inline
          className="w-[220px] shrink-0"
        />
      </div>

      <div className="hidden lg:flex absolute top-3 right-3 z-[100] items-center gap-2">
        <button
          type="button"
          onClick={onExitLevel}
          className="px-3 py-1.5 rounded-lg bg-black/70 text-white/90 text-xs border border-white/15 hover:bg-white/10 transition-colors"
        >
          Changer de niveau
        </button>
        <button
          type="button"
          onClick={onNavigateDashboard}
          className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white/10 transition-colors border border-white/15"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="hidden md:flex lg:hidden absolute top-2 left-2 right-2 h-10 z-[100] items-center gap-2 px-2.5 rounded-lg bg-black/80 border border-white/10 overflow-visible">
        <ControlMenu variant="inline" />
        <StellarMapFamilyConstellationSearch
          families={families}
          onSelect={searchOnSelect}
          inline
          className="min-w-0 flex-1"
        />
        {levelButtons}
      </div>

      <div className="flex md:hidden absolute top-2 left-2 right-2 h-10 z-[100] items-center gap-1.5 px-2 rounded-lg bg-black/80 border border-white/10 overflow-visible">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 shrink-0 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/15 border border-white/15"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <StellarMapFamilyConstellationSearch
          families={families}
          onSelect={searchOnSelect}
          inline
          className="min-w-0 flex-1"
        />
        <button
          type="button"
          onClick={onExitLevel}
          className="px-2 py-1.5 rounded-lg bg-black/70 text-white/90 text-xs border border-white/15 hover:bg-white/10 transition-colors shrink-0 max-w-[76px] truncate"
        >
          Changer
        </button>
      </div>

      <SpeedControl />
      <NodeDetail />
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

      <StellarMapProgressionPanel families={families} />

      <StellarMapMiniMapWrapper families={families} />
      {loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-black/70 text-white/80 text-xs border border-white/10">
          Chargement de la carte stellaire…
        </div>
      )}
    </>
  );
}
