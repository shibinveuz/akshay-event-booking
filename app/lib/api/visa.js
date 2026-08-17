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

    const formData = {
      ...(registrationId ? { registration_id: registrationId } : {}),
      visa_required: true,
      visa_dob: formatDate(visaForm?.visa_dob),
      passport_expiry_date: formatDate(visaForm?.passport_expiry_date),
      passport_nationality: visaForm?.passport_nationality || "",
      passport_country: visaForm?.passport_country || "",
      passport_fullname: visaForm?.passport_fullname?.trim() || "",
      passport_number: visaForm?.passport_number?.trim() || "",
    };

    if (Object.values(formData).some((value) => value === null || value === "")) {
      return {
        success: false,
        message: "Complete all visa invitation letter fields.",
      };
    }

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
