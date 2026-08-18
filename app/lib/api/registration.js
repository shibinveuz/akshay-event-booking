"use server";

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  CONFIRMATION_LIFETIME_SECONDS,
  createConfirmationToken,
} from "@/app/lib/confirmation-token";
import {
  CONFIRMATION_ACCESS_COOKIE,
  CONFIRMATION_DATA_COOKIE,
  CONFIRMATION_FORM_TOKEN_COOKIE,
} from "@/app/lib/auth-cookies";
import { getPrimaryFreeTicketConfiguration } from "@/app/lib/api/tickets";
import { getDefaultEventDetails } from "@/app/lib/event-details";
import { getCountryItems } from "@/app/lib/countries";

function getApiUrl(path) {
  const baseUrl = process.env.BACKEND_BASE_URL;

  if (!baseUrl) {
    throw new Error("BACKEND_BASE_URL is not configured on the server.");
  }

  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function readResponse(response) {
  const rawText = await response.text();

  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return { rawText };
  }
}

function getApiMessage(data, fallback) {
  const validationError = data?.validation_errors?.[0];
  const validationDetails =
    validationError?.error || validationError?.errors;

  if (typeof validationDetails === "string") {
    return validationDetails;
  }

  if (validationDetails && typeof validationDetails === "object") {
    const firstError = Object.values(validationDetails).flat().find(Boolean);
    if (firstError) {
      return String(firstError);
    }
  }

  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors).flat().find(Boolean);
    if (firstError) {
      return String(firstError);
    }
  }

  if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
    return String(data.non_field_errors[0]);
  }

  return data?.message || data?.detail || data?.error || fallback;
}

function findStringByKeys(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) {
    return "";
  }

  visited.add(value);

  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  for (const child of Object.values(value)) {
    const candidate = findStringByKeys(child, keys, visited);

    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function getAccessToken(data) {
  return findStringByKeys(data, [
    "access",
    "access_token",
    "accessToken",
    "token",
  ]);
}

function getConfirmationId(data) {
  const encryptedId = findStringByKeys(data, [
    "encrypted_unique_id",
    "registration_encrypted_id",
    "encrypted_id",
    "unique_id",
  ]);

  if (encryptedId) {
    return encryptedId;
  }

  // Some successful free-ticket responses expose only the checkout UID.
  return findStringByKeys(data, ["uid"]);
}

async function getFormToken() {
  const response = await fetch(getApiUrl("microsite/v1/form-access-token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "{}",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await readResponse(response);

  if (!response.ok || !data?.form_token) {
    throw new Error(
      getApiMessage(data, "Unable to start a secure registration session."),
    );
  }

  return data.form_token;
}

export const getCountries = cache(async function getCountries() {
  try {
    const response = await fetch(getApiUrl("microsite/v2/countries"), {
      cache: "force-cache",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
});

export const getVisaCountries = cache(async function getVisaCountries() {
  return getCountryItems(await getCountries());
});

function formatDate(date) {
  if (!date?.yyyy || !date?.mm || !date?.dd) {
    return null;
  }

  return `${date.yyyy}-${date.mm}-${date.dd}`;
}

function getConfiguredSolutionIds(availability, ticketId) {
  const productContainer = availability?.product_and_services;
  const configuredProducts = Array.isArray(productContainer)
    ? productContainer
    : productContainer?.[ticketId] || [];
  const ids = new Set();

  const visit = (items) => {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      const id = Number(item?.id ?? item?.value);
      if (Number.isInteger(id)) ids.add(id);
      visit(item?.services);
    }
  };

  visit(configuredProducts);
  return ids;
}

export async function submitRegistrationAction(submission) {
  try {
    const serializedPayload = submission.get("payload");
    const payload = JSON.parse(serializedPayload);
    const userDocument = submission.get("userDocument");
    const hasUserDocument =
      userDocument && typeof userDocument.arrayBuffer === "function";
    const ticketConfiguration = await getPrimaryFreeTicketConfiguration();

    if (!ticketConfiguration) {
      return {
        success: false,
        message: "The selected ticket is currently unavailable.",
      };
    }

    const trustedTicket = ticketConfiguration.ticket;
    const trustedAvailability = ticketConfiguration.availability;

    if (String(payload.ticketId) !== String(trustedTicket.id)) {
      return {
        success: false,
        message: "The selected ticket is invalid.",
      };
    }

    const documentRequired = Boolean(trustedTicket.document_required);
    if (documentRequired && !hasUserDocument) {
      return {
        success: false,
        message: "A supporting document is required for this pass.",
      };
    }

    const formToken = await getFormToken();
    const requestBody = new FormData();
    const visaRequired = payload.visa_required === "yes";
    const requestedSolutionIds = (Array.isArray(payload.interests)
      ? payload.interests
      : []
    )
      .map((interest) => Number(interest))
      .filter(Number.isInteger);
    const configuredSolutionIds = getConfiguredSolutionIds(
      trustedAvailability,
      trustedTicket.id,
    );
    const solutionIds = requestedSolutionIds.filter((id) =>
      configuredSolutionIds.has(id),
    );

    if (solutionIds.length !== requestedSolutionIds.length) {
      return {
        success: false,
        message: "One or more selected interests are invalid.",
      };
    }
    const attendee = {
      title: "",
      firstname: payload.firstName,
      lastname: payload.lastName,
      emailid: payload.email,
      Confirmemail: payload.confirmemail,
      phoneNumber: payload.mobile,
      country_code: payload.phoneCode,
      companyname: payload.company,
      jobtitle: payload.jobTitle,
      country: payload.countryName,
      country_codes: payload.countryofresidence,
      nationality: payload.nationalityName,
      nationality_code: payload.nationality,
      companytype: payload.companyType,
      industry: payload.industry,
      media_name: "",
      media_type: "",
      company_website: "",
      social_link: "",
      first_attempt: false,
      // The backend accepts product/service primary keys, not display strings.
      solutions_products: solutionIds,
      terms_condition: payload.terms,
      age_confirm: payload.ageConfirm,
      market_mail: payload.marketingConsent,
      personal_data_terms_and_conditions: payload.terms,
      isOldFile: "",
      isBadgeOldFile: "",
      isDocument: documentRequired,
      isMedia: false,
      user_document: "user_document_0",
      badge_document: "badge_document_0",
      emailApiError: false,
      isExhibitor: false,
      isStudent: false,
      university_name: "",
      faculty: "",
      student_level: "",
      isBuyers: false,
      employee_size: "",
      top_goals: "",
      budget_range: "",
      project_timeline: "",
      personal_bio: "",
      isFOC: false,
      is_primary: true,
      ticket_id: trustedTicket.id,
      ticket_encrypted_id: trustedTicket.ticket_encrypted_id || "",
      sessions_data: [],
      visa_required: visaRequired,
      visa_dob: visaRequired ? formatDate(payload.visaForm?.visa_dob) : null,
      passport_expiry_date: visaRequired
        ? formatDate(payload.visaForm?.passport_expiry_date)
        : null,
      passport_nationality: visaRequired
        ? payload.visaForm?.passport_nationality || ""
        : "",
      passport_country: visaRequired
        ? payload.visaForm?.passport_country || ""
        : "",
      passport_fullname: visaRequired
        ? payload.visaForm?.passport_fullname || ""
        : "",
      passport_number: visaRequired
        ? payload.visaForm?.passport_number || ""
        : "",
      department: "N/A",
      city: "N/A",
      involvement_role: "",
      business_phone: "",
      representing_type: "",
      media_channel_url: "",
      comment_remarks: "",
      is_media_verification: false,
      is_media_terms_and_conditions: false,
      basket_id: "",
      registration_id: payload.registrationId || undefined,
    };
    const registrationPayload = {
      form_data: [attendee],
      recaptcha_token: payload.recaptchaToken,
      recaptcha_version: "v3",
      coupon_data: trustedTicket.is_free ? {} : payload.couponData || {},
      applied_promo_code: trustedTicket.is_free ? "" : payload.promoCode || "",
      current_currency: trustedAvailability.current_currency || "NGN",
      payment_method: 0,
      uid: "",
      billing_full_name: "",
      billing_job_title: "",
      billing_company_name: "",
      billing_company_country: "",
      billing_po_box: "",
      billing_vat_number: "",
      billing_address: "",
      terms_and_conditions: payload.terms,
      age_confirm: payload.ageConfirm,
      market_mail: payload.marketingConsent,
      personal_data_terms_and_conditions: payload.terms,
      total_ticket_count: 1,
      language: "english",
    };

    requestBody.append("payload", JSON.stringify(registrationPayload));
    if (hasUserDocument) {
      requestBody.append("user_document_0", userDocument, userDocument.name);
    }

    const response = await fetch(
      getApiUrl("microsite/v1/form-registration"),
      {
        method: "POST",
        headers: {
          "X-Form-Token": formToken,
        },
        body: requestBody,
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );
    const data = await readResponse(response);

    if (![200, 201].includes(response.status) || data?.status === false) {
      console.error("Registration API rejected the request:", {
        status: response.status,
        ticketId: payload.ticketId,
        hasUserDocument,
        documentRequired: Boolean(payload.documentRequired),
        solutionIdCount: solutionIds.length,
        apiMessage: data?.message || data?.detail || null,
        validationFields: data?.validation_errors
          ?.flatMap((entry) =>
            Object.keys(entry?.error || entry?.errors || {}),
          )
          .filter(Boolean),
        errorFields:
          data?.errors && typeof data.errors === "object"
            ? Object.keys(data.errors)
            : [],
      });

      return {
        success: false,
        message: getApiMessage(
          data,
          `Registration API returned status ${response.status}.`,
        ),
      };
    }

    const confirmationId = getConfirmationId(data);
    const accessToken = getAccessToken(data);

    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set(CONFIRMATION_ACCESS_COOKIE, accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/confirmation",
        maxAge: CONFIRMATION_LIFETIME_SECONDS,
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(CONFIRMATION_FORM_TOKEN_COOKIE, formToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/confirmation",
      maxAge: 10 * 60,
    });
    const confirmationSnapshot = {
      confirmationId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      jobTitle: payload.jobTitle,
      company: payload.company,
      country: payload.countryName,
      badgeCategory:
        trustedTicket.category_type_name ||
        trustedTicket.display_ticket_name ||
        "VISITOR",
      event: getDefaultEventDetails(),
      visaRequested: visaRequired,
    };
    cookieStore.set(
      CONFIRMATION_DATA_COOKIE,
      encodeURIComponent(JSON.stringify(confirmationSnapshot)),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/confirmation",
        maxAge: CONFIRMATION_LIFETIME_SECONDS,
      },
    );
    const confirmationToken = createConfirmationToken(confirmationSnapshot);

    return {
      success: true,
      confirmationId,
      confirmationToken,
    };
  } catch (error) {
    console.error("Registration server action failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "The registration service is temporarily unavailable.",
    };
  }
}

export async function checkEmailAction(email, ticketId) {
  try {
    const formToken = await getFormToken();
    const response = await fetch(
      getApiUrl("microsite/v2/check-user-unique-email"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Form-Token": formToken,
        },
        body: JSON.stringify({ email, ticket_id: ticketId }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
    const data = await readResponse(response);
    const profile = data?.profile_data || {};
    const hasProfile = Object.keys(profile).length > 0;

    if (response.ok) {
      return {
        success: true,
        isCompleted: false,
        isAbandoned: hasProfile,
        data: hasProfile
          ? {
              firstName: profile.firstname || profile.first_name || "",
              lastName: profile.lastname || profile.last_name || "",
              registrationId: profile.registration_id || profile.uid || "",
            }
          : {},
      };
    }

    if ([400, 409, 422].includes(response.status)) {
      return {
        success: true,
        isCompleted: true,
        isAbandoned: false,
        message: getApiMessage(data, "This email is already registered."),
        data: {},
      };
    }

    return {
      success: false,
      error: true,
      message: getApiMessage(
        data,
        `Email validation API returned status ${response.status}.`,
      ),
    };
  } catch (error) {
    console.error("Email validation server action failed:", error);
    return {
      success: false,
      error: true,
      message: "The email validation service is temporarily unavailable.",
    };
  }
}

export async function validatePromoCodeAction({
  couponCode,
  email,
  ticketId,
  price,
  currency,
}) {
  try {
    const code = couponCode?.trim();
    if (!code) return { success: false, message: "Enter a promo code." };
    if (!email?.trim()) {
      return { success: false, message: "Enter your email before validating a promo code." };
    }
    if (!ticketId) return { success: false, message: "A ticket is required." };

    const formToken = await getFormToken();
    const response = await fetch(getApiUrl("microsite/v1/validate-coupon"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Form-Token": formToken,
      },
      body: JSON.stringify({
        coupon_code: code,
        current_currency: currency || "NGN",
        ticket_selections: [
          {
            ticketID: ticketId,
            priceFloat: Number(price || 0),
            quantity: 1,
          },
        ],
        form_emails: [email.trim().toLowerCase()],
        uid: "",
        total_ticket_count: 1,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await readResponse(response);

    if (!response.ok || data?.status === false) {
      return {
        success: false,
        message: getApiMessage(data, "Invalid promo code."),
      };
    }

    return {
      success: true,
      message: data?.message || "Promo code applied.",
      couponData: data?.coupon_data || {},
      discountedTickets: data?.discounted_tickets || [],
      newTotal: data?.new_total,
      discountAmount: data?.discount_amount,
    };
  } catch (error) {
    console.error("Promo validation server action failed:", error);
    return {
      success: false,
      message: "The promo validation service is temporarily unavailable.",
    };
  }
}
