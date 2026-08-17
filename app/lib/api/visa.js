"use server";

import "server-only";
import { cookies } from "next/headers";
import {
  CONFIRMATION_ACCESS_COOKIE,
  VISITOR_ACCESS_COOKIE,
} from "@/app/lib/auth-cookies";

function apiUrl(path) {
  const baseUrl = process.env.BACKEND_BASE_URL;
  if (!baseUrl) {
    throw new Error("BACKEND_BASE_URL is not configured on the server.");
  }
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function formatDate(date) {
  if (!date?.yyyy || !date?.mm || !date?.dd) return null;
  return `${date.yyyy}-${date.mm}-${date.dd}`;
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { rawText: text };
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
  return data?.message || data?.detail || data?.error || fallback;
}

function getProfileRecord(payload) {
  const envelope = payload?.data ?? payload;
  return envelope?.data ?? envelope;
}

function firstValue(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

async function getAuthenticatedProfile(accessToken) {
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

  if (!response.ok) return null;
  return getProfileRecord(await readResponse(response));
}

export async function submitVisaApplicationAction({
  accessContext,
  registrationId,
  visaForm,
}) {
  try {
    const cookieStore = await cookies();
    const accessToken =
      accessContext === "confirmation"
        ? cookieStore.get(CONFIRMATION_ACCESS_COOKIE)?.value
        : cookieStore.get(VISITOR_ACCESS_COOKIE)?.value;

    if (!accessToken) {
      return {
        success: false,
        message: "Your registration session has expired. Please log in again.",
      };
    }

    const visaData = {
      visa_required: true,
      visa_dob: formatDate(visaForm?.visa_dob),
      passport_expiry_date: formatDate(visaForm?.passport_expiry_date),
      passport_nationality: visaForm?.passport_nationality || "",
      passport_country: visaForm?.passport_country || "",
      passport_fullname: visaForm?.passport_fullname?.trim() || "",
      passport_number: visaForm?.passport_number?.trim() || "",
    };

    if (Object.values(visaData).some((value) => value === null || value === "")) {
      return {
        success: false,
        message: "Complete all visa invitation letter fields.",
      };
    }

    const profile = await getAuthenticatedProfile(accessToken);
    if (!profile) {
      return {
        success: false,
        message: "Your current registration details could not be loaded.",
      };
    }

    const requiredProfileData = {
      firstname: firstValue(profile, ["firstname", "first_name"]),
      lastname: firstValue(profile, ["lastname", "last_name"]),
      country: firstValue(profile, [
        "country_name",
        "country",
        "country_of_residence",
      ]),
      nationality: firstValue(profile, [
        "nationality_name",
        "nationality",
      ]),
      phoneNumber: String(
        firstValue(profile, ["mobile", "phoneNumber", "phone_number"]),
      ).replace(/\D/g, ""),
    };

    if (Object.values(requiredProfileData).some((value) => !value)) {
      return {
        success: false,
        message: "Your required registration details could not be verified.",
      };
    }

    const email = firstValue(profile, ["emailid", "email"]);
    const formData = {
      ...(registrationId ? { registration_id: registrationId } : {}),
      ...requiredProfileData,
      emailid: email,
      Confirmemail: email,
      country_code: firstValue(profile, ["country_code", "phone_code"]),
      country_codes: firstValue(profile, [
        "country_codes",
        "country_code_iso",
      ]),
      nationality_code: firstValue(profile, ["nationality_code"]),
      companyname: firstValue(profile, [
        "company_name",
        "companyname",
        "company",
      ]),
      jobtitle: firstValue(profile, [
        "designation",
        "jobtitle",
        "job_title",
      ]),
      companytype: firstValue(profile, ["company_type", "companytype"]),
      industry: firstValue(profile, ["industry"]),
      solutions_products: firstValue(
        profile,
        ["selected_services", "solutions_products"],
        [],
      ),
      department: firstValue(profile, ["department"], "N/A"),
      city: firstValue(profile, ["city"], "N/A"),
      ...visaData,
    };

    const response = await fetch(
      apiUrl("microsite/v1/login-user-retrive-update"),
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ form_data: formData }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
    const data = await readResponse(response);

    if (!response.ok || data?.status === false) {
      return {
        success: false,
        message: apiMessage(data, "Unable to submit the visa application."),
      };
    }

    return {
      success: true,
      message:
        data?.message || "Your visa invitation letter request was submitted.",
    };
  } catch (error) {
    console.error("Visa application submission failed:", error);
    return {
      success: false,
      message: "The visa application service is temporarily unavailable.",
    };
  }
}
