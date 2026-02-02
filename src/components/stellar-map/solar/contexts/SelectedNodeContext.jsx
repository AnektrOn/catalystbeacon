import React, { createContext, useContext, useState } from 'react';

const SelectedNodeContext = createContext([null, () => {}]);

export const useSelectedNode = () => useContext(SelectedNodeContext);

export const SelectedNodeProvider = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <SelectedNodeContext.Provider value={[selectedNode, setSelectedNode]}>
      {children}
    </SelectedNodeContext.Provider>
  );
};
