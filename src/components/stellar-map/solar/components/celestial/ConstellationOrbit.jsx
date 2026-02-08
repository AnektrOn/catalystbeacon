import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import CelestialPivot from './CelestialPivot';
import NodeOrbit from './NodeOrbit';
import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { useFocus } from '../../contexts/FocusContext';
import { useConstellationPositions } from '../../contexts/ConstellationPositionsContext';
import { 
  getConstellationOrbitParams, 
  generateDeterministicTilt,
  circularDistribution 
} from '../../utils/stellarHierarchy';

const tempVec = new Vector3();

/**
 * ConstellationOrbit - Represents a constellation orbiting its family center.
 * Clicking the constellation center focuses the camera on it.
 */
export default function ConstellationOrbit({ 
  constellation, 
  familyName,
  family,
  totalConstellations, 
  initialAngle = 0
}) {
  const pivotRef = useRef();
  const { speedFactor } = useSpeedControl();
  const { setFocus } = useFocus();
  const { setConstellationPosition } = useConstellationPositions();
  const { radius, speed, tilt } = getConstellationOrbitParams(
    constellation.index, 
    totalConstellations
  );
  
  const deterministicTilt = generateDeterministicTilt(
    `${familyName}-${constellation.name}`, 
    [-0.4, 0.4]
  );
  
  useFrame(() => {
    if (pivotRef.current) {
      pivotRef.current.getWorldPosition(tempVec);
      const key = constellation.id || `${familyName}-${constellation.name}`;
      setConstellationPosition(key, [tempVec.x, tempVec.y, tempVec.z]);
    }
  });
  
  const nodeDistribution = circularDistribution(constellation.nodes.length, 1);
  const constellationKey = constellation.id || `${familyName}-${constellation.name}`;

  const centerContent = (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        setFocus({ type: 'constellation', constellation, family });
      }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
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
      {constellation.nodes.map((node, idx) => {
        const distribution = nodeDistribution[idx];
        return (
          <NodeOrbit
            key={node.id}
            node={node}
            nodeIndex={idx}
            totalNodes={constellation.nodes.length}
            initialAngle={distribution.angle}
            familyName={familyName}
            constellationName={constellation.name}
          />
        );
      })}
    </CelestialPivot>
  );
}
