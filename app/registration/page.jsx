import Registration from "@/app/widgets/registration/Registration";
import { getCountries } from "@/app/lib/api/registration";
import { getPrimaryFreeTicketConfiguration } from "@/app/lib/api/tickets";
import { mapCountryOptions } from "@/app/lib/countries";

export const metadata = {
  title: "Registration | GITEX NIGERIA 2026",
  description: "Complete your registration for GITEX Nigeria 2026.",
};

export const dynamic = "force-dynamic";

export default async function RegistrationPage() {
  const [countriesApiData, ticketConfiguration] = await Promise.all([
    getCountries().catch(() => []),
    getPrimaryFreeTicketConfiguration().catch(() => null),
  ]);

  const availability = ticketConfiguration?.availability || null;
  const availableTicket = ticketConfiguration?.ticket || null;

  // Map API ticket to frontend widget format
  const mappedSelectedTicket = availableTicket
    ? {
        id: availableTicket.id,
        encryptedId: availableTicket.ticket_encrypted_id || "",
        documentRequired: Boolean(availableTicket.document_required),
        name:
          availableTicket.display_ticket_name ||
          availableTicket.ticket_name ||
          "Ticket",
        category: availableTicket.category_type_name || "VISITOR",
        price: availableTicket.is_free ? "FREE" : availableTicket.price_amount,
        priceAmount: Number(availableTicket.price_amount || 0),
        oldPrice: availableTicket.actual_price || 0,
        currency: availability?.current_currency || "NGN",
        vat: "Incl. 7.5% VAT",
        className:
          availableTicket.class_name ||
          (availableTicket.is_free ? "ticket-bg-green" : ""),
      }
    : null;

  const productsContainer = availability?.product_and_services;
  const interestOptions = Array.isArray(productsContainer)
    ? productsContainer
    : productsContainer?.[availableTicket?.id] || [];

  const mappedCountries = mapCountryOptions(countriesApiData, {
    requirePhoneCode: true,
  });

  return (
    <Registration
      countries={mappedCountries}
      selectedTicket={mappedSelectedTicket}
      interestOptions={interestOptions}
    />
  );
}
