"use server";

import "server-only";
import { cookies } from "next/headers";
import {
  LEGACY_VISITOR_DATA_COOKIE,
  VISITOR_ACCESS_COOKIE,
  VISITOR_REFRESH_COOKIE,
} from "@/app/lib/auth-cookies";
import {
  getDefaultEventDetails,
  VISA_GUIDE_URL,
} from "@/app/lib/event-details";

function apiUrl(path) {
  const baseUrl = process.env.BACKEND_BASE_URL;
  if (!baseUrl)
    throw new Error("BACKEND_BASE_URL is not configured on the server.");
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function verifyOtpAction(otpToken, otp, recaptchaToken = "") {
  try {
    const code = otp?.trim();
    if (!otpToken || !code) {
      return { success: false, message: "OTP session and code are required." };
    }
    if (!recaptchaToken) {
      return {
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      };
    }

    const response = await fetch(apiUrl("microsite/v1/otp-verification"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${otpToken}`,
      },
      body: JSON.stringify({
        otp: code,
        recaptcha: recaptchaToken,
        recaptcha_version: "v3",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await readResponse(response);
    if (!response.ok || data?.status === false) {
      return {
        success: false,
        message: apiMessage(
          data,
          response.status === 410
            ? "OTP has expired. Please request a new code."
            : "Invalid OTP code.",
        ),
      };
    }

    const accessToken = findToken(data, ["access", "access_token", "token"]);
    const refreshToken = findToken(data, ["refresh", "refresh_token"]);
    if (!accessToken) {
      return {
        success: false,
        message: "OTP was accepted, but the login session was not returned.",
      };
    }

    const cookieStore = await cookies();
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    };
    const legacyLoginPathOptions = {
      ...options,
      maxAge: 0,
      path: "/login",
    };
    cookieStore.set(VISITOR_ACCESS_COOKIE, "", legacyLoginPathOptions);
    cookieStore.set(VISITOR_REFRESH_COOKIE, "", legacyLoginPathOptions);
    cookieStore.set(VISITOR_ACCESS_COOKIE, accessToken, options);
    if (refreshToken) {
      cookieStore.set(VISITOR_REFRESH_COOKIE, refreshToken, options);
    }
    cookieStore.delete(LEGACY_VISITOR_DATA_COOKIE);
    return { success: true };
  } catch (error) {
    console.error("OTP verification failed:", error);
    return {
      success: false,
      message:
        error?.name === "TimeoutError"
          ? "The verification service timed out. Please try again."
          : "The verification service is temporarily unavailable. Please try again.",
    };
  }
}

async function readResponse(response) {
  // Authentication is cookie-backed; profile data always comes from the API.
  const rawText = await response.text();
  if (!rawText) return {};
  try {
    return JSON.parse(rawText);
  } catch {
    return { rawText };
  }
}

async function fetchVisitorProfilePayload(accessToken) {
  const response = await fetch(
    apiUrl("microsite/v1/login-user-retrive-update"),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) {
    console.warn(`Visitor profile API returned status ${response.status}.`);
    return null;
  }

  return readResponse(response);
}

function getVisitorRecord(payload) {
  const envelope = payload?.data ?? payload;
  return envelope?.data ?? envelope;
}

export async function getVisitorProfile() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(VISITOR_ACCESS_COOKIE)?.value;
    if (!accessToken) return null;
    const payload = await fetchVisitorProfilePayload(accessToken);
    return payload ? mapProfile(payload) : null;
  } catch (error) {
    console.error("Unable to fetch visitor profile:", error);
    return null;
  }
}

function getHistoryItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function formatHistoryDate(value) {
  if (!value) return "-";

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(?:\s*(AM|PM))?/i,
  );
  if (!match) return String(value);

  const [, year, month, day, hours, minutes, meridiem] = match;
  return `${day}/${month}/${year} ${hours}:${minutes}${meridiem ? ` ${meridiem.toUpperCase()}` : ""}`;
}

function mapHistoryItems(payload) {
  return getHistoryItems(payload).map((item, index) => ({
    id: item.id || item.log_id || `${item.created_at || "activity"}-${index}`,
    date: formatHistoryDate(item.created_at || item.date || item.timestamp),
    user: item.user_name || item.username || item.user || "-",
    image: "/assets/img/profile-temp.png",
    activity: item.action || item.activity || "-",
    description: item.description || item.message || "-",
    performedBy:
      item.performed_by || item.performed_by_name || item.user_name || "-",
    performedByType:
      item.performed_by_type || (item.is_primary ? "Primary" : ""),
    status: item.status || item.result || "-",
    ipAddress: item.ip_address || item.ip || "-",
  }));
}

export async function getVisitorHistory({ page = 1, offset = 50 } = {}) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(VISITOR_ACCESS_COOKIE)?.value;
    if (!accessToken) return [];

    const query = new URLSearchParams({
      page_number: String(page),
      offset: String(offset),
    });
    const response = await fetch(apiUrl(`microsite/v1/log-history?${query}`), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`Visitor history API returned status ${response.status}.`);
      return [];
    }

    return mapHistoryItems(await readResponse(response));
  } catch (error) {
    console.error("Unable to fetch visitor history:", error);
    return [];
  }
}

export async function logoutVisitorAction() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(VISITOR_ACCESS_COOKIE)?.value;
    const refreshToken = cookieStore.get(VISITOR_REFRESH_COOKIE)?.value;

    if (accessToken) {
      try {
        await fetch(apiUrl("microsite/v1/user-logout"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            refresh: refreshToken || "",
            refresh_token: refreshToken || "",
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
      } catch (error) {
        console.warn("Backend logout request failed:", error?.message);
      }
    }

    cookieStore.delete(VISITOR_ACCESS_COOKIE);
    cookieStore.delete(VISITOR_REFRESH_COOKIE);
    const expiredLoginCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/login",
    };
    cookieStore.set(VISITOR_ACCESS_COOKIE, "", expiredLoginCookieOptions);
    cookieStore.set(VISITOR_REFRESH_COOKIE, "", expiredLoginCookieOptions);
    cookieStore.delete(LEGACY_VISITOR_DATA_COOKIE);
    return { success: true };
  } catch (error) {
    console.error("Error in logoutVisitorAction:", error);
    return { success: false };
  }
}

export async function updateVisitorProfileAction(fields) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(VISITOR_ACCESS_COOKIE)?.value;
    if (!accessToken) return { success: false, message: "Your session has expired." };

    // Protected identity fields are required by the backend serializer. Read
    // their canonical values from the authenticated profile so client input
    // can never modify them during an editable-profile update.
    const currentPayload = await fetchVisitorProfilePayload(accessToken);
    const currentVisitor = getVisitorRecord(currentPayload);
    const firstName =
      currentVisitor?.firstname || currentVisitor?.first_name || "";
    const lastName =
      currentVisitor?.lastname || currentVisitor?.last_name || "";
    const email =
      currentVisitor?.emailid || currentVisitor?.email || "";

    if (!firstName || !lastName || !email) {
      return {
        success: false,
        message: "Your protected profile details could not be verified.",
      };
    }

    const response = await fetch(apiUrl("microsite/v1/login-user-retrive-update"), {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        form_data: {
          firstname: firstName,
          lastname: lastName,
          emailid: String(email).trim().toLowerCase(),
          Confirmemail: String(email).trim().toLowerCase(),
          phoneNumber: String(fields.mobile || "").replace(/\D/g, ""),
          country_code: fields.phoneCode || "",
          country: fields.country || "",
          country_codes: fields.countryCode || "",
          nationality: fields.nationality || "",
          nationality_code: fields.nationalityCode || "",
          companyname: fields.company?.trim(),
          jobtitle: fields.jobTitle?.trim(),
          companytype: fields.companyType || "",
          industry: fields.industry || "",
          investor: fields.investorType || "",
          solutions_products: fields.interestIds || [],
          department: "N/A",
          city: "N/A",
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await readResponse(response);

    if (!response.ok || data?.status === false) {
      return {
        success: false,
        message: apiMessage(data, "Unable to update your profile."),
      };
    }

    return {
      success: true,
      message: data?.message || "Your details were updated successfully.",
    };
  } catch (error) {
    console.error("Visitor profile update failed:", error);
    return {
      success: false,
      message: "The profile service is temporarily unavailable.",
    };
  }
}

function apiMessage(data, fallback) {
  const validation = data?.validation_errors?.[0]?.error;
  if (typeof validation === "string" && validation.trim()) return validation;
  if (validation && typeof validation === "object") {
    const first = Object.values(validation).flat().find(Boolean);
    if (first) return String(first);
  }
  if (data?.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors).flat().find(Boolean);
    if (first) return String(first);
  }
  const message = data?.message || data?.detail || data?.error;
  if (typeof message === "string" && message.trim()) return message;
  if (data?.rawText?.includes("TemplateDoesNotExist")) {
    return "The login service could not load its OTP email template. Please contact the backend administrator.";
  }
  return fallback;
}

function findToken(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return "";
  visited.add(value);
  for (const key of keys) {
    if (typeof value[key] === "string" && value[key].trim()) return value[key];
  }
  for (const child of Object.values(value)) {
    const token = findToken(child, keys, visited);
    if (token) return token;
  }
  return "";
}

function splitValues(value) {
  if (Array.isArray(value)) return value;
  return typeof value === "string" ? value.split("||").filter(Boolean) : [];
}

function googleCalendarUrl(startDate, endDate, location) {
  if (!startDate || !endDate) return "";
  const toGoogleDate = (value) => {
    const date = new Date(String(value).trim());
    return Number.isNaN(date.getTime())
      ? ""
      : date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };
  const start = toGoogleDate(startDate);
  const end = toGoogleDate(endDate);
  if (!start || !end) return "";

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: "GITEX NIGERIA 2026",
    dates: `${start}/${end}`,
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${query}`;
}

function isEnabled(value) {
  return value === true || value === 1 || ["1", "yes", "true"].includes(
    String(value || "").toLowerCase(),
  );
}

function dateParts(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match
    ? { yyyy: match[1], mm: match[2], dd: match[3] }
    : { yyyy: "", mm: "", dd: "" };
}

function mapProfile(payload) {
  const envelope = payload?.data ?? payload;
  const visitor = getVisitorRecord(payload);
  const ticket = envelope?.ticket_detail || payload?.ticket_detail || {};
  if (!visitor || typeof visitor !== "object") return null;

  const selectedInterestIds = Array.isArray(visitor.selected_services)
    ? visitor.selected_services
    : [];
  const interestValues = visitor.solutions_products || visitor.interests || [];
  const productCatalog = Array.isArray(ticket.product_and_services)
    ? ticket.product_and_services.flatMap((item) => [
        item,
        ...(item.services || []).flatMap((service) => [
          service,
          ...(service.services || []),
        ]),
      ])
    : [];
  const interests = (Array.isArray(interestValues) ? interestValues : [])
    .map((item) =>
      typeof item === "string"
        ? item
        : item?.name || item?.product_name || item?.title || "",
    )
    .filter(Boolean);
  if (interests.length === 0 && selectedInterestIds.length > 0) {
    interests.push(
      ...selectedInterestIds
        .map((id) => productCatalog.find((item) => item.id === id)?.name || "")
        .filter(Boolean),
    );
  }
  const interestOptions = Array.from(
    new Map(
      productCatalog
        .map((item) => ({
          id: item?.id ?? item?.value,
          name: item?.name || item?.product_name || item?.title || "",
        }))
        .filter(
          (item) =>
            item.name && item.id !== null && item.id !== undefined,
        )
        .map((item) => [String(item.id), item]),
    ).values(),
  );
  const dates = splitValues(
    ticket.ticket_program_start_date || visitor.event_dates,
  );
  const endDates = splitValues(ticket.ticket_program_end_date);
  const locations = splitValues(
    ticket.program_location || visitor.event_location,
  );
  const locationUrls = splitValues(
    ticket.location_link || visitor.location_url,
  );
  const eventCount = Math.max(
    dates.length,
    endDates.length,
    locations.length,
    locationUrls.length,
  );
  const uid = visitor.uid || visitor.id || visitor.unique_id || "";
  const defaultEvent = getDefaultEventDetails();
  const events =
    eventCount > 0
      ? Array.from({ length: eventCount }, (_, index) => {
          const start = dates[index] || "";
          const end = endDates[index] || "";
          const location = locations[index] || defaultEvent.location;
          return {
            id: index + 1,
            date: start || defaultEvent.date,
            time: end || defaultEvent.time,
            location,
            locationUrl: locationUrls[index] || defaultEvent.locationUrl,
            calendarUrl:
              googleCalendarUrl(start, end, location) ||
              defaultEvent.calendarUrl,
          };
        })
      : [
          {
            id: 1,
            date: defaultEvent.date,
            time: defaultEvent.time,
            location: defaultEvent.location,
            locationUrl: defaultEvent.locationUrl,
            calendarUrl: defaultEvent.calendarUrl,
          },
        ];
  const visaRequested = isEnabled(visitor.visa_required);

  return {
    id: visitor.id || uid,
    uid,
    firstName: visitor.firstname || visitor.first_name || "",
    lastName: visitor.lastname || visitor.last_name || "",
    email: visitor.email || visitor.emailid || "",
    phoneCode: visitor.country_code || visitor.phone_code || "",
    countryCode: visitor.country_codes || visitor.country_code_iso || "",
    mobile: visitor.mobile || visitor.phoneNumber || "",
    country: visitor.country_name || visitor.country || "",
    nationality: visitor.nationality_name || visitor.nationality || "",
    nationalityCode: visitor.nationality_code || "",
    company:
      visitor.company_name || visitor.companyname || visitor.company || "",
    jobTitle:
      visitor.designation || visitor.jobtitle || visitor.job_title || "",
    companyType: visitor.company_type || visitor.companytype || "",
    industry: visitor.industry || "",
    investorType: visitor.investor_type || visitor.investorType || "",
    badgeCategory:
      visitor.display_ticket_name ||
      visitor.ticket_name ||
      ticket.display_ticket_name ||
      ticket.class_name ||
      "VISITOR",
    ticket: {
      id: ticket.id || visitor.ticket_id || "",
      name:
        ticket.display_ticket_name ||
        ticket.class_name ||
        visitor.display_ticket_name ||
        visitor.ticket_name ||
        "Visitor Pass",
    },
    events,
    confirmationEmailUrl: uid
      ? `/api/visitor/download/confirmation?uid=${encodeURIComponent(uid)}`
      : "",
    visaRequested,
    visaForm: {
      passport_fullname: visitor.passport_fullname || "",
      visa_dob: dateParts(visitor.visa_dob),
      passport_number: visitor.passport_number || "",
      passport_expiry_date: dateParts(visitor.passport_expiry_date),
      passport_nationality: visitor.passport_nationality || "",
      passport_country: visitor.passport_country || "",
    },
    visaUrl:
      visaRequested && uid
        ? `/api/visitor/download/visa?uid=${encodeURIComponent(uid)}`
        : VISA_GUIDE_URL,
    interests,
    interestOptions,
    interestIds:
      selectedInterestIds.length > 0
        ? selectedInterestIds
        : (Array.isArray(interestValues) ? interestValues : [])
            .map((item) => (typeof item === "object" ? item?.id : null))
            .filter((id) => id !== null && id !== undefined),
  };
}

export async function requestOtpAction(
  email,
  recaptchaToken = "",
  recaptchaVersion = "v3",
) {
  try {
    const customerId = email?.trim()?.toLowerCase();
    if (!customerId)
      return { success: false, message: "Email address is required." };
    if (!recaptchaToken) {
      return {
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      };
    }

    const response = await fetch(apiUrl("microsite/v1/user-login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        language: "english",
        recaptcha: recaptchaToken,
        recaptcha_version: recaptchaVersion,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await readResponse(response);
    if (!response.ok || data?.status === false) {
      return {
        success: false,
        message: apiMessage(
          data,
          `Unable to send OTP (status ${response.status}).`,
        ),
      };
    }

    const otpToken = findToken(data, ["token"]);
    if (!otpToken) {
      return {
        success: false,
        message: "The OTP service returned an invalid response.",
      };
    }
    return {
      success: true,
      otpToken,
      message: data?.message || "OTP has been sent to your email address.",
    };
  } catch (error) {
    console.error("OTP request failed:", error);
    return {
      success: false,
      message:
        error?.name === "TimeoutError"
          ? "The OTP service timed out. Please try again."
          : "The OTP service is temporarily unavailable. Please try again.",
    };
  }
}
