import TicketCard from "./TicketCard";

export default function TicketCardView({ tickets = [] }) {
  if (!tickets.length) {
    return (
      <div className="tab-content active" id="cardView">
        <div className="text-center py-5">
          <p>No tickets available.</p>
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
