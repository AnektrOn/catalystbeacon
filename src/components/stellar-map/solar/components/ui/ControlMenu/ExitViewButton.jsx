import { useSelectedPlanet } from '../../../contexts/SelectedPlanetContext';
import { useSpeedControl } from '../../../contexts/SpeedControlContext';
import { useCameraContext } from '../../../contexts/CameraContext';
import { Button } from '@nextui-org/react';
import { IconX } from '@tabler/icons-react';

export default function ExitViewButton() {
  const [selectedPlanet, setSelectedPlanet] = useSelectedPlanet();
  const { restoreSpeedFactor } = useSpeedControl();
  const { setCameraState } = useCameraContext();

  const handleExitDetailMode = () => {
    setSelectedPlanet(null);
    restoreSpeedFactor();
    setCameraState('MOVING_TO_HOME');
  };

  if (!selectedPlanet) return null;

  return (
    <Button color="danger" variant="flat" onPress={handleExitDetailMode}>
      <IconX /> Exit Detail View
    </Button>
  );
}
