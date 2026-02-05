import CelestialPivot from './CelestialPivot';
import NodeOrbit from './NodeOrbit';
import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { 
  getConstellationOrbitParams, 
  generateDeterministicTilt,
  circularDistribution 
} from '../../utils/stellarHierarchy';

/**
 * ConstellationOrbit - Represents a constellation orbiting its family center
 * Contains multiple NodeOrbits (the actual stellar map nodes)
 * 
 * @param {Object} props
 * @param {Object} props.constellation - Constellation data { name, nodes, index }
 * @param {string} props.familyName - Parent family name (for deterministic generation)
 * @param {number} props.totalConstellations - Total constellations in this family
 * @param {number} props.initialAngle - Starting angle offset
 */
export default function ConstellationOrbit({ 
  constellation, 
  familyName,
  totalConstellations, 
  initialAngle = 0
}) {
  const { speedFactor } = useSpeedControl();
  const { radius, speed, tilt } = getConstellationOrbitParams(
    constellation.index, 
    totalConstellations
  );
  
  // Deterministic tilt based on constellation name
  const deterministicTilt = generateDeterministicTilt(
    `${familyName}-${constellation.name}`, 
    [-0.4, 0.4]
  );
  
  // Distribute nodes evenly around the constellation center
  const nodeDistribution = circularDistribution(constellation.nodes.length, 1);
  
  return (
    <CelestialPivot
      radius={radius}
      speed={speed * speedFactor}
      tilt={deterministicTilt}
      initialAngle={initialAngle}
      position={[0, 0, 0]}
    >
      {/* Constellation center marker (optional) */}
      {/* <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#4ecdc4" 
          emissive="#00ffff" 
          emissiveIntensity={0.4}
          transparent
          opacity={0.5}
        />
      </mesh> */}
      
      {/* Render all nodes in this constellation */}
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
