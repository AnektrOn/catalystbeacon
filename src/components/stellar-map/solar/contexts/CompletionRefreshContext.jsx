import React, { createContext, useContext, useState, useCallback } from 'react';

const CompletionRefreshContext = createContext(null);

export function useCompletionRefresh() {
  const ctx = useContext(CompletionRefreshContext);
  return ctx;
}

export const CompletionRefreshProvider = ({ children }) => {
  const [version, setVersion] = useState(0);
  const increment = useCallback(() => setVersion((v) => v + 1), []);
  return (
    <CompletionRefreshContext.Provider value={{ completionVersion: version, incrementCompletionVersion: increment }}>
      {children}
    </CompletionRefreshContext.Provider>
  );
};
