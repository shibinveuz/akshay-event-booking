"use client";

import { useState } from "react";

export const EMPTY_VISA_FORM = {
  passport_fullname: "",
  visa_dob: { dd: "", mm: "", yyyy: "" },
  passport_number: "",
  passport_expiry_date: { dd: "", mm: "", yyyy: "" },
  passport_nationality: "",
  passport_country: "",
};

function normalizeVisaForm(initialValues = {}) {
  return {
    ...EMPTY_VISA_FORM,
    ...initialValues,
    visa_dob: {
      ...EMPTY_VISA_FORM.visa_dob,
      ...initialValues.visa_dob,
    },
    passport_expiry_date: {
      ...EMPTY_VISA_FORM.passport_expiry_date,
      ...initialValues.passport_expiry_date,
    },
  };
}

export function isVisaFormComplete(visaForm) {
  return Boolean(
    visaForm.passport_fullname.trim() &&
      visaForm.passport_number.trim() &&
      Object.values(visaForm.visa_dob).every(Boolean) &&
      Object.values(visaForm.passport_expiry_date).every(Boolean) &&
      visaForm.passport_nationality &&
      visaForm.passport_country,
  );
}

export function useVisaForm(initialValues = {}) {
  const [visaForm, setVisaForm] = useState(() =>
    normalizeVisaForm(initialValues),
  );

  const setVisaField = (name, value) => {
    setVisaForm((previous) => ({ ...previous, [name]: value }));
  };

  const setVisaDateField = (group, field, value) => {
    setVisaForm((previous) => ({
      ...previous,
      [group]: { ...previous[group], [field]: value },
    }));
  };

  return { visaForm, setVisaField, setVisaDateField };
}
