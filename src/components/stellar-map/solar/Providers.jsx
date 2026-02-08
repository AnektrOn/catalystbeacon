import React from 'react';
import { SelectedNodeProvider } from './contexts/SelectedNodeContext';
import { SpeedControlProvider } from './contexts/SpeedControlContext';
import { NodePositionsProvider } from './contexts/NodePositionsContext';
import { CameraProvider } from './contexts/CameraContext';
import { FocusProvider } from './contexts/FocusContext';
import { FamilyPositionsProvider } from './contexts/FamilyPositionsContext';
import { ConstellationPositionsProvider } from './contexts/ConstellationPositionsContext';
import { CompletionRefreshProvider } from './contexts/CompletionRefreshContext';
import { NextUIProvider } from '@nextui-org/react';

export default function Providers({ children }) {
  return (
    <NextUIProvider>
      <SelectedNodeProvider>
        <SpeedControlProvider>
          <NodePositionsProvider>
            <FamilyPositionsProvider>
              <ConstellationPositionsProvider>
                <FocusProvider>
                  <CompletionRefreshProvider>
                    <CameraProvider>{children}</CameraProvider>
                  </CompletionRefreshProvider>
                </FocusProvider>
              </ConstellationPositionsProvider>
            </FamilyPositionsProvider>
          </NodePositionsProvider>
        </SpeedControlProvider>
      </SelectedNodeProvider>
    </NextUIProvider>
  );
}
