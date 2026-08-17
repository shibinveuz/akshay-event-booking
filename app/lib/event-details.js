import "server-only";

const DEFAULT_EVENT = {
  title: "GITEX NIGERIA 2026 - Startup Festival",
  date: "2-3 September 2026",
  time: "10:00 AM - 6:00 PM",
  startDate: "20260902T090000Z",
  endDate: "20260903T170000Z",
  location: "Landmark Centre, Lagos",
  locationUrl:
    "https://www.google.com/maps/search/?api=1&query=Landmark+Centre%2C+Lagos%2C+Nigeria",
};

export const VISA_GUIDE_URL = "https://gitexnigeria.ng/travel-visa-guide";

export function createGoogleCalendarUrl({
  title = DEFAULT_EVENT.title,
  startDate,
  endDate,
  location = "",
}) {
  if (!startDate || !endDate) return "";

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startDate}/${endDate}`,
    location,
  });

  return `https://calendar.google.com/calendar/render?${query}`;
}

export function getDefaultEventDetails() {
  return {
    date: DEFAULT_EVENT.date,
    time: DEFAULT_EVENT.time,
    locationLabel: DEFAULT_EVENT.location,
    location: DEFAULT_EVENT.location,
    locationUrl: DEFAULT_EVENT.locationUrl,
    calendarUrl: createGoogleCalendarUrl(DEFAULT_EVENT),
  };
}
