import { useCameraContext } from '../../../contexts/CameraContext';
import CameraHomeButton from './CameraHomeButton';
import InfoButton from './InfoButton';
import ExitViewButton from './ExitViewButton';
import HelpButton from './HelpButton';

export default function ControlMenu() {
  const { cameraState } = useCameraContext();

  const isVisible = cameraState === 'FREE' || cameraState === 'INTRO_ANIMATION';

  return (
    <div
      className="absolute top-5 left-5 p-2 border-2 border-secondary-100 rounded-xl bg-black z-10 transition-transform duration-300 ease-out"
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
