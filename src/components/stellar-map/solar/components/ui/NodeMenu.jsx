import React from 'react';
import { useSelectedNode } from '../../contexts/SelectedNodeContext';
import { useCameraContext } from '../../contexts/CameraContext';
import { Button } from '@nextui-org/react';

export default function NodeMenu({ nodesWithOrbits }) {
  const [selectedNode, setSelectedNode] = useSelectedNode();
  const { setCameraState, cameraState } = useCameraContext();

  const handleSelect = (node) => {
    setSelectedNode(node);
    setCameraState('ZOOMING_IN');
  };

  const isMenuVisible = cameraState === 'FREE' || cameraState === 'INTRO_ANIMATION';

  const nodes = nodesWithOrbits?.map((item) => item.node) ?? [];
  const uniqueByTitle = nodes.filter((n, i, arr) => arr.findIndex((x) => x.id === n.id) === i);

  return (
    <div
      className="absolute bottom-5 left-5 right-5 z-10 transition-transform duration-300 ease-out"
      style={{
        transform: isMenuVisible ? 'translateY(0)' : 'translateY(170%)',
      }}
    >
      <div className="flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto">
        {uniqueByTitle.map((node) => (
          <Button
            key={node.id}
            variant="flat"
            size="sm"
            onPress={() => handleSelect(node)}
            isDisabled={selectedNode?.id === node.id}
            className="bg-white/20 text-white border border-white/40 hover:bg-white/30 data-[hover=true]:bg-white/30 backdrop-blur-sm"
          >
            <span className="truncate max-w-[140px]">{node.title || node.constellation_name || node.id?.slice(0, 8)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
