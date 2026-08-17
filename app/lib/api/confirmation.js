import "server-only";
import { cookies } from "next/headers";
import { readConfirmationToken } from "@/app/lib/confirmation-token";
import {
  CONFIRMATION_ACCESS_COOKIE,
  CONFIRMATION_DATA_COOKIE,
  CONFIRMATION_FORM_TOKEN_COOKIE,
} from "@/app/lib/auth-cookies";
import {
  getDefaultEventDetails,
  VISA_GUIDE_URL,
} from "@/app/lib/event-details";

const CONFIRMATION_DOWNLOAD_PATHS = {
  confirmation: "microsite/v1/download-confirmation-email-template",
  visa: "microsite/v1/generate-visa-details-pdf",
};

function getBackendUrl(path) {
  const baseUrl = process.env.BACKEND_BASE_URL;

  if (!baseUrl) {
    throw new Error("BACKEND_BASE_URL is not configured on the server.");
  }

  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function getFormToken() {
  const response = await fetch(
    getBackendUrl("microsite/v1/form-access-token"),
    {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to authorize confirmation request: ${response.status}.`,
    );
  }

  const payload = await response.json();

  if (!payload?.form_token) {
    throw new Error("The confirmation authorization token was not returned.");
  }

  return payload.form_token;
}

function firstObject(value) {
  if (Array.isArray(value)) {
    return value.find((item) => item && typeof item === "object") || {};
  }

  return value && typeof value === "object" ? value : {};
}

function firstValue(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
}

function getConfirmationDownloadUrl(kind, confirmationId, token = "") {
  const query = new URLSearchParams({ id: String(confirmationId) });
  if (token) query.set("token", token);
  return `/confirmation/download/${kind}?${query}`;
}

function isEnabled(value) {
  return value === true || value === 1 || ["1", "yes", "true"].includes(
    String(value || "").toLowerCase(),
  );
}

function validUrl(value) {
  return typeof value === "string" && value.trim() && value !== "#"
    ? value
    : "";
}

function mapConfirmationDetails(payload, confirmationId) {
  const root = firstObject(payload);
  const data = firstObject(
    root.data ||
      root.registration_data ||
      root.ticket_details ||
      root.details ||
      root,
  );
  const attendee = firstObject(
    data.form_data || data.attendee || data.attendee_data || data.user || data,
  );
  const ticket = firstObject(
    attendee.ticket || data.ticket || data.ticket_details || {},
  );
  const defaultEvent = getDefaultEventDetails();
  const visaRequested = isEnabled(
    firstValue(
      attendee,
      ["visa_required", "visaRequested"],
      firstValue(data, ["visa_required", "visaRequested"], false),
    ),
  );
  const backendVisaUrl = validUrl(
    firstValue(data, ["visa_url", "visa_invitation_url"]),
  );
  return {
    registrationId: confirmationId,
    firstName: firstValue(attendee, ["firstname", "first_name", "firstName"]),
    lastName: firstValue(attendee, ["lastname", "last_name", "lastName"]),
    jobTitle: firstValue(attendee, ["jobtitle", "job_title", "jobTitle"]),
    company: firstValue(attendee, ["companyname", "company_name", "company"]),
    country: firstValue(attendee, [
      "country",
      "country_name",
      "country_of_residence",
    ]),
    badgeCategory: firstValue(
      attendee,
      ["badge_category", "category_type_name", "ticket_name"],
      firstValue(ticket, ["category_type_name", "display_ticket_name", "name"], "VISITOR"),
    ),
    event: {
      date: firstValue(
        data,
        ["event_date", "event_dates", "ticket_program_start_date"],
        defaultEvent.date,
      ),
      time: firstValue(data, ["event_time", "event_timings"], defaultEvent.time),
      locationLabel: firstValue(
        data,
        ["event_location", "venue", "program_location"],
        firstValue(
          ticket,
          ["event_location", "venue", "program_location"],
          defaultEvent.locationLabel,
        ),
      ),
      locationUrl:
        validUrl(firstValue(data, ["location_url", "event_location_url", "location_link"])) ||
        validUrl(firstValue(ticket, ["location_url", "event_location_url", "location_link"])) ||
        defaultEvent.locationUrl,
      calendarUrl:
        validUrl(firstValue(data, ["calendar_url", "add_to_calendar_url"])) ||
        defaultEvent.calendarUrl,
    },
    confirmationEmailUrl: getConfirmationDownloadUrl(
      "confirmation",
      confirmationId,
    ),
    newRegistrationUrl: "/",
    visaRequested,
    visaUrl:
      backendVisaUrl ||
      (visaRequested
        ? getConfirmationDownloadUrl("visa", confirmationId)
        : VISA_GUIDE_URL),
  };
}

function addConfirmationLinks(data, confirmationId, token = "") {
  const defaultEvent = getDefaultEventDetails();
  const suppliedEvent = data.event || {};

  return {
    ...data,
    registrationId:
      data.registrationId || data.confirmationId || confirmationId,
    event: {
      ...defaultEvent,
      ...suppliedEvent,
      locationUrl:
        validUrl(suppliedEvent.locationUrl) || defaultEvent.locationUrl,
      calendarUrl:
        validUrl(suppliedEvent.calendarUrl) || defaultEvent.calendarUrl,
    },
    confirmationEmailUrl:
      data.confirmationEmailUrl ||
      getConfirmationDownloadUrl("confirmation", confirmationId, token),
    newRegistrationUrl: data.newRegistrationUrl || "/",
    visaUrl:
      data.visaUrl ||
      (data.visaRequested
        ? getConfirmationDownloadUrl("visa", confirmationId, token)
        : VISA_GUIDE_URL),
  };
}

export async function getStoredConfirmationDetails(confirmationId) {
  const cookieStore = await cookies();
  const storedValue = cookieStore.get(CONFIRMATION_DATA_COOKIE)?.value;

  if (!storedValue) {
    return null;
  }

  try {
    const data = JSON.parse(decodeURIComponent(storedValue));

    if (String(data?.confirmationId) !== String(confirmationId)) {
      return null;
    }

    return addConfirmationLinks(data, confirmationId);
  } catch {
    return null;
  }
}

export function getTokenConfirmationDetails(token, confirmationId) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const data = readConfirmationToken(token, confirmationId);
  return data ? addConfirmationLinks(data, confirmationId, token) : null;
}

function hasStoredConfirmationAccess(cookieStore, confirmationId) {
  const storedValue = cookieStore.get(CONFIRMATION_DATA_COOKIE)?.value;
  if (!storedValue) return false;

  try {
    const data = JSON.parse(decodeURIComponent(storedValue));
    return String(data?.confirmationId) === String(confirmationId);
  } catch {
    return false;
  }
}

function getStoredConfirmationSnapshot(cookieStore, confirmationId) {
  const storedValue = cookieStore.get(CONFIRMATION_DATA_COOKIE)?.value;
  if (!storedValue) return null;

  try {
    const data = JSON.parse(decodeURIComponent(storedValue));
    return String(data?.confirmationId) === String(confirmationId)
      ? data
      : null;
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createLocalConfirmationDownload(data, confirmationId) {
  const event = { ...getDefaultEventDetails(), ...(data?.event || {}) };
  const attendeeName = [data?.firstName, data?.lastName]
    .filter(Boolean)
    .join(" ");
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>GITEX Nigeria Registration Confirmation</title>
  </head>
  <body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#222">
    <main style="max-width:680px;margin:32px auto;background:#fff;border-top:8px solid #98f500;padding:32px;box-sizing:border-box">
      <h1 style="margin:0 0 20px;font-size:28px">Registration Confirmed</h1>
      <p>Hello ${escapeHtml(attendeeName || "Visitor")},</p>
      <p>Your registration for GITEX Nigeria 2026 has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tbody>
          <tr><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd">Registration ID</th><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(confirmationId)}</td></tr>
          <tr><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd">Badge category</th><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(data?.badgeCategory || "VISITOR")}</td></tr>
          <tr><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd">Date</th><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(event.date)}</td></tr>
          <tr><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd">Time</th><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(event.time)}</td></tr>
          <tr><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd">Location</th><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(event.locationLabel || event.location)}</td></tr>
        </tbody>
      </table>
      <p>Please retain this confirmation for your records.</p>
    </main>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": 'attachment; filename="confirmation-email.html"',
      "cache-control": "private, no-store",
    },
  });
}

export async function proxyConfirmationDownload(kind, confirmationId, token) {
  const endpoint = CONFIRMATION_DOWNLOAD_PATHS[kind];
  if (!endpoint || !confirmationId) {
    return Response.json({ message: "Invalid download request." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CONFIRMATION_ACCESS_COOKIE)?.value;
  const tokenConfirmation = token
    ? readConfirmationToken(token, confirmationId)
    : null;
  const storedConfirmation = getStoredConfirmationSnapshot(
    cookieStore,
    confirmationId,
  );
  const tokenAccess = Boolean(tokenConfirmation);

  if (
    !accessToken &&
    !tokenAccess &&
    !hasStoredConfirmationAccess(cookieStore, confirmationId)
  ) {
    return Response.json({ message: "Confirmation access is required." }, { status: 401 });
  }

  try {
    // Authenticated downloads use the access token returned by registration,
    // matching the Visitor Portal download flow. A form token is only needed
    // for a still-valid signed confirmation link whose access cookie is absent.
    const submittedFormToken = cookieStore.get(
      CONFIRMATION_FORM_TOKEN_COOKIE,
    )?.value;
    const localConfirmation = tokenConfirmation || storedConfirmation;

    if (
      kind === "confirmation" &&
      !accessToken &&
      !submittedFormToken &&
      localConfirmation
    ) {
      return createLocalConfirmationDownload(
        localConfirmation,
        confirmationId,
      );
    }

    const formToken = accessToken
      ? ""
      : submittedFormToken || (await getFormToken());
    const response = await fetch(
      getBackendUrl(`${endpoint}/${encodeURIComponent(confirmationId)}`),
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          ...(formToken ? { "X-Form-Token": formToken } : {}),
          ...(accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {}),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!response.ok && kind === "confirmation" && localConfirmation) {
      return createLocalConfirmationDownload(
        localConfirmation,
        confirmationId,
      );
    }

    const body = await response.arrayBuffer();
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");
    if (contentType) headers.set("content-type", contentType);
    if (contentDisposition) {
      headers.set("content-disposition", contentDisposition);
    } else if (response.ok) {
      headers.set(
        "content-disposition",
        `attachment; filename="${
          kind === "visa" ? "visa-invitation.pdf" : "confirmation-email.html"
        }"`,
      );
    }
    headers.set("cache-control", "private, no-store");

    return new Response(body, { status: response.status, headers });
  } catch (error) {
    console.error("Confirmation download proxy failed:", error);
    return Response.json(
      { message: "Download service unavailable." },
      { status: 502 },
    );
  }
}

export async function getConfirmationDetails(confirmationId) {
  if (!confirmationId || typeof confirmationId !== "string") {
    throw new Error("A confirmation ID is required.");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CONFIRMATION_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    const storedConfirmation =
      await getStoredConfirmationDetails(confirmationId);

    if (storedConfirmation) {
      return storedConfirmation;
    }

    throw new Error("Confirmation authorization is unavailable.");
  }

  const formToken = await getFormToken();
  const encodedId = encodeURIComponent(confirmationId);
  const endpoints = [
    `microsite/v1/registration-detail/${encodedId}/`,
    `microsite/v1/get-ticket-details/${encodedId}`,
  ];
  const failedResponses = [];

  for (const endpoint of endpoints) {
    const response = await fetch(getBackendUrl(endpoint), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-Form-Token": formToken,
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const responseText = await response.text();
      let message = "";

      try {
        const errorPayload = JSON.parse(responseText);
        message =
          errorPayload?.message ||
          errorPayload?.detail ||
          errorPayload?.error ||
          "";
      } catch {
        // Ignore non-JSON error pages and retain only the HTTP status.
      }

      failedResponses.push(
        `${response.status}${message ? ` ${String(message).slice(0, 160)}` : ""}`,
      );
      continue;
    }

    const payload = await response.json();

    if (payload?.status !== false) {
      return addConfirmationLinks(
        mapConfirmationDetails(payload, confirmationId),
        confirmationId,
      );
    }
  }

  throw new Error(
    `Confirmation details are unavailable (${failedResponses.join(" / ") || "invalid response"}).`,
  );
}
