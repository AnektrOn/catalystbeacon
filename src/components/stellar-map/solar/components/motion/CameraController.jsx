import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useSelectedNode } from '../../contexts/SelectedNodeContext';
import { useNodePositions } from '../../contexts/NodePositionsContext';
import { useCameraContext } from '../../contexts/CameraContext';
import { useFocus } from '../../contexts/FocusContext';
import { useFamilyPositions } from '../../contexts/FamilyPositionsContext';
import { useConstellationPositions } from '../../contexts/ConstellationPositionsContext';
import { useCameraSetup } from '../../hooks/useCameraSetup';

const NODE_VIEW_MIN_DISTANCE = 3;
const NODE_VIEW_MAX_DISTANCE = 15;
const FOCUS_TARGET_LERP = 0.03;

export default function CameraController() {
  useCameraSetup();

  const orbitControlsRef = useRef(null);
  const invisibleTargetRef = useRef(new Vector3(0, 0, 0)).current;
  const focusTargetRef = useRef(new Vector3(0, 0, 0)).current;

  const { camera } = useThree();
  const [selectedNode] = useSelectedNode();
  const { nodePositions } = useNodePositions();
  const { cameraState, setCameraState } = useCameraContext();
  const { focus } = useFocus();
  const { familyPositions } = useFamilyPositions();
  const { constellationPositions } = useConstellationPositions();
  const homePosition = useRef(new Vector3(0, 35, 55)).current;
  const lerpFactor = 0.06;
  const cameraPositionEpsilon = 0.5;
  const introAnimationCompleted = useRef(false);

  useEffect(() => {
    const controls = orbitControlsRef.current;
    if (controls) {
      controls.target.copy(invisibleTargetRef);
      controls.update();
    }
  }, []);

  useFrame(() => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    switch (cameraState) {
      case 'FREE':
        controls.enabled = true;
        controls.maxDistance = Infinity;
        if (focus === 'sun') {
          focusTargetRef.set(0, 0, 0);
        } else if (focus?.type === 'family' && focus.family?.name && familyPositions[focus.family.name]) {
          const [x, y, z] = familyPositions[focus.family.name];
          focusTargetRef.set(x, y, z);
        } else if (focus?.type === 'constellation' && focus.constellation && focus.family) {
          const key = focus.constellation.id || `${focus.family.name}-${focus.constellation.name}`;
          const pos = constellationPositions[key];
          if (pos) focusTargetRef.set(...pos);
        }
        invisibleTargetRef.lerp(focusTargetRef, FOCUS_TARGET_LERP);
        controls.target.copy(invisibleTargetRef);
        controls.update();
        break;

      case 'DETAIL_VIEW':
        if (selectedNode) {
          controls.enabled = true;
          const pos = nodePositions[selectedNode.id];
          if (pos) {
            controls.target.set(...pos);
            controls.minDistance = NODE_VIEW_MIN_DISTANCE;
            controls.maxDistance = NODE_VIEW_MAX_DISTANCE;
            controls.update();
          }
        }
        break;

      case 'INTRO_ANIMATION':
        if (!introAnimationCompleted.current) {
          controls.enabled = false;
          camera.position.lerp(homePosition, 0.12);
          camera.lookAt(invisibleTargetRef);
          if (camera.position.distanceTo(homePosition) < 0.5) {
            introAnimationCompleted.current = true;
            camera.position.copy(homePosition);
            setCameraState('FREE');
          }
        }
        break;

      case 'MOVING_TO_HOME':
        controls.enabled = false;
        camera.position.lerp(homePosition, lerpFactor);
        invisibleTargetRef.lerp(new Vector3(0, 0, 0), lerpFactor);
        camera.lookAt(invisibleTargetRef);

        if (
          camera.position.distanceTo(homePosition) < cameraPositionEpsilon &&
          invisibleTargetRef.distanceTo(new Vector3(0, 0, 0)) < cameraPositionEpsilon
        ) {
          camera.position.copy(homePosition);
          invisibleTargetRef.set(0, 0, 0);
          controls.target.copy(invisibleTargetRef);
          controls.maxDistance = Infinity;
          controls.update();
          setCameraState('FREE');
        }
        break;

      case 'ZOOMING_IN':
        if (selectedNode) {
          const pos = nodePositions[selectedNode.id];
          if (pos) {
            controls.enabled = false;
            const nodePosition = new Vector3(...pos);
            const targetCameraPosition = nodePosition.clone().add(new Vector3(1, 0, 0).multiplyScalar(5));
            camera.position.lerp(targetCameraPosition, 0.08);
            const fastLerpFactor = 0.1;
            invisibleTargetRef.lerp(nodePosition, fastLerpFactor);
            camera.lookAt(invisibleTargetRef);
            const reachedTargetPosition = camera.position.distanceTo(targetCameraPosition) < cameraPositionEpsilon;
            const reachedTargetLookAt = invisibleTargetRef.distanceTo(nodePosition) < cameraPositionEpsilon;

            if (reachedTargetPosition && reachedTargetLookAt) {
              controls.target.copy(invisibleTargetRef);
              controls.update();
              setCameraState('DETAIL_VIEW');
            }
          }
        }
        break;

      default:
        break;
    }
  });

  return (
    <DreiOrbitControls
      ref={orbitControlsRef}
      enableZoom
      rotateSpeed={0.7}
      zoomSpeed={0.7}
    />
  );
}
