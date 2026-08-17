"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarPlus, Download, MapPin, IdCard, UserPlus } from "lucide-react";
import VisaApplicationModal from "@/app/widgets/registration/VisaApplicationModal";

export default function EventInfoSection({ data, countries = [] }) {
  const event = data.event || {};
  const [showVisaModal, setShowVisaModal] = useState(false);

  return (
    <div className="event-info-section">
      <div className="event-info-grid">
        <div className="event-details">
          <div className="event-info-title">Event Information</div>

          <div className="event-date-time">{event.date}</div>

          <div className="event-location">
            <MapPin size={17} />

            <a
              href={event.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {event.locationLabel || "Location"}
            </a>
          </div>

          <div className="event-actions">
            <a
              href={event.calendarUrl}
              className="add-calendar-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarPlus size={17} />
              ADD TO CALENDAR
            </a>
          </div>
        </div>

        <div className="event-actions-right">
          <a
            href={data.confirmationEmailUrl}
            className="action-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={17} />
            DOWNLOAD CONFIRMATION EMAIL
          </a>

          <Link href={data.newRegistrationUrl || "/"} className="action-link">
            <UserPlus size={17} />
            START NEW REGISTRATION
          </Link>

          <button
            type="button"
            className="action-link"
            onClick={() => setShowVisaModal(true)}
          >
            <IdCard size={17} />
            Apply for Visa Invitation Letter
          </button>
        </div>
      </div>

      <VisaApplicationModal
        show={showVisaModal}
        onHide={() => setShowVisaModal(false)}
        countries={countries}
        registrationId={data.registrationId}
        accessContext="confirmation"
      />
    </div>
  );
}
