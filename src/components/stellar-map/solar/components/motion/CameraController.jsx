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
const FOCUS_TARGET_LERP = 0.06;
/** After focus change, nudge camera toward this offset from target (orbit around selection, not sun). */
const REFOCUS_FRAMES = 100;
const FAMILY_CAM_OFFSET = new Vector3(0, 24, 42);
const CONSTELLATION_CAM_OFFSET = new Vector3(0, 14, 26);

function focusKey(focus) {
  if (focus === 'sun') return 'sun';
  if (focus?.type === 'family' && focus.family?.name) return `family:${focus.family.name}`;
  if (focus?.type === 'constellation' && focus.family && focus.constellation) {
    const id = focus.constellation.id || focus.constellation.name;
    return `constellation:${focus.family.name}:${id}`;
  }
  return 'sun';
}

export default function CameraController() {
  useCameraSetup();

  const orbitControlsRef = useRef(null);
  const invisibleTargetRef = useRef(new Vector3(0, 0, 0)).current;
  const focusTargetRef = useRef(new Vector3(0, 0, 0)).current;
  const prevFocusKeyRef = useRef('sun');
  const refocusFramesRef = useRef(0);

  const { camera } = useThree();
  const [selectedNode] = useSelectedNode();
  const { positionsRef: nodePositionsRef } = useNodePositions();
  const { cameraState, setCameraState } = useCameraContext();
  const { focus } = useFocus();
  const { positionsRef: familyPositionsRef } = useFamilyPositions();
  const { positionsRef: constellationPositionsRef } = useConstellationPositions();
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

    const key = focusKey(focus);
    if (key !== prevFocusKeyRef.current) {
      prevFocusKeyRef.current = key;
      refocusFramesRef.current = REFOCUS_FRAMES;
    }

    switch (cameraState) {
      case 'FREE': {
        controls.enabled = true;
        controls.maxDistance = Infinity;
        controls.minDistance = 0;

        if (focus === 'sun') {
          focusTargetRef.set(0, 0, 0);
        } else if (focus?.type === 'family' && focus.family?.name) {
          const pos = familyPositionsRef.current[focus.family.name];
          if (pos) focusTargetRef.set(pos[0], pos[1], pos[2]);
        } else if (focus?.type === 'constellation' && focus.constellation && focus.family) {
          const ckey = focus.constellation.id || `${focus.family.name}-${focus.constellation.name}`;
          const pos = constellationPositionsRef.current[ckey];
          if (pos) focusTargetRef.set(pos[0], pos[1], pos[2]);
        }

        invisibleTargetRef.lerp(focusTargetRef, FOCUS_TARGET_LERP);
        controls.target.copy(invisibleTargetRef);

        if (refocusFramesRef.current > 0) {
          refocusFramesRef.current -= 1;
          if (focus === 'sun') {
            camera.position.lerp(homePosition, 0.055);
          } else if (focus?.type === 'family' && focus.family?.name) {
            const pos = familyPositionsRef.current[focus.family.name];
            if (pos) {
              const target = new Vector3(pos[0], pos[1], pos[2]);
              const ideal = target.clone().add(FAMILY_CAM_OFFSET);
              camera.position.lerp(ideal, 0.05);
            }
          } else if (focus?.type === 'constellation' && focus.constellation && focus.family) {
            const ckey = focus.constellation.id || `${focus.family.name}-${focus.constellation.name}`;
            const pos = constellationPositionsRef.current[ckey];
            if (pos) {
              const target = new Vector3(pos[0], pos[1], pos[2]);
              const ideal = target.clone().add(CONSTELLATION_CAM_OFFSET);
              camera.position.lerp(ideal, 0.05);
            }
          }
        }

        controls.update();
        break;
      }

      case 'DETAIL_VIEW':
        refocusFramesRef.current = 0;
        if (selectedNode) {
          controls.enabled = true;
          const pos = nodePositionsRef.current[selectedNode.id];
          if (pos) {
            controls.target.set(...pos);
            controls.minDistance = NODE_VIEW_MIN_DISTANCE;
            controls.maxDistance = NODE_VIEW_MAX_DISTANCE;
            controls.update();
          }
        }
        break;

      case 'INTRO_ANIMATION':
        refocusFramesRef.current = 0;
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
        refocusFramesRef.current = 0;
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
        refocusFramesRef.current = 0;
        if (selectedNode) {
          const pos = nodePositionsRef.current[selectedNode.id];
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
