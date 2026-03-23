import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import CelestialPivot from './CelestialPivot';
import ConstellationOrbit from './ConstellationOrbit';
import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { useFocus } from '../../contexts/FocusContext';
import { useFamilyPositions } from '../../contexts/FamilyPositionsContext';
import { 
  getFamilyOrbitParams, 
  generateDeterministicTilt,
  circularDistribution 
} from '../../utils/stellarHierarchy';

const tempVec = new Vector3();

/**
 * FamilyOrbit - Represents a constellation family orbiting the sun
 * Contains multiple ConstellationOrbits as children.
 * Clicking the family center focuses the camera on this family.
 */
export default function FamilyOrbit({ family, totalFamilies }) {
  const pivotRef = useRef();
  const { speedFactor } = useSpeedControl();
  const { setFocus } = useFocus();
  const { setFamilyPosition } = useFamilyPositions();
  const { radius, speed, tilt } = getFamilyOrbitParams(family.index, totalFamilies);
  
  const deterministicTilt = generateDeterministicTilt(family.name, [-0.3, 0.3]);
  const initialAngle = (family.index / totalFamilies) * Math.PI * 2;
  
  useFrame(() => {
    if (pivotRef.current) {
      pivotRef.current.getWorldPosition(tempVec);
      setFamilyPosition(family.name, [tempVec.x, tempVec.y, tempVec.z]);
    }
  });
  
  const constellationDistribution = circularDistribution(
    family.constellations.length, 
    1
  );

  const onFamilyClick = (e) => {
    e.stopPropagation();
    setFocus({ type: 'family', family });
  };
  const onPointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };
  const onPointerOut = () => {
    document.body.style.cursor = 'default';
  };

  const centerContent = (
    <group>
      <mesh onClick={onFamilyClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#C8A96E" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <mesh onClick={onFamilyClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
  
  return (
    <CelestialPivot
      ref={pivotRef}
      radius={radius}
      speed={speed * speedFactor}
      tilt={deterministicTilt}
      initialAngle={initialAngle}
      position={[0, 0, 0]}
      centerContent={centerContent}
    >
      {family.constellations.map((constellation, idx) => {
        const distribution = constellationDistribution[idx];
        return (
          <ConstellationOrbit
            key={`${family.name}-${constellation.name}-${idx}`}
            constellation={constellation}
            familyName={family.name}
            family={family}
            totalConstellations={family.constellations.length}
            initialAngle={distribution.angle}
          />
        );
      })}
    </CelestialPivot>
  );
}
