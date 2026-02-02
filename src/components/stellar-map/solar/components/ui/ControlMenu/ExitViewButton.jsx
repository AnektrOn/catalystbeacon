import { useSelectedNode } from '../../../contexts/SelectedNodeContext';
import { useSpeedControl } from '../../../contexts/SpeedControlContext';
import { useCameraContext } from '../../../contexts/CameraContext';
import { Button } from '@nextui-org/react';
import { IconX } from '@tabler/icons-react';

export default function ExitViewButton() {
  const [selectedNode, setSelectedNode] = useSelectedNode();
  const { restoreSpeedFactor } = useSpeedControl();
  const { setCameraState } = useCameraContext();

  const handleExitDetailMode = () => {
    setSelectedNode(null);
    restoreSpeedFactor();
    setCameraState('MOVING_TO_HOME');
  };

  if (!selectedNode) return null;

  return (
    <Button color="danger" variant="flat" onPress={handleExitDetailMode}>
      <IconX /> Exit Detail View
    </Button>
  );
}
