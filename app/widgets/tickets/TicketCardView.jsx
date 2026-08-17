import TicketCard from "./TicketCard";
import noTicketsAsset from "../../../public/assets/img/ticket.png";
import Image from "next/image";

const noTickets =
  typeof noTicketsAsset === "string" ? noTicketsAsset : noTicketsAsset.src;

export default function TicketCardView({ tickets = [] }) {
  if (!tickets.length) {
    return (
      <div className="tab-content active no-ticket-body" id="cardView">
        <div className="no-ticket-div d-flex gap-2 align-items-center justify-content-center">
          <Image width={100} height={100} src={noTickets} alt="" />
          <h3>NO TICKETS ARE AVAILABLE</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content active" id="cardView">
      <div className="row g-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
