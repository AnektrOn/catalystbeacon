import CelestialPivot from './CelestialPivot';
import ConstellationOrbit from './ConstellationOrbit';
import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { 
  getFamilyOrbitParams, 
  generateDeterministicTilt,
  circularDistribution 
} from '../../utils/stellarHierarchy';

/**
 * FamilyOrbit - Represents a constellation family orbiting the sun
 * Contains multiple ConstellationOrbits as children
 * 
 * @param {Object} props
 * @param {Object} props.family - Family data { name, constellations, index }
 * @param {number} props.totalFamilies - Total number of families (for spacing)
 */
export default function FamilyOrbit({ family, totalFamilies }) {
  const { speedFactor } = useSpeedControl();
  const { radius, speed, tilt } = getFamilyOrbitParams(family.index, totalFamilies);
  
  // Deterministic tilt based on family name for consistency
  const deterministicTilt = generateDeterministicTilt(family.name, [-0.3, 0.3]);
  
  // Calculate initial angle based on family index for even distribution
  const initialAngle = (family.index / totalFamilies) * Math.PI * 2;
  
  // Distribute constellations around the family center
  const constellationDistribution = circularDistribution(
    family.constellations.length, 
    1 // Relative radius, actual radius calculated in ConstellationOrbit
  );
  
  return (
    <CelestialPivot
      radius={radius}
      speed={speed * speedFactor}
      tilt={deterministicTilt}
      initialAngle={initialAngle}
      position={[0, 0, 0]}
    >
      {/* Family center marker (optional visual aid) */}
      {/* <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#ff6b6b" 
          emissive="#ff0000" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh> */}
      
      {/* Render all constellations in this family */}
      {family.constellations.map((constellation, idx) => {
        const distribution = constellationDistribution[idx];
        
        return (
          <ConstellationOrbit
            key={`${family.name}-${constellation.name}-${idx}`}
            constellation={constellation}
            familyName={family.name}
            totalConstellations={family.constellations.length}
            initialAngle={distribution.angle}
          />
        );
      })}
    </CelestialPivot>
  );
}
