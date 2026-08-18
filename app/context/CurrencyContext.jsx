"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState("NGN");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("app_currency");
      if (saved === "NGN" || saved === "USD") {
        setCurrencyState(saved);
      }
    } catch {
      // localStorage may fail in restricted environment
    }
  }, []);

  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem("app_currency", newCurrency);
    } catch {
      // ignore
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
}
