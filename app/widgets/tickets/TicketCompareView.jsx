"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import noTicketsAsset from "../../../public/assets/img/ticket.png";
import Image from "next/image";
import { useCurrency } from "@/app/context/CurrencyContext";

const noTickets =
  typeof noTicketsAsset === "string" ? noTicketsAsset : noTicketsAsset.src;

const comparisonFeatures = [
  "Full Exhibition Access",
  "Networking Events",
  "Main Stage",
  "Conference Sessions",
  "Masterclasses",
  "Networking Lounges",
];

export default function TicketCompareView({ tickets = [] }) {
  const { currency } = useCurrency();

  if (!tickets.length) {
    return (
      <div className="tab-content active mt-5 no-ticket-body" id="compareView">
        <div className="no-ticket-div d-flex gap-2 align-items-center justify-content-center">
          <Image width={100} height={100} src={noTickets} alt="" />
          <h3>NO TICKETS ARE AVAILABLE</h3>
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
            {tickets.map((ticket) => {
              const isFree =
                ticket.price === "FREE" ||
                Number(ticket.priceAmount || ticket.price) === 0;
              const rawPrice =
                typeof ticket.price === "string"
                  ? ticket.price.replace(/\s*(NGN|USD)$/i, "").trim()
                  : ticket.price;
              const displayPrice = isFree
                ? "FREE"
                : `${rawPrice}${currency ? ` ${currency}` : ""}`;

              return (
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
                          <h3 className="price">{displayPrice}</h3>
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
