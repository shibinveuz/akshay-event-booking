import { isValidPhoneNumber } from "libphonenumber-js/mobile";

/**
 * Validates whether an email address is strictly formatted per RFC 5322 specifications.
 * Rejects invalid, incomplete, or malformed email addresses.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }

  const trimmed = email.trim();

  // Maximum email length per spec
  if (trimmed.length < 5 || trimmed.length > 254) {
    return false;
  }

  // Email must not start or end with spaces
  if (/^\s|\s$/.test(email)) {
    return false;
  }

  // Strict email regex matching RFC 5322
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/i;
  if (!emailRegex.test(trimmed)) {
    return false;
  }

  // Disallow consecutive dots
  if (trimmed.includes("..")) {
    return false;
  }

  return true;
}

/**
 * Validates a mobile phone number based on the selected country ISO code or calling code.
 * Ensures the phone number has a valid length and format for that specific country.
 * Rejects partial numbers (e.g. 2, 3, or 4 digits).
 */
export function validatePhoneNumber(
  mobileInput,
  phoneCodeInput,
  phoneCountryInput,
) {
  const rawMobile = String(mobileInput || "").trim();
  const digits = rawMobile.replace(/\D/g, "");

  if (!digits) {
    return {
      isValid: false,
      message: "Mobile number is required.",
    };
  }

  // Reject impossibly short or long digit strings (standard E.164 lengths: 6 to 15 digits)
  if (digits.length < 6 || digits.length > 15) {
    return {
      isValid: false,
      message: "Please enter a valid phone number",
    };
  }

  const cleanPhoneCode = String(phoneCodeInput || "").replace(/\D/g, "");
  const countryCode = String(phoneCountryInput || "").toUpperCase();

  let valid = false;

  // 1. Try validating with national number and 2-letter ISO country code if available
  if (countryCode && countryCode.length === 2) {
    try {
      valid = isValidPhoneNumber(rawMobile, countryCode);
    } catch {
      valid = false;
    }
  }

  // 2. If not valid yet, try validating with full E.164 number (+phoneCode + mobile)
  if (!valid && cleanPhoneCode) {
    try {
      const e164 = `+${cleanPhoneCode}${digits}`;
      valid = isValidPhoneNumber(e164);
    } catch {
      valid = false;
    }
  }

  // 3. If mobile starts with '+', validate as international number
  if (!valid && rawMobile.startsWith("+")) {
    try {
      valid = isValidPhoneNumber(rawMobile);
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    return {
      isValid: false,
      message: "Please enter a valid phone number",
    };
  }

  return { isValid: true, message: "" };
}

/**
 * Validates name fields (First Name, Last Name).
 * Rejects empty strings, whitespace-only strings, or strings under minLength.
 */
export function validateName(value, fieldLabel, minLength = 2) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return `${fieldLabel} is required.`;
  }
  if (trimmed.length < minLength) {
    return `${fieldLabel} must be at least ${minLength} characters.`;
  }
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(trimmed)) {
    return `${fieldLabel} must contain only letters.`;
  }
  return "";
}

/**
 * Validates Job Title against specific patterns:
 * - Must not be an email address
 * - Must match allowed characters (letters, numbers, spaces, /, -, &)
 * - Must not be numbers only
 * - Must contain at least one letter
 */
export function validateJobTitle(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "Job title is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailPattern.test(trimmed)) {
    return "Invalid job title. Cannot be an email address.";
  }

  const allowedCharsPattern = /^[a-zA-Z0-9\s\/\-&]+$/;
  if (!allowedCharsPattern.test(trimmed)) {
    return "Invalid job title. Only letters, numbers, spaces, /, -, and & allowed.";
  }

  if (/^\d+$/.test(trimmed)) {
    return "Invalid job title. Cannot be numbers only.";
  }

  if (!/[a-zA-Z]/.test(trimmed)) {
    return "Invalid job title. Must contain at least one letter.";
  }

  return "";
}

/**
 * Validates Company Name against specific patterns:
 * - Must not be an email address
 * - Must allow only letters, numbers, spaces, and basic punctuation (& ' ’ . -)
 * - Cannot be numbers only or special characters only
 * - Must start and end with an alphanumeric character (if length > 1)
 * - Cannot have consecutive special characters (&'’.-)
 */
export function validateCompanyName(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "Company name is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailPattern.test(trimmed)) {
    return "Invalid company name";
  }

  const allowedPattern = /^[a-zA-Z0-9\s&'’.-]+$/;
  if (!allowedPattern.test(trimmed)) {
    return "Invalid company name";
  }

  if (/^\d+$/.test(trimmed)) {
    return "Invalid company name";
  }

  if (/^[^a-zA-Z0-9]+$/.test(trimmed)) {
    return "Invalid company name";
  }

  if (trimmed.length > 1 && !/^[a-zA-Z0-9].*[a-zA-Z0-9]$/.test(trimmed)) {
    return "Company name must start and end with a letter or number.";
  }

  if (/([&'’.\-]{2,})/.test(trimmed)) {
    return "Company name cannot contain consecutive special characters.";
  }

  if (/[\s][&'’.\-]|([&'’.\-])[\s]/.test(trimmed)) {
    return "Special characters in company name must be attached to words.";
  }

  return "";
}

/**
 * Validates passport and birth date fields for visa applications.
 */
export function validateVisaForm(visaForm) {
  const errors = {};

  const fullName = String(visaForm?.passport_fullname || "").trim();
  if (!fullName) {
    errors.passport_fullname =
      "Full name as in international passport is required.";
  } else if (!/^[A-Za-z\s]+$/.test(fullName)) {
    errors.passport_fullname =
      "Full name must contain only letters and spaces.";
  }

  const passportNumber = String(visaForm?.passport_number || "")
    .trim()
    .toUpperCase();
  if (!passportNumber) {
    errors.passport_number = "Passport number is required.";
  } else if (passportNumber.length < 6) {
    errors.passport_number = "Passport number must be at least 6 characters.";
  } else if (!/^[A-Z0-9]+$/.test(passportNumber)) {
    errors.passport_number =
      "Passport number can only contain uppercase letters and numbers.";
  } else {
    const firstChar = passportNumber.charAt(0);
    if (passportNumber.split("").every((char) => char === firstChar)) {
      errors.passport_number = "Invalid passport number.";
    }
  }

  // Date of Birth validation
  const dob = visaForm?.visa_dob || {};
  if (!dob.dd || !dob.mm || !dob.yyyy) {
    errors.visa_dob = "Date of birth is required.";
  } else {
    const day = parseInt(dob.dd, 10);
    const month = parseInt(dob.mm, 10) - 1;
    const year = parseInt(dob.yyyy, 10);
    const dobDate = new Date(year, month, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      dobDate.getFullYear() !== year ||
      dobDate.getMonth() !== month ||
      dobDate.getDate() !== day
    ) {
      errors.visa_dob = "Invalid date of birth.";
    } else if (dobDate > now) {
      errors.visa_dob = "Date of birth cannot be in the future.";
    } else {
      let age = now.getFullYear() - dobDate.getFullYear();
      const monthDiff = now.getMonth() - dobDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && now.getDate() < dobDate.getDate())
      ) {
        age--;
      }
      if (age < 21) {
        errors.visa_dob = "You must be at least 21 years old.";
      }
    }
  }

  // Passport Expiry Date validation
  const expiry = visaForm?.passport_expiry_date || {};
  if (!expiry.dd || !expiry.mm || !expiry.yyyy) {
    errors.passport_expiry_date = "Passport expiry date is required.";
  } else {
    const day = parseInt(expiry.dd, 10);
    const month = parseInt(expiry.mm, 10) - 1;
    const year = parseInt(expiry.yyyy, 10);
    const expiryDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    if (
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      expiryDate.getFullYear() !== year ||
      expiryDate.getMonth() !== month ||
      expiryDate.getDate() !== day
    ) {
      errors.passport_expiry_date = "Invalid passport expiry date.";
    } else if (expiryDate <= today) {
      errors.passport_expiry_date =
        "Passport expiration date must be a future date.";
    } else if (expiryDate < sixMonthsFromNow) {
      errors.passport_expiry_date =
        "Passport should be valid for at least 6 months.";
    }
  }

  if (!visaForm?.passport_nationality) {
    errors.passport_nationality = "Nationality is required.";
  }

  if (!visaForm?.passport_country) {
    errors.passport_country = "Country of residence is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
