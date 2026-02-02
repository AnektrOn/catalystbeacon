import { useMemo, useEffect, useRef } from 'react';
import { TextureLoader } from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import GuideRing from './GuideRing';
import { usePlanetPositions } from '../../contexts/PlanetPositionsContext';
import SaturnRings from './SaturnRings';

export default function Planet({
  name,
  texturePath,
  position,
  radius,
  orbitProgress,
  tilt,
  rotationSpeed,
  rings,
}) {
  const { setPlanetPosition } = usePlanetPositions();
  const texture = useLoader(TextureLoader, texturePath);
  const sphereArgs = useMemo(() => [radius, 64, 64], [radius]);
  const orbitRadius = position.x;
  const x = Math.cos(orbitProgress) * orbitRadius;
  const z = Math.sin(orbitProgress) * orbitRadius;
  const ref = useRef(null);

  useFrame(() => {
    if (ref.current) {
      const rotationPerFrame = (rotationSpeed * (Math.PI / 180)) / 60;
      ref.current.rotation.y += rotationPerFrame;
    }
  });

  useEffect(() => {
    setPlanetPosition(name, [x, 0, z]);
  }, [x, z, name, setPlanetPosition]);

  return (
    <>
      <mesh ref={ref} position={[x, 0, z]} rotation={[tilt, 0, 0]}>
        <Sphere args={sphereArgs}>
          <meshStandardMaterial map={texture} />
        </Sphere>
        {rings && (
          <SaturnRings
            texturePath={rings.texturePath}
            innerRadius={rings.size[0]}
            outerRadius={rings.size[1]}
          />
        )}
      </mesh>
      <GuideRing radius={orbitRadius} />
    </>
  );
}
