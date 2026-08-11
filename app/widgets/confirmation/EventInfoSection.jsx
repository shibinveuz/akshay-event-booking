import Link from "next/link";
import { CalendarPlus, Download, MapPin, IdCard, UserPlus } from "lucide-react";

export default function EventInfoSection({ data }) {
  const event = data.event || {};

  return (
    <div className="event-info-section">
      <div className="event-info-grid">
        <div className="event-details">
          <div className="event-info-title">Event Information</div>

          <div className="event-date-time">{event.date}</div>

          <div className="event-location">
            <MapPin size={17} />

            <a
              href={event.locationUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {event.locationLabel || "Location"}
            </a>
          </div>

          <div className="event-actions">
            <a href={event.calendarUrl || "#"} className="add-calendar-link">
              <CalendarPlus size={17} />
              ADD TO CALENDAR
            </a>
          </div>
        </div>

        <div className="event-actions-right">
          <a href={data.confirmationEmailUrl || "#"} className="action-link">
            <Download size={17} />
            DOWNLOAD CONFIRMATION EMAIL
          </a>

          <Link href={data.newRegistrationUrl || "/"} className="action-link">
            <UserPlus size={17} />
            START NEW REGISTRATION
          </Link>

          <a href={data.visaUrl || "#"} className="action-link">
            <IdCard size={17} />
            Apply for Visa Invitation Letter
          </a>
        </div>
      </div>
    </div>
  );
}
