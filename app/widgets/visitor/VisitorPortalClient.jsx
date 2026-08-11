"use client";

import { useState } from "react";

import VisitorSidebar from "./VisitorSidebar";
import VisitorHeader from "./VisitorHeader";
import VisitorDetails from "./VisitorDetails";
import UserHistory from "./UserHistory";

export default function VisitorPortalClient({ visitor, history }) {
  const [activeTab, setActiveTab] = useState("visitor");

  return (
    <div className="dashboard">
      <VisitorSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="main-dashboard">
        <VisitorHeader visitor={visitor} />

        {activeTab === "visitor" && <VisitorDetails visitor={visitor} />}

        {activeTab === "user-history" && <UserHistory history={history} />}
      </div>
    </div>
  );
}
