import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import planetsData from '../lib/planetsData';
import SceneBackground from './SceneBackground';
import Sun from './celestial/Sun';
import Planet from './celestial/Planets';
import CameraController from './motion/CameraController';
import PlanetsUpdater from './motion/PlanetsUpdater';
import PlanetMenu from './ui/PlanetMenu';
import SpeedControl from './ui/SpeedControl';
import PlanetDetail from './ui/PlanetDetail';
import ControlMenu from './ui/ControlMenu/ControlMenu';
import SceneLighting from './SceneLighting';
import IntroText from './ui/IntroText';

export default function SolarSystem() {
  const [planetOrbitProgress, setPlanetOrbitProgress] = useState(() =>
    planetsData.reduce((acc, planet) => {
      acc[planet.name] = 0;
      return acc;
    }, {})
  );

  return (
    <>
      <div className="absolute inset-0 w-full h-full" style={{ minHeight: '100vh' }}>
        <Canvas
          camera={{ position: [-100, 0, 100], fov: 60 }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <CameraController />
            <SceneBackground texturePath="/images/background/stars_8k.webp" />
            <SceneLighting />
            <Sun position={[0, 0, 0]} radius={1} />
          {planetsData.map((planet) => (
            <Planet
              key={planet.id}
              id={planet.id}
              name={planet.name}
              texturePath={planet.texturePath}
              position={planet.position}
              radius={planet.radius}
              rotationSpeed={planet.rotationSpeed}
              tilt={planet.tilt}
              orbitSpeed={planet.orbitSpeed}
              moons={planet.moons}
              wobble={planet.wobble}
              rings={planet.rings}
              orbitProgress={planetOrbitProgress[planet.name]}
              displayStats={planet.displayStats}
            />
          ))}
          <PlanetsUpdater
            setPlanetOrbitProgress={setPlanetOrbitProgress}
            planets={planetsData}
          />
          </Suspense>
        </Canvas>
      </div>
      <PlanetMenu planets={planetsData} />
      <SpeedControl />
      <AnimatePresence>
        <PlanetDetail />
      </AnimatePresence>
      <ControlMenu />
      <IntroText />
    </>
  );
}
