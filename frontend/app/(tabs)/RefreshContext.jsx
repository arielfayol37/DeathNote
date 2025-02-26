import React, { createContext, useState } from 'react';

export const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [shouldRefreshNotes, setShouldRefreshNotes] = useState(false);

  return (
    <RefreshContext.Provider value={{ shouldRefreshNotes, setShouldRefreshNotes }}>
      {children}
    </RefreshContext.Provider>
  );
};

export default RefreshProvider;