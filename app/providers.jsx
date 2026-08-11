"use client";

import { CurrencyProvider } from "@/app/context/CurrencyContext";

export default function Providers({ children }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
