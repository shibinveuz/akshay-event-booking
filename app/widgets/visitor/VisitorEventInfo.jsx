"use client";

import Link from "next/link";
import { useState } from "react";
import VisaApplicationModal from "@/app/widgets/registration/VisaApplicationModal";

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
  countries = [],
  onUpdateRegistration,
}) {
  const [showVisaModal, setShowVisaModal] = useState(false);

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

        <button
          type="button"
          className="action-link"
          onClick={() => setShowVisaModal(true)}
        >
          <IdCard size={17} />
          Apply for Visa Invitation Letter
        </button>

        <a
          href="#visitorRegform"
          className="action-link"
          onClick={onUpdateRegistration}
        >
          <PenSquare size={17} />
          UPDATE REGISTRATION
        </a>
      </div>

      <VisaApplicationModal
        show={showVisaModal}
        onHide={() => setShowVisaModal(false)}
        countries={countries}
        registrationId={visitor.uid || visitor.id}
        initialValues={visitor.visaForm}
        accessContext="visitor"
      />
    </div>
  );
}
