import Link from "next/link";

import {
  CalendarPlus,
  FileDown,
  IdCard,
  MapPin,
  PenSquare,
  UserPlus,
} from "lucide-react";

export default function VisitorEventInfo({ visitor }) {
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
              href={event.locationUrl || "#"}
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
          <a href="#" className="add-calendar-link">
            <CalendarPlus size={17} />
            ADD TO CALENDAR
          </a>
        </div>

        <a href="#" className="action-link">
          <FileDown size={17} />
          DOWNLOAD CONFIRMATION EMAIL
        </a>

        <Link href="/" className="action-link">
          <UserPlus size={17} />
          START NEW REGISTRATION
        </Link>

        <a href="#" className="action-link">
          <IdCard size={17} />
          Apply for Visa Invitation Letter
        </a>

        <a href="#visitorRegform" className="action-link">
          <PenSquare size={17} />
          UPDATE REGISTRATION
        </a>
      </div>
    </div>
  );
}
