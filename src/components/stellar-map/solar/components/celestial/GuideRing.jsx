import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraContext } from '../../contexts/CameraContext';

export default function GuideRing({ radius }) {
  const { cameraState } = useCameraContext();
  const lineRef = useRef(null);
  const opacitySmoothed = useRef(0);

  const targetOpacity = (() => {
    switch (cameraState) {
      case 'FREE':
      case 'MOVING_TO_HOME':
      case 'INTRO_ANIMATION':
        return 1;
      case 'ZOOMING_IN':
      case 'DETAIL_VIEW':
        return 0;
      default:
        return 0;
    }
  })();

  const geometry = useMemo(() => {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  useFrame((_, delta) => {
    const goal = targetOpacity * 0.28;
    const k = 1 - Math.exp(-delta * 3.5);
    opacitySmoothed.current += (goal - opacitySmoothed.current) * k;
    const mat = lineRef.current?.material;
    if (mat) mat.opacity = opacitySmoothed.current;
  });

  return (
    <line rotation={[0.15, 0, 0]} geometry={geometry} ref={lineRef}>
      <lineBasicMaterial
        color="#C8A96E"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </line>
  );
}
