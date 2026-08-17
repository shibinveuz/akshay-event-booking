"use client";

import { createContext, useContext, useMemo, useState } from "react";

const AuthStateContext = createContext(null);

export function AuthStateProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(null);
  const value = useMemo(
    () => ({ authenticated, setAuthenticated }),
    [authenticated],
  );

  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw new Error("useAuthState must be used within an AuthStateProvider");
  }

  return context;
}
