import { Suspense } from "react";
import {
  getTickets,
  selectPrimaryFreeTicket,
} from "./lib/api/tickets";
import Tickets from "./widgets/tickets/Tickets";
import Loader from "@/app/components/common/loader/Loader";

export const metadata = {
  title: "GITEX NIGERIA 2026 | Tickets",
  description: "Choose your GITEX Nigeria 2026 pass.",
};

// Ticket availability is request-time data, so render this page through SSR.
export const dynamic = "force-dynamic";

function mapTicket(ticket) {
  const includedFeatures = ticket.sessions
    ?.filter((session) => session.is_included)
    .map((session) => session.title)
    .filter(Boolean);

  return {
    id: ticket.id,
    title: ticket.display_ticket_name || ticket.ticket_name || "Ticket",
    category: ticket.category_type_name?.toLowerCase() || "visitor",
    price: ticket.is_free ? "FREE" : String(ticket.price_amount ?? ""),
    type: ticket.is_free ? "free" : "paid",
    className: ticket.class_name || (ticket.is_free ? "ticket-bg-green" : ""),
    description: ticket.short_description || ticket.description || "",
    features: includedFeatures || [],
  };
}

async function HomeTicketsContent() {
  const data = await getTickets();
  const freeTicket = selectPrimaryFreeTicket(data?.tickets || []);
  const tickets = freeTicket ? [mapTicket(freeTicket)] : [];

  return <Tickets tickets={tickets} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<Loader />}>
      <HomeTicketsContent />
    </Suspense>
  );
}
