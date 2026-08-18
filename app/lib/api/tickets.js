import "server-only";
import { cache } from "react";

const TICKETS_PATH = "/microsite/v2/tickets";
const DEFAULT_FREE_TICKET_NAME = "TEST1";

export function selectPrimaryFreeTicket(tickets = []) {
  const configuredTicketId = process.env.FREE_TICKET_ID?.trim();
  const configuredTicketName = (
    process.env.FREE_TICKET_NAME || DEFAULT_FREE_TICKET_NAME
  )
    .trim()
    .toLowerCase();

  return tickets.find((ticket) => {
    if (!ticket.is_free || !ticket.is_available) return false;

    if (configuredTicketId) {
      return String(ticket.id) === configuredTicketId;
    }

    const ticketNames = [ticket.display_ticket_name, ticket.ticket_name]
      .filter(Boolean)
      .map((name) => name.trim().toLowerCase());

    return ticketNames.includes(configuredTicketName);
  }) || null;
}

function getBackendUrl(path) {
  const baseUrl = process.env.BACKEND_BASE_URL;

  if (!baseUrl) {
    throw new Error("BACKEND_BASE_URL is not configured on the server.");
  }

  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export const getTickets = cache(async function getTickets() {
  try {
    const response = await fetch(getBackendUrl(TICKETS_PATH), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`Ticket API request failed with status ${response.status}.`);
      return { tickets: [] };
    }

    const data = await response.json();

    if (!Array.isArray(data?.tickets)) {
      console.warn("Ticket API returned an invalid response structure.");
      return { tickets: [] };
    }

    return data;
  } catch (error) {
    console.error("Error fetching tickets from backend:", error);
    return { tickets: [] };
  }
});

export const getTicketAvailability = cache(async function getTicketAvailability(ticketEncryptedId) {
  if (!ticketEncryptedId) return null;

  try {
    const response = await fetch(
      getBackendUrl("microsite/v2/check-ticket-availability"),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantities: { [ticketEncryptedId]: 1 },
          code: "",
          invite_code: "",
          exhibitor_invite_id: "",
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!response.ok) {
      console.warn(`Ticket availability API returned status ${response.status}.`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Unable to check ticket availability:", error);
    return null;
  }
});

export const getPrimaryFreeTicketConfiguration = cache(async function getPrimaryFreeTicketConfiguration() {
  const data = await getTickets();
  const listedTicket = selectPrimaryFreeTicket(data?.tickets || []);

  if (!listedTicket?.ticket_encrypted_id) return null;

  const availability = await getTicketAvailability(
    listedTicket.ticket_encrypted_id,
  );

  if (!availability?.all_available) return null;

  const availableTickets = Array.isArray(availability.ticket_data)
    ? availability.ticket_data
    : [];
  const ticket =
    availableTickets.find(
      (item) => String(item.id) === String(listedTicket.id),
    ) || null;

  return ticket ? { ticket, availability } : null;
});
