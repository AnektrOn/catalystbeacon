import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';

const FamilyPositionsContext = createContext(null);

export function useFamilyPositions() {
  const ctx = useContext(FamilyPositionsContext);
  if (!ctx) throw new Error('useFamilyPositions must be used within FamilyPositionsProvider');
  return ctx;
}

export const FamilyPositionsProvider = ({ children }) => {
  // Primary store: mutable ref — written every frame without triggering React renders
  const positionsRef = useRef({});
  // Throttled snapshot for React consumers outside the R3F Canvas (e.g. minimap)
  const [snapshot, setSnapshot] = useState({});
  const throttleRef = useRef(null);

  const setFamilyPosition = useCallback((familyKey, pos) => {
    positionsRef.current[familyKey] = pos;
    // Batch React state updates to ~6fps max to keep minimap alive without 60fps re-renders
    if (!throttleRef.current) {
      throttleRef.current = setTimeout(() => {
        setSnapshot({ ...positionsRef.current });
        throttleRef.current = null;
      }, 160);
    }
  }, []);

  useEffect(() => () => clearTimeout(throttleRef.current), []);

  const value = useMemo(() => ({
    familyPositions: snapshot,
    positionsRef,
    setFamilyPosition,
  }), [snapshot, setFamilyPosition]);

  return (
    <FamilyPositionsContext.Provider value={value}>
      {children}
    </FamilyPositionsContext.Provider>
  );
};
