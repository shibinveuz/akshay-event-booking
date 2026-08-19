"use server";

import "server-only";
import { getVisitorHistory } from "@/app/lib/api/visitor";
import { getVisaCountries } from "@/app/lib/api/registration";

export async function fetchVisitorHistoryAction() {
  return getVisitorHistory();
}

export async function fetchVisaCountriesAction() {
  try {
    return await getVisaCountries();
  } catch {
    return [];
  }
}
