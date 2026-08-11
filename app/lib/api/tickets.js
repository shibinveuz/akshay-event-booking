import "server-only";

export async function getTickets() {
  const response = await fetch(
    `${process.env.API_BASE_URL}/microsite/v2/tickets`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  return response.json();
}
