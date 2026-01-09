import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/**
 * Component that tracks camera and canvas size from inside Canvas
 * and passes them to a callback for external fog overlay
 */
export function CameraTracker({ onCameraUpdate }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (onCameraUpdate) {
      onCameraUpdate({ camera, size });
    }
  }, [camera, size, onCameraUpdate]);

  return null;
}

