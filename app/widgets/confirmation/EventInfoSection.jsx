"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarPlus, Download, MapPin, IdCard, UserPlus } from "lucide-react";

export default function EventInfoSection({ data }) {
  const event = data?.event || {};
  const [visaMessage, setVisaMessage] = useState("");

  const registrationId = data?.registrationId;
  const visaDownloadUrl = data?.visaUrl?.includes("/download/")
    ? data.visaUrl
    : data?.visaRequested && registrationId
      ? `/confirmation/download/visa?id=${encodeURIComponent(registrationId)}`
      : null;

  const handleVisaDownloadClick = (e) => {
    if (!visaDownloadUrl) {
      e.preventDefault();
      setVisaMessage(
        "Visa Invitation Letter is not available yet. Please ensure your visa details are completed in your profile.",
      );
    } else {
      setVisaMessage("");
    }
  };

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
            href={data?.confirmationEmailUrl}
            className="action-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={17} />
            DOWNLOAD CONFIRMATION EMAIL
          </a>

          <Link href={data?.newRegistrationUrl || "/"} className="action-link">
            <UserPlus size={17} />
            START NEW REGISTRATION
          </Link>

          {visaDownloadUrl ? (
            <a
              href={visaDownloadUrl}
              className="action-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IdCard size={17} />
              Download Visa Invitation Letter
            </a>
          ) : (
            <button
              type="button"
              className="action-link"
              onClick={handleVisaDownloadClick}
            >
              <IdCard size={17} />
              Download Visa Invitation Letter
            </button>
          )}

          {visaMessage && (
            <div
              className="alert alert-warning py-2 px-3 mt-2 text-start"
              style={{ fontSize: "13px" }}
            >
              {visaMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
