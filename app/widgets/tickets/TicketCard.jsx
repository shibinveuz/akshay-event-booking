import Link from "next/link";
import { ArrowRight, CalendarDays, MoveRight } from "lucide-react";

export default function TicketCard({ ticket }) {
  return (
    <div className="col-lg-6 col-md-6 ticket-item visitor">
      <div className="ticket-container">
        <div className={`ticket-card ${ticket.className || ""}`}>
          {/* {ticket.badge && (
            <div className="ticket-offer-tag">
              <span>{ticket.badge}</span>
            </div>
          )} */}

          <div className="ticket-left">
            <h3 className="ticket-title">{ticket.title}</h3>

            <div className="floating-particles">
              {Array.from({ length: 10 }).map((_, index) => (
                <div className="particle" key={index} />
              ))}
            </div>
          </div>

          <div className="ticket-right">
            <div>
              <div>
                {/* <div className="ticket-calender">
                  <div className="calender-icon">
                    <CalendarDays size={18} />
                  </div>
                  Valid until {ticket.validUntil}
                </div> */}

                <div className="price-tag">
                  <h3 className="price">{ticket.price}</h3>
                </div>
              </div>

              {/* <button type="button" className="detail-btn">
                View Details
                <span>
                  <ArrowRight size={16} />
                </span>
              </button> */}

              <p className="ticket-subtitle">{ticket.description}</p>

              <div className="features-grid">
                {ticket.features.map((feature) => (
                  <div className="feature-item" key={feature}>
                    <div className="feature-icon">
                      <MoveRight size={16} />
                    </div>

                    <div className="feature-text">{feature}</div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={`/registration?ticket_id=${ticket.id}`}
              className="premium-button"
            >
              Get your pass
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
