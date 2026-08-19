import Confirmation from "@/app/widgets/confirmation/Confirmation";
import {
  getConfirmationDetails,
  getStoredConfirmationDetails,
  getTokenConfirmationDetails,
} from "@/app/lib/api/confirmation";
import { getVisaCountries } from "@/app/lib/api/registration";

export const metadata = {
  title: "Registration Confirmation | GITEX NIGERIA 2026",
  description: "Your GITEX Nigeria registration confirmation.",
};

// Confirmation data is attendee-specific and must be rendered per request.
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ searchParams }) {
  const countriesPromise = getVisaCountries().catch(() => []);
  const params = await searchParams;
  const rawConfirmationId = params?.id;
  const rawConfirmationToken = params?.token;
  const confirmationId = Array.isArray(rawConfirmationId)
    ? rawConfirmationId[0]
    : rawConfirmationId;
  const confirmationToken = Array.isArray(rawConfirmationToken)
    ? rawConfirmationToken[0]
    : rawConfirmationToken;

  if (!confirmationId) {
    const storedConfirmation = await getStoredConfirmationDetails();
    return (
      <Confirmation
        data={storedConfirmation}
        countries={await countriesPromise}
      />
    );
  }

  // The encrypted URL snapshot and the HTTP-only snapshot cookie are created by
  // the registration Server Action. Prefer them so the confirmation page does
  // not depend on a second backend request succeeding immediately after submit.
  let confirmation =
    getTokenConfirmationDetails(confirmationToken, confirmationId) ||
    (await getStoredConfirmationDetails(confirmationId));

  if (!confirmation) {
    try {
      confirmation = await getConfirmationDetails(confirmationId);
    } catch (error) {
      console.warn("Confirmation details could not be resolved:", {
        confirmationId: confirmationId || "(none)",
        hasConfirmationToken: Boolean(confirmationToken),
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <Confirmation
      data={confirmation}
      countries={await countriesPromise}
    />
  );
}
