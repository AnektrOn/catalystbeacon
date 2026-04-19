import { useCameraContext } from '../../../contexts/CameraContext';
import CameraHomeButton from './CameraHomeButton';
import InfoButton from './InfoButton';
import ExitViewButton from './ExitViewButton';
import HelpButton from './HelpButton';

/**
 * @param {'panel' | 'inline' | 'drawer'} [variant]
 * @param {string} [className]
 */
export default function ControlMenu({ variant = 'panel', className = '' }) {
  const { cameraState } = useCameraContext();

  const isVisible = cameraState === 'FREE' || cameraState === 'INTRO_ANIMATION';

  if (variant === 'inline') {
    if (!isVisible) return null;
    return (
      <div className={`flex items-center gap-1 shrink-0 ${className}`}>
        <CameraHomeButton />
        <InfoButton />
        <HelpButton />
        <ExitViewButton />
      </div>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className={`flex flex-col gap-6 text-white ${className}`}>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Navigation</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <CameraHomeButton />
              <span className="text-sm text-white/90">Vue d’ensemble</span>
            </div>
            <div className="flex items-center gap-3">
              <InfoButton />
              <span className="text-sm text-white/90">Infos</span>
            </div>
            <div className="flex items-center gap-3">
              <HelpButton />
              <span className="text-sm text-white/90">Aide</span>
            </div>
            <ExitViewButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-2 border-2 border-secondary-100 rounded-xl bg-black z-10 transition-transform duration-300 ease-out shrink-0 ${className}`}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-140%)',
      }}
    >
      <div className="flex gap-x-2">
        <CameraHomeButton />
        <InfoButton />
        <HelpButton />
        <ExitViewButton />
      </div>
    </div>
  );
}
