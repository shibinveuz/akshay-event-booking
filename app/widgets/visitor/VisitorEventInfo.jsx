"use client";

import Link from "next/link";
import { useState } from "react";

import {
  CalendarPlus,
  FileDown,
  IdCard,
  MapPin,
  PenSquare,
  UserPlus,
} from "lucide-react";

export default function VisitorEventInfo({
  visitor,
  onUpdateRegistration,
}) {
  const [visaMessage, setVisaMessage] = useState("");

  const uid = visitor?.uid || visitor?.id;
  const visaDownloadUrl =
    visitor?.visaUrl?.includes("/download/")
      ? visitor.visaUrl
      : uid && visitor?.visaRequested
        ? `/visitor-portal/download/visa?uid=${encodeURIComponent(uid)}`
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
    <div className="event-details">
      <div className="visitor-party-section">
        <div>
          <h6>Selected Ticket</h6>

          <h4>{visitor.ticket?.name || "Visitor Pass"}</h4>
        </div>
      </div>

      <div className="event-info-title">Event Information</div>

      {visitor.events?.map((event) => (
        <div className="loc-dtl-div" key={event.id}>
          <div className="event-date-time">
            {event.date} | {event.time}
          </div>

          <div className="event-location">
            <MapPin size={17} />

            <a
              href={event.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {event.location}
            </a>
          </div>
        </div>
      ))}

      <div className="event-actions-right">
        <div className="event-info-title">Action Links</div>

        <div className="event-actions">
          <a
            href={visitor.events?.[0]?.calendarUrl || undefined}
            className="add-calendar-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!visitor.events?.[0]?.calendarUrl}
          >
            <CalendarPlus size={17} />
            ADD TO CALENDAR
          </a>
        </div>

        <a
          href={visitor.confirmationEmailUrl || undefined}
          className="action-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!visitor.confirmationEmailUrl}
        >
          <FileDown size={17} />
          DOWNLOAD CONFIRMATION EMAIL
        </a>

        <Link href="/" className="action-link">
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

        <a
          href="#visitorRegform"
          className="action-link"
          onClick={onUpdateRegistration}
        >
          <PenSquare size={17} />
          UPDATE REGISTRATION
        </a>
      </div>
    </div>
  );
}
