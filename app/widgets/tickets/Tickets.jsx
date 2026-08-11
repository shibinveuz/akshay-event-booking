import TicketTabs from "./TicketTabs";

export default function Tickets({ tickets = [] }) {
  return (
    <section className="ticket-body">
      <div className="container">
        <TicketTabs tickets={tickets} />
      </div>
    </section>
  );
}
