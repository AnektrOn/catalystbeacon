import React, { createContext, useContext, useState, useCallback } from 'react';

const FamilyPositionsContext = createContext(null);

export function useFamilyPositions() {
  const ctx = useContext(FamilyPositionsContext);
  if (!ctx) throw new Error('useFamilyPositions must be used within FamilyPositionsProvider');
  return ctx;
}

export const FamilyPositionsProvider = ({ children }) => {
  const [positions, setPositions] = useState({});

  const setFamilyPosition = useCallback((familyKey, [x, y, z]) => {
    setPositions((prev) => ({ ...prev, [familyKey]: [x, y, z] }));
  }, []);

  return (
    <FamilyPositionsContext.Provider value={{ familyPositions: positions, setFamilyPosition }}>
      {children}
    </FamilyPositionsContext.Provider>
  );
};
