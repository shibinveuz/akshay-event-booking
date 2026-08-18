"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useAuthState } from "@/app/context/AuthStateContext";

export default function HeaderControls({ isAuthenticated = false }) {
  const pathname = usePathname();

  const { currency, setCurrency } = useCurrency();
  const { authenticated: clientAuthState, setAuthenticated } = useAuthState();
  const authenticated = clientAuthState ?? isAuthenticated;

  useEffect(() => {
    if (clientAuthState !== isAuthenticated) {
      setAuthenticated(isAuthenticated);
    }
  }, [isAuthenticated, clientAuthState, setAuthenticated]);

  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";

  const showCurrencySwitcher = [
    "/",
    "/registration",
    "/registration-summary",
  ].includes(pathname);

  const action = isLoginPage
    ? null
    : authenticated
      ? {
          href: "/visitor-portal",
          label: "Profile Dashboard",
          dashboard: true,
        }
      : {
          href: "/login",
          label: "Login",
          dashboard: false,
        };

  return (
    <div className="top-header-second">
      <div className="col-md-6 left-top-header-sec">
        {isHomePage ? (
          <Link href="/">GITEX NIGERIA 2026</Link>
        ) : (
          <Link href="/" className="header-home-link">
            <House size={18} fill="currentColor" aria-hidden="true" />

            <span>Home</span>
          </Link>
        )}
      </div>

      <div className="header-controls">
        {showCurrencySwitcher && (
          <div className="currency-switcher" aria-label="Currency selector">
            <div className="currency-tabs">
              <div
                className="currency-slider"
                style={{
                  transform:
                    currency === "USD" ? "translateX(100%)" : "translateX(0)",
                }}
              />

              {["NGN", "USD"].map((code) => (
                <button
                  key={code}
                  type="button"
                  className={`currency-btn ${
                    currency === code ? "active" : ""
                  }`}
                  onClick={() => setCurrency(code)}
                  aria-pressed={currency === code}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}

        {action && (
          <div
            className={`right-top-header-sec${
              action.dashboard ? " header-dashboard-action" : ""
            }`}
          >
            <Link href={action.href} className="btn">
              {action.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
