import React from 'react';
import { SelectedNodeProvider } from './contexts/SelectedNodeContext';
import { SpeedControlProvider } from './contexts/SpeedControlContext';
import { NodePositionsProvider } from './contexts/NodePositionsContext';
import { CameraProvider } from './contexts/CameraContext';
import { NextUIProvider } from '@nextui-org/react';

export default function Providers({ children }) {
  return (
    <NextUIProvider>
      <SelectedNodeProvider>
        <SpeedControlProvider>
          <NodePositionsProvider>
            <CameraProvider>{children}</CameraProvider>
          </NodePositionsProvider>
        </SpeedControlProvider>
      </SelectedNodeProvider>
    </NextUIProvider>
  );
}
