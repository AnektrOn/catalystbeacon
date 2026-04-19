import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { useCameraContext } from '../../contexts/CameraContext';

/**
 * @param {'floating' | 'drawer'} [variant]
 */
export default function SpeedControl({ variant = 'floating' }) {
  const { speedFactor, setSpeedFactor } = useSpeedControl();
  const { cameraState } = useCameraContext();

  const isVisible = cameraState === 'FREE' || cameraState === 'INTRO_ANIMATION';
  const disabled = cameraState === 'ZOOMING_IN' || cameraState === 'DETAIL_VIEW';

  if (variant === 'drawer') {
    return (
      <div className="flex flex-col gap-2 w-full border-t border-white/10 pt-4">
        <span className="text-xs text-white/50 uppercase tracking-wide">Vitesse d’orbite</span>
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
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/80 disabled:opacity-50"
        />
        <span className="text-white/80 text-xs">{speedFactor.toFixed(1)}x</span>
      </div>
    );
  }

  return (
    <div
      className={`absolute top-14 right-3 md:right-2 lg:right-3 flex flex-col items-end gap-1 z-10 transition-transform duration-300 ease-out hidden md:flex ${
        isVisible ? 'translate-x-0' : 'translate-x-[150%]'
      }`}
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
