import React from 'react';
import { useSpeedControl } from '../../contexts/SpeedControlContext';
import { useSelectedPlanet } from '../../contexts/SelectedPlanetContext';
import { useCameraContext } from '../../contexts/CameraContext';
import { Button } from '@nextui-org/react';

export default function PlanetMenu({ planets }) {
  const [selectedPlanet, setSelectedPlanet] = useSelectedPlanet();
  const { overrideSpeedFactor } = useSpeedControl();
  const { cameraState, setCameraState } = useCameraContext();

  const handleSelect = (planetName) => {
    const selected = planets.find((p) => p.name === planetName);
    setSelectedPlanet(selected ?? null);
    overrideSpeedFactor();
    setCameraState('ZOOMING_IN');
  };

  const isVisible = cameraState === 'FREE' || cameraState === 'INTRO_ANIMATION';

  return (
    <div
      className="absolute bottom-5 left-5 right-5 z-10 transition-transform duration-300 ease-out"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(170%)',
      }}
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {planets.map((planet) => (
          <Button
            key={planet.id}
            variant="flat"
            size="sm"
            onPress={() => handleSelect(planet.name)}
            isDisabled={selectedPlanet?.id === planet.id}
            className="bg-white/20 text-white border border-white/40 hover:bg-white/30 data-[hover=true]:bg-white/30 backdrop-blur-sm"
          >
            {planet.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
