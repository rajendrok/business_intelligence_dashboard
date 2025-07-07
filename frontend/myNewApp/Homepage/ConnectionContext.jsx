import React, { createContext, useContext, useState } from "react";
import useConnections from "./UseConnection";

const ConnectionContext = createContext(null);

export const ConnectionProvider = ({ children }) => {
  const connectionData = useConnections();
  const [columnsBySource, setColumnsBySource] = useState({});

  return (
    <ConnectionContext.Provider value={{ ...connectionData, columnsBySource, setColumnsBySource }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnectionContext = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnectionContext must be used within a ConnectionProvider");
  }
  return context;
};
