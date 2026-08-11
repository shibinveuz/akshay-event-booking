import Tickets from "./widgets/tickets/Tickets";

export const metadata = {
  title: "GITEX NIGERIA 2026 | Tickets",
  description: "Choose your GITEX Nigeria 2026 pass.",
};

const dummyTickets = [
  {
    id: 1,
    title: "TEST1",
    category: "visitor",
    price: "FREE",
    type: "free",
    className: "ticket-bg-green",
    features: ["2 Day Access to Startup Festival"],
  },
];

export default function HomePage() {
  return <Tickets tickets={dummyTickets} />;
}
