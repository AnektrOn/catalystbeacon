import React, { createContext, useContext, useState } from 'react';

/**
 * Focus for camera: 'sun' | family | constellation | 'node'
 * When 'node', camera targets the selected node (from SelectedNodeContext).
 */
const FocusContext = createContext(null);

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocus must be used within FocusProvider');
  return ctx;
}

export const FocusProvider = ({ children }) => {
  const [focus, setFocus] = useState('sun');

  return (
    <FocusContext.Provider value={{ focus, setFocus }}>
      {children}
    </FocusContext.Provider>
  );
};
