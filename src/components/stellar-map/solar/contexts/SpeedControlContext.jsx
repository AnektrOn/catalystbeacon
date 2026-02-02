import React, { createContext, useContext, useState } from 'react';

const SpeedControlContext = createContext(undefined);

export const useSpeedControl = () => {
  const context = useContext(SpeedControlContext);
  if (!context) {
    throw new Error('useSpeedControl must be used within a SpeedControlProvider');
  }
  return context;
};

export const SpeedControlProvider = ({ children }) => {
  const [speedFactor, setSpeedFactorState] = useState(1);
  const [lastSpeedFactor, setLastSpeedFactor] = useState(1);

  const setSpeedFactor = (value) => {
    setLastSpeedFactor(speedFactor);
    setSpeedFactorState(value);
  };

  const overrideSpeedFactor = () => {
    setLastSpeedFactor(speedFactor);
    setSpeedFactorState(0);
  };

  const restoreSpeedFactor = () => {
    setSpeedFactorState(lastSpeedFactor);
  };

  return (
    <SpeedControlContext.Provider value={{ speedFactor, setSpeedFactor, overrideSpeedFactor, restoreSpeedFactor }}>
      {children}
    </SpeedControlContext.Provider>
  );
};
