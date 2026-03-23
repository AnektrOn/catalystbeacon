import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';

const ConstellationPositionsContext = createContext(null);

export function useConstellationPositions() {
  const ctx = useContext(ConstellationPositionsContext);
  if (!ctx) throw new Error('useConstellationPositions must be used within ConstellationPositionsProvider');
  return ctx;
}

export const ConstellationPositionsProvider = ({ children }) => {
  const positionsRef = useRef({});
  const [snapshot, setSnapshot] = useState({});
  const throttleRef = useRef(null);

  const setConstellationPosition = useCallback((key, pos) => {
    positionsRef.current[key] = pos;
    if (!throttleRef.current) {
      throttleRef.current = setTimeout(() => {
        setSnapshot({ ...positionsRef.current });
        throttleRef.current = null;
      }, 160);
    }
  }, []);

  useEffect(() => () => clearTimeout(throttleRef.current), []);

  const value = useMemo(() => ({
    constellationPositions: snapshot,
    positionsRef,
    setConstellationPosition,
  }), [snapshot, setConstellationPosition]);

  return (
    <ConstellationPositionsContext.Provider value={value}>
      {children}
    </ConstellationPositionsContext.Provider>
  );
};
