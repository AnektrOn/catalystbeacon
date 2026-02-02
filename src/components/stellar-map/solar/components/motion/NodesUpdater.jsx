import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpeedControl } from '../../contexts/SpeedControlContext';

const ORBIT_ANGULAR_SPEED = 0.15;

export default function NodesUpdater({ setOrbitProgressByDifficulty, difficultyKeys }) {
  const { speedFactor } = useSpeedControl();
  const lastElapsedTimeRef = useRef(0);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedTimeRef.current;
    lastElapsedTimeRef.current = elapsedTime;

    const delta = ORBIT_ANGULAR_SPEED * speedFactor * deltaTime;

    setOrbitProgressByDifficulty((prev) => {
      const next = { ...prev };
      difficultyKeys.forEach((d) => {
        next[d] = (prev[d] ?? 0) + delta;
      });
      return next;
    });
  });

  return null;
}
