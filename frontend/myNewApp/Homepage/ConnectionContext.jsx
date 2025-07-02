import React, { createContext, useContext } from "react";
import useConnections from "./UseConnection.jsx";

const ConnectionContext = createContext(null);

export const ConnectionProvider = ({ children }) => {
  const connectionData = useConnections();

  return (
    <ConnectionContext.Provider value={connectionData}>
      {children}
    </ConnectionContext.Provider>
  );
};

// ✅ Add a safety check here
export const useConnectionContext = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnectionContext must be used within a ConnectionProvider");
  }
  return context;
};
