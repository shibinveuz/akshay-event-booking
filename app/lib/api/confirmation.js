// app/lib/api/confirmation.js

import "server-only";

export async function getConfirmationDetails() {
  const response = await fetch(
    `${process.env.API_BASE_URL}/microsite/v1/registration-detail`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch confirmation details: ${response.status}`);
  }

  return response.json();
}
