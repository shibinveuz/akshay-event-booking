"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
  if (!date) return null;
  if (typeof date === "string") {
    const match = date.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      const [, yyyy, mm, dd] = match;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    return null;
  }
  if (typeof date === "object") {
    const yyyy = String(date.yyyy || date.year || "").trim();
    const mm = String(date.mm || date.month || "").trim().padStart(2, "0");
    const dd = String(date.dd || date.day || "").trim().padStart(2, "0");
    if (yyyy && mm !== "00" && dd !== "00") {
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return null;
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

    const uid = String(registrationId || "").trim();
    if (!uid) {
      return {
        success: false,
        message: "Your registration details could not be identified.",
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
      uid,
    };

    if (
      !visaData.visa_dob ||
      !visaData.passport_expiry_date ||
      !visaData.passport_nationality ||
      !visaData.passport_country ||
      !visaData.passport_fullname ||
      !visaData.passport_number
    ) {
      return {
        success: false,
        message: "Complete all visa invitation letter fields.",
      };
    }

    const response = await fetch(
      apiUrl(`microsite/v1/visa-details-save/${encodeURIComponent(uid)}`),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ users: [visaData] }),
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

    revalidatePath("/visitor-portal");
    revalidatePath("/visitor-portal", "page");
    revalidatePath("/", "layout");

    return {
      success: true,
      message:
        data?.data?.results?.[0]?.message ||
        data?.message ||
        "Your visa invitation letter request was submitted.",
    };
  } catch (error) {
    console.error("Visa application submission failed:", error);
    return {
      success: false,
      message: "The visa application service is temporarily unavailable.",
    };
  }
}
