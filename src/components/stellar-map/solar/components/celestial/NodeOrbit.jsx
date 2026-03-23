import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CelestialPivot from './CelestialPivot';
import { useSpeedControl } from '../../contexts/SpeedControlContext';
import {
  getNodeOrbitParams,
  generateDeterministicTilt,
} from '../../utils/stellarHierarchy';
import { useNodePositions } from '../../contexts/NodePositionsContext';
import { useSelectedNode } from '../../contexts/SelectedNodeContext';
import { useCameraContext } from '../../contexts/CameraContext';
import {
  createRockyTexture,
  createGasGiantTexture,
  createRingTexture,
  getCachedTexture,
} from '../../utils/proceduralTextures';

function hashNodeId(nodeId) {
  const s = String(nodeId);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function isGasGiant(nodeId, difficulty) {
  const d = parseInt(difficulty, 10) || 0;
  return d >= 5 && hashNodeId(nodeId) % 2 === 0;
}

function hasRings(nodeId, difficulty) {
  const d = parseInt(difficulty, 10) || 0;
  return d >= 7 && hashNodeId(nodeId) % 3 === 0;
}

/** Stable 0–11 palette slot from node id (feeds procedural texture variation). */
function getNodeSeed(nodeId) {
  return hashNodeId(nodeId) % 12;
}

/**
 * NodeOrbit — node as a procedural planet with optional rings / gas atmosphere.
 */
export default function NodeOrbit({
  node,
  nodeIndex,
  totalNodes,
  initialAngle = 0,
  familyName,
  constellationName,
}) {
  const { speedFactor } = useSpeedControl();
  const { radius, speed, tilt, size } = getNodeOrbitParams(
    nodeIndex,
    totalNodes,
    node.difficulty
  );

  const deterministicTilt = generateDeterministicTilt(
    `${familyName}-${constellationName}-${node.id}`,
    [-0.5, 0.5]
  );

  const meshRef = useRef(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const { setNodePosition } = useNodePositions();
  const [, setSelectedNode] = useSelectedNode();
  const { setCameraState } = useCameraContext();

  const textureSeed = useMemo(() => {
    const h = hashNodeId(node.id);
    return h + getNodeSeed(node.id) * 2654435761;
  }, [node.id]);
  const gasGiant = useMemo(
    () => isGasGiant(node.id, node.difficulty),
    [node.id, node.difficulty]
  );
  const ringVisible = useMemo(
    () => hasRings(node.id, node.difficulty),
    [node.id, node.difficulty]
  );

  const diffN = Math.min(10, Math.max(0, parseInt(node.difficulty, 10) || 0));
  const planetRadius = size * (1 + diffN * 0.08);

  const { map, normalMap, roughnessMap } = useMemo(() => {
    const seed = textureSeed;
    const mapTex = gasGiant
      ? createGasGiantTexture(seed, 256)
      : createRockyTexture(seed, 256);
    const normal = gasGiant
      ? getCachedTexture('normalGas', seed, 128)
      : getCachedTexture('normal', seed, 128);
    const rough = getCachedTexture('roughness', seed, 128);
    return { map: mapTex, normalMap: normal, roughnessMap: rough };
  }, [textureSeed, gasGiant]);

  const ringMaps = useMemo(() => {
    if (!ringVisible) return null;
    return {
      inner: createRingTexture(textureSeed + 7, 512),
      outer: createRingTexture(textureSeed + 31, 512),
    };
  }, [textureSeed, ringVisible]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.002 * speedFactor;
    meshRef.current.getWorldPosition(worldPos);
    setNodePosition(node.id, [worldPos.x, worldPos.y, worldPos.z]);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedNode(node);
    setCameraState('ZOOMING_IN');
  };

  const ringRot = [Math.PI / 2.5, 0.3, 0.1];

  return (
    <CelestialPivot
      radius={radius}
      speed={speed * speedFactor}
      tilt={deterministicTilt}
      initialAngle={initialAngle}
      position={[0, 0, 0]}
    >
      <mesh
        ref={meshRef}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[planetRadius, 32, 32]} />
        <meshStandardMaterial
          map={map}
          normalMap={normalMap}
          normalScale={[1.2, 1.2]}
          roughnessMap={roughnessMap}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      {gasGiant && (
        <mesh scale={1.02}>
          <sphereGeometry args={[planetRadius, 24, 24]} />
          <meshBasicMaterial
            color="#C8A878"
            transparent
            opacity={0.06}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
      {ringVisible && ringMaps && (
        <>
          <mesh rotation={ringRot} renderOrder={2}>
            <ringGeometry args={[planetRadius * 1.4, planetRadius * 2.4, 96]} />
            <meshBasicMaterial
              map={ringMaps.inner}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={ringRot} renderOrder={2}>
            <ringGeometry args={[planetRadius * 2.5, planetRadius * 2.8, 64]} />
            <meshBasicMaterial
              map={ringMaps.outer}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </CelestialPivot>
  );
}
