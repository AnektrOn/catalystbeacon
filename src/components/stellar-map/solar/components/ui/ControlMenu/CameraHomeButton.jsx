import { useCameraContext } from '../../../contexts/CameraContext';
import { useSelectedNode } from '../../../contexts/SelectedNodeContext';
import { useFocus } from '../../../contexts/FocusContext';
import { useSpeedControl } from '../../../contexts/SpeedControlContext';
import { Button } from '@nextui-org/react';
import { IconHome } from '@tabler/icons-react';

export default function CameraHomeButton() {
  const { cameraState, setCameraState } = useCameraContext();
  const { setFocus } = useFocus();
  const { restoreSpeedFactor } = useSpeedControl();
  const [, setSelectedNode] = useSelectedNode();

  const moveToHome = () => {
    setFocus('sun');
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
