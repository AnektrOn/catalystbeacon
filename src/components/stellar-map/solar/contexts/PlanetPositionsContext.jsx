import React, { createContext, useState, useContext, useCallback } from 'react';

const PlanetPositionsContext = createContext({
  planetPositions: {},
  setPlanetPosition: () => {},
});

export const PlanetPositionsProvider = ({ children }) => {
  const [planetPositions, setPlanetPositions] = useState({});

  const setPlanetPosition = useCallback((name, position) => {
    setPlanetPositions((prev) => ({ ...prev, [name]: position }));
  }, []);

  return (
    <PlanetPositionsContext.Provider value={{ planetPositions, setPlanetPosition }}>
      {children}
    </PlanetPositionsContext.Provider>
  );
};

export const usePlanetPositions = () => useContext(PlanetPositionsContext);
