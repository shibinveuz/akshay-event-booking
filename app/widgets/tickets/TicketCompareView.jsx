import Link from "next/link";
import { Check, X } from "lucide-react";

const comparisonFeatures = [
  "Full Exhibition Access",
  "Networking Events",
  "Main Stage",
  "Conference Sessions",
  "Masterclasses",
  "Networking Lounges",
];

export default function TicketCompareView({ tickets = [] }) {
  if (!tickets.length) {
    return (
      <div className="tab-content active mt-5">
        <div className="text-center py-5">
          <p>No tickets available for comparison.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content active mt-5" id="compareView">
      <div className="cmp-row">
        <div className="cmp-row_first">
          <div className="cm-header no-ab-de d-flex align-items-center justify-content-center feature-main-header">
            <h6 className="cm-features">Features</h6>
          </div>

          <div className="cmp-accss_rows-main-wrapper">
            {comparisonFeatures.map((feature) => (
              <div className="cmp-accss_rows" key={feature}>
                <h5>{feature}</h5>
              </div>
            ))}
          </div>
        </div>

        <div className="cmp-row_second">
          <div className="cmp-slider-track">
            {tickets.map((ticket) => (
              <div
                className="cmp-ticket-wrapper ticket-bg-green ticket-free"
                key={ticket.id}
              >
                {ticket.badge && (
                  <div className="ticket-offer-tag">
                    <span>{ticket.badge}</span>
                  </div>
                )}

                <div className="cm-header">
                  <div className="pass-header premium">
                    <div className="pass-type">{ticket.title}</div>
                  </div>

                  <div className="pass-price-out">
                    <div className="rate-count justify-content-center align-items-center flex-column gap-1">
                      <div className="price-tag">
                        <h3 className="price">{ticket.price}</h3>
                      </div>

                      <Link
                        href={`/registration?ticket_id=${ticket.id}`}
                        className="premium-button"
                      >
                        Get your Pass
                      </Link>
                    </div>
                  </div>
                </div>

                {comparisonFeatures.map((feature) => {
                  const isAvailable =
                    ticket.features?.includes(feature) ?? false;

                  return (
                    <div
                      className={`cmp-check-box-div ${
                        isAvailable ? "cmp-uncheck-box-div" : ""
                      }`}
                      key={feature}
                    >
                      {isAvailable ? (
                        <Check size={18} className="tick-mark" />
                      ) : (
                        <X size={18} className="tick-mark tick-wrong" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
