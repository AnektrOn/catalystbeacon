import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';

const NodePositionsContext = createContext({
  nodePositions: {},
  positionsRef: { current: {} },
  setNodePosition: () => {},
});

export const NodePositionsProvider = ({ children }) => {
  const positionsRef = useRef({});
  const [snapshot, setSnapshot] = useState({});
  const throttleRef = useRef(null);

  const setNodePosition = useCallback((nodeId, position) => {
    positionsRef.current[nodeId] = position;
    if (!throttleRef.current) {
      throttleRef.current = setTimeout(() => {
        setSnapshot({ ...positionsRef.current });
        throttleRef.current = null;
      }, 160);
    }
  }, []);

  useEffect(() => () => clearTimeout(throttleRef.current), []);

  const value = useMemo(() => ({
    nodePositions: snapshot,
    positionsRef,
    setNodePosition,
  }), [snapshot, setNodePosition]);

  return (
    <NodePositionsContext.Provider value={value}>
      {children}
    </NodePositionsContext.Provider>
  );
};

export const useNodePositions = () => useContext(NodePositionsContext);
