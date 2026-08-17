"use client";

import { CurrencyProvider } from "@/app/context/CurrencyContext";
import { AuthStateProvider } from "@/app/context/AuthStateContext";

export default function Providers({ children }) {
  return (
    <AuthStateProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </AuthStateProvider>
  );
}
