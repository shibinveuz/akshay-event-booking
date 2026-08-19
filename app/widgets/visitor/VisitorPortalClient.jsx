"use client";

import { useState, useCallback } from "react";
import {
  fetchVisitorHistoryAction,
  fetchVisaCountriesAction,
} from "@/app/lib/api/visitorActions";

import VisitorSidebar from "./VisitorSidebar";
import VisitorHeader from "./VisitorHeader";
import VisitorDetails from "./VisitorDetails";
import UserHistory from "./UserHistory";

export default function VisitorPortalClient({ visitor }) {
  const [activeTab, setActiveTab] = useState("visitor");

  // History: null = not yet fetched, [] = fetched (empty or populated)
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Countries: null = not yet fetched
  const [countries, setCountries] = useState(null);

  const handleTabChange = useCallback(
    async (tab) => {
      setActiveTab(tab);

      // Lazy-load history the first time the tab is opened
      if (tab === "user-history" && history === null && !historyLoading) {
        setHistoryLoading(true);
        try {
          const data = await fetchVisitorHistoryAction();
          setHistory(data ?? []);
        } catch {
          setHistory([]);
        } finally {
          setHistoryLoading(false);
        }
      }
    },
    [history, historyLoading],
  );

  // Called by VisitorDetails the first time the Visa modal is about to open
  const loadCountries = useCallback(async () => {
    if (countries !== null) return countries;
    try {
      const data = await fetchVisaCountriesAction();
      setCountries(data ?? []);
      return data ?? [];
    } catch {
      setCountries([]);
      return [];
    }
  }, [countries]);

  return (
    <div className="dashboard">
      <VisitorSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="main-dashboard">
        <VisitorHeader visitor={visitor} />

        {activeTab === "visitor" && (
          <VisitorDetails
            visitor={visitor}
            countries={countries ?? []}
            loadCountries={loadCountries}
          />
        )}

        {activeTab === "user-history" && (
          <UserHistory history={history ?? []} loading={historyLoading} />
        )}
      </div>
    </div>
  );
}
