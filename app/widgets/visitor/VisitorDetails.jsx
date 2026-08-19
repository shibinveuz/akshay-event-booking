"use client";

import { useState } from "react";
import BadgeInstructions from "./BadgeInstructions";
import VisitorBadgePreview from "./VisitorBadgePreview";
import VisitorEventInfo from "./VisitorEventInfo";
import VisitorProfileDetails from "./VisitorProfileDetails";

export default function VisitorDetails({
  visitor,
  countries = [],
  loadCountries,
}) {
  const [editingProfile, setEditingProfile] = useState(false);

  const handleStartEditing = () => {
    if (typeof loadCountries === "function") {
      loadCountries();
    }
    setEditingProfile(true);
  };

  return (
    <div className="tab-content" id="visitor">
      <div className="content-area">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome, {visitor.firstName} {visitor.lastName}
          </h1>

          <p className="welcome-text">
            Manage your event experience effortlessly – access your registration
            details, preview your badge, and personalise your profile for
            seamless matchmaking.
          </p>
        </div>

        <div className="event-info-section">
          <div className="event-info-grid">
            <VisitorBadgePreview visitor={visitor} />

            <VisitorEventInfo
              visitor={visitor}
              countries={countries}
              onUpdateRegistration={handleStartEditing}
            />
          </div>
        </div>

        <BadgeInstructions />

        <VisitorProfileDetails
          visitor={visitor}
          countries={countries}
          editing={editingProfile}
          onEditingChange={(isEditing) => {
            if (isEditing && typeof loadCountries === "function") {
              loadCountries();
            }
            setEditingProfile(isEditing);
          }}
          loadCountries={loadCountries}
        />
      </div>
    </div>
  );
}
