import React, { createContext, useContext, useState, useCallback } from 'react';

const ConstellationPositionsContext = createContext(null);

export function useConstellationPositions() {
  const ctx = useContext(ConstellationPositionsContext);
  if (!ctx) throw new Error('useConstellationPositions must be used within ConstellationPositionsProvider');
  return ctx;
}

export const ConstellationPositionsProvider = ({ children }) => {
  const [positions, setPositions] = useState({});

  const setConstellationPosition = useCallback((key, [x, y, z]) => {
    setPositions((prev) => ({ ...prev, [key]: [x, y, z] }));
  }, []);

  return (
    <ConstellationPositionsContext.Provider value={{ constellationPositions: positions, setConstellationPosition }}>
      {children}
    </ConstellationPositionsContext.Provider>
  );
};
