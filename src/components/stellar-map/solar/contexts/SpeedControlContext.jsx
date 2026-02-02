import React, { createContext, useContext, useState } from 'react';

const SpeedControlContext = createContext(undefined);

export const useSpeedControl = () => {
  const context = useContext(SpeedControlContext);
  if (!context) {
    throw new Error('useSpeedControl must be used within a SpeedControlProvider');
  }
  return context;
};

const DEFAULT_SPEED = 0.3;

export const SpeedControlProvider = ({ children }) => {
  const [speedFactor, setSpeedFactorState] = useState(DEFAULT_SPEED);
  const [lastSpeedFactor, setLastSpeedFactor] = useState(DEFAULT_SPEED);

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
