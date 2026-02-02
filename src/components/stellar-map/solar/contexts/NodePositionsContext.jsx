import React, { createContext, useState, useContext, useCallback } from 'react';

const NodePositionsContext = createContext({
  nodePositions: {},
  setNodePosition: () => {},
});

export const NodePositionsProvider = ({ children }) => {
  const [nodePositions, setNodePositions] = useState({});

  const setNodePosition = useCallback((nodeId, position) => {
    setNodePositions((prev) => ({ ...prev, [nodeId]: position }));
  }, []);

  return (
    <NodePositionsContext.Provider value={{ nodePositions, setNodePosition }}>
      {children}
    </NodePositionsContext.Provider>
  );
};

export const useNodePositions = () => useContext(NodePositionsContext);
