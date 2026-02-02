import { useEffect } from 'react';
import { Sphere } from '@react-three/drei';
import { useNodePositions } from '../../contexts/NodePositionsContext';
import { useSelectedNode } from '../../contexts/SelectedNodeContext';
import { useCameraContext } from '../../contexts/CameraContext';
import GuideRing from './GuideRing';

const NODE_RADIUS = 0.08;

export default function Node({ node, orbitRadius, angleOffset, orbitProgress, showOrbitRing = false }) {
  const { setNodePosition } = useNodePositions();
  const [, setSelectedNode] = useSelectedNode();
  const { setCameraState } = useCameraContext();

  const x = Math.cos(orbitProgress + angleOffset) * orbitRadius;
  const z = Math.sin(orbitProgress + angleOffset) * orbitRadius;

  useEffect(() => {
    setNodePosition(node.id, [x, 0, z]);
  }, [x, z, node.id, setNodePosition]);

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedNode(node);
    setCameraState('ZOOMING_IN');
  };

  return (
    <>
      <mesh position={[x, 0, z]} onClick={handleClick}>
        <Sphere args={[NODE_RADIUS, 32, 32]}>
          <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={0.3} />
        </Sphere>
      </mesh>
      {showOrbitRing && <GuideRing radius={orbitRadius} />}
    </>
  );
}
