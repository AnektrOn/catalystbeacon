import React, { createContext, useContext, useState } from 'react';

const SelectedPlanetContext = createContext([null, () => {}]);

export const useSelectedPlanet = () => useContext(SelectedPlanetContext);

export const SelectedPlanetProvider = ({ children }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  return (
    <SelectedPlanetContext.Provider value={[selectedPlanet, setSelectedPlanet]}>
      {children}
    </SelectedPlanetContext.Provider>
  );
};
