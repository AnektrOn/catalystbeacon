import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import CelestialPivot from './CelestialPivot';
import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { 
  getNodeOrbitParams, 
  generateDeterministicTilt 
} from '../../utils/stellarHierarchy';
import { useNodePositions } from '../../contexts/NodePositionsContext';
import { useSelectedNode } from '../../contexts/SelectedNodeContext';
import { useCameraContext } from '../../contexts/CameraContext';

/**
 * NodeOrbit - Represents a single stellar map node orbiting its constellation
 * This is the "electron" in the atomic model
 * 
 * @param {Object} props
 * @param {Object} props.node - Node data from database
 * @param {number} props.nodeIndex - Index within constellation
 * @param {number} props.totalNodes - Total nodes in constellation
 * @param {number} props.initialAngle - Starting angle offset
 * @param {string} props.familyName - Parent family name
 * @param {string} props.constellationName - Parent constellation name
 */
export default function NodeOrbit({ 
  node, 
  nodeIndex,
  totalNodes,
  initialAngle = 0,
  familyName,
  constellationName
}) {
  const { speedFactor } = useSpeedControl();
  const { radius, speed, tilt, size } = getNodeOrbitParams(
    nodeIndex, 
    totalNodes, 
    node.difficulty
  );
  
  // Deterministic tilt based on node ID for consistency
  const deterministicTilt = generateDeterministicTilt(
    `${familyName}-${constellationName}-${node.id}`, 
    [-0.5, 0.5]
  );
  
  const meshRef = useRef();
  const { setNodePosition } = useNodePositions();
  const [, setSelectedNode] = useSelectedNode();
  const { setCameraState } = useCameraContext();
  
  // Track world position for minimap and camera targeting
  useFrame(() => {
    if (!meshRef.current) return;
    
    const worldPos = meshRef.current.getWorldPosition(meshRef.current.position.clone());
    setNodePosition(node.id, [worldPos.x, worldPos.y, worldPos.z]);
  });
  
  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedNode(node);
    setCameraState('ZOOMING_IN');
  };
  
  // Color based on difficulty (you can customize this)
  const getNodeColor = (difficulty) => {
    const d = parseInt(difficulty, 10) || 1;
    const colors = {
      1: '#7dd3fc', // Light blue
      2: '#60a5fa', // Blue
      3: '#3b82f6', // Darker blue
      4: '#2563eb', // Deep blue
      5: '#8b5cf6', // Purple
      6: '#7c3aed', // Deeper purple
      7: '#a855f7', // Magenta
      8: '#ec4899', // Pink
      9: '#f43f5e', // Red
      10: '#ef4444' // Deep red
    };
    return colors[d] || colors[1];
  };
  
  const getEmissiveColor = (difficulty) => {
    const d = parseInt(difficulty, 10) || 1;
    const colors = {
      1: '#0ea5e9',
      2: '#3b82f6',
      3: '#2563eb',
      4: '#1d4ed8',
      5: '#7c3aed',
      6: '#6d28d9',
      7: '#9333ea',
      8: '#db2777',
      9: '#dc2626',
      10: '#b91c1c'
    };
    return colors[d] || colors[1];
  };
  
  const nodeColor = getNodeColor(node.difficulty);
  const emissiveColor = getEmissiveColor(node.difficulty);
  
  return (
    <CelestialPivot
      radius={radius}
      speed={speed * speedFactor}
      tilt={deterministicTilt}
      initialAngle={initialAngle}
      position={[0, 0, 0]}
    >
      <mesh ref={meshRef} onClick={handleClick}>
        <Sphere args={[size, 32, 32]}>
          <meshStandardMaterial 
            color={nodeColor}
            emissive={emissiveColor}
            emissiveIntensity={0.4}
            metalness={0.3}
            roughness={0.7}
          />
        </Sphere>
      </mesh>
    </CelestialPivot>
  );
}
