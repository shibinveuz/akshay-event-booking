"use client";

import { useMemo, useState } from "react";

import TicketCardView from "./TicketCardView";
import TicketCompareView from "./TicketCompareView";

export default function TicketTabs({ tickets = [] }) {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("card");

  const filteredTickets = useMemo(() => {
    if (filter === "all") {
      return tickets;
    }

    return tickets.filter((ticket) => ticket.category === filter);
  }, [filter, tickets]);

  return (
    <>
      <div className="ticket-catrgry-wrap">
        <div className="left-visitor-ticket-out">
          <button
            type="button"
            className={`btn ticket-btn ticket-all ${
              filter === "all" ? "active" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={`btn ticket-btn ticket-visitor-pass ${
              filter === "visitor" ? "active" : ""
            }`}
            onClick={() => setFilter("visitor")}
          >
            Visitor Pass
          </button>

          <button
            type="button"
            className={`btn ticket-btn ticket-conference-pass ${
              filter === "conference" ? "active" : ""
            }`}
            onClick={() => setFilter("conference")}
          >
            Conference Passes
          </button>
        </div>

        <div className="d-flex w-100 justify-content-lg-end justify-content-center gap-2 align-items-center">
          <div className="tab-wrapper">
            <div className="tabs">
              <div
                className="slider"
                style={{
                  transform:
                    view === "compare" ? "translateX(100%)" : "translateX(0)",
                }}
              />

              <button
                type="button"
                className={`tab-btn ${view === "card" ? "active" : ""}`}
                onClick={() => setView("card")}
              >
                Card View
              </button>

              <button
                type="button"
                className={`tab-btn ${view === "compare" ? "active" : ""}`}
                onClick={() => setView("compare")}
              >
                Compare View
              </button>
            </div>
          </div>

          <div className="group-ticket">
            <button
              onClick={() =>
                window.open(
                  "https://event.gitexnigeria.ng/2026-visitor-interest",
                  "_blank",
                )
              }
              type="button"
              className="group-ticket-btn"
            >
              Group Ticket
            </button>
          </div>

          {/* <div className="group-ticket">
            <Link
              href="/party-form"
              className="group-ticket-btn party-ticket-btn"
            >
              Party Ticket
            </Link>
          </div> */}
        </div>
      </div>

      {view === "card" ? (
        <TicketCardView tickets={filteredTickets} />
      ) : (
        <TicketCompareView tickets={filteredTickets} />
      )}
    </>
  );
}
