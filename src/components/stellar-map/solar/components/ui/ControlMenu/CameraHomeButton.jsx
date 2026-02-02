import { useCameraContext } from '../../../contexts/CameraContext';
import { useSelectedNode } from '../../../contexts/SelectedNodeContext';
import { useSpeedControl } from '../../../contexts/SpeedControlContext';
import { Button } from '@nextui-org/react';
import { IconHome } from '@tabler/icons-react';

export default function CameraHomeButton() {
  const { cameraState, setCameraState } = useCameraContext();
  const { restoreSpeedFactor } = useSpeedControl();
  const [, setSelectedNode] = useSelectedNode();

  const moveToHome = () => {
    setCameraState('MOVING_TO_HOME');
    setSelectedNode(null);
    restoreSpeedFactor();
  };

  const isButtonDisabled = cameraState === 'INTRO_ANIMATION';

  return (
    <Button isIconOnly color="secondary" variant="flat" isDisabled={isButtonDisabled} onPress={moveToHome}>
      <IconHome />
    </Button>
  );
}
