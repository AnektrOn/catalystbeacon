import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { useCameraContext } from '../../contexts/CameraContext';

export default function SpeedControl() {
  const controls = useAnimation();
  const { speedFactor, setSpeedFactor } = useSpeedControl();
  const { cameraState } = useCameraContext();

  useEffect(() => {
    if (cameraState === 'FREE' || cameraState === 'INTRO_ANIMATION') {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [cameraState, controls]);

  const speedControlVariants = {
    hidden: { x: '150%', opacity: 1 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const disabled = cameraState === 'ZOOMING_IN' || cameraState === 'DETAIL_VIEW';

  return (
    <motion.div
      className="absolute top-14 right-4 flex flex-col items-end gap-1 z-10"
      variants={speedControlVariants}
      initial="hidden"
      animate={controls}
    >
      <span className="text-white/80 text-xs">Speed</span>
      <input
        type="range"
        min={0}
        max={5}
        step={0.01}
        value={speedFactor}
        onChange={(e) => setSpeedFactor(Number(e.target.value))}
        disabled={disabled}
        aria-label="Speed control"
        className="w-32 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/80 disabled:opacity-50"
      />
      <span className="text-white/80 text-xs">{speedFactor.toFixed(1)}x</span>
    </motion.div>
  );
}
