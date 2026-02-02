import React, { createContext, useContext, useState } from 'react';

const CameraContext = createContext(null);

export const CameraProvider = ({ children }) => {
  const [cameraState, setCameraState] = useState('FREE');

  return (
    <CameraContext.Provider value={{ cameraState, setCameraState }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCameraContext = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCameraContext must be used within a CameraProvider');
  }
  return context;
};
