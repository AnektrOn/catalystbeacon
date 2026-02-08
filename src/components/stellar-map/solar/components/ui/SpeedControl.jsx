import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { useCameraContext } from '../../contexts/CameraContext';

export default function SpeedControl() {
  const { speedFactor, setSpeedFactor } = useSpeedControl();
  const { cameraState } = useCameraContext();

  const isVisible = cameraState === 'FREE' || cameraState === 'INTRO_ANIMATION';
  const disabled = cameraState === 'ZOOMING_IN' || cameraState === 'DETAIL_VIEW';

  return (
    <div
      className="absolute top-14 right-4 flex flex-col items-end gap-1 z-10 transition-transform duration-300 ease-out"
      style={{
        transform: isVisible ? 'translateX(0)' : 'translateX(150%)',
      }}
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
    </div>
  );
}
