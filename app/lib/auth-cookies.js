import "server-only";

export const VISITOR_ACCESS_COOKIE = "visitor_access_token";
export const VISITOR_REFRESH_COOKIE = "visitor_refresh_token";
export const LEGACY_VISITOR_DATA_COOKIE = "visitor_data";
export const CONFIRMATION_ACCESS_COOKIE = "registration_confirmation_access";
export const CONFIRMATION_DATA_COOKIE = "registration_confirmation_data";
export const CONFIRMATION_FORM_TOKEN_COOKIE = "registration_confirmation_form_token";

const INVALID_COOKIE_VALUES = new Set(["", "null", "undefined"]);

export function isUnexpiredToken(value) {
  const token = String(value || "").trim();

  if (INVALID_COOKIE_VALUES.has(token.toLowerCase())) return false;

  const segments = token.split(".");
  if (segments.length !== 3) return true;

  try {
    const payload = JSON.parse(
      Buffer.from(segments[1], "base64url").toString("utf8"),
    );

    return !payload.exp || Number(payload.exp) * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function hasValidVisitorSession(cookieStore) {
  return cookieStore
    .getAll(VISITOR_ACCESS_COOKIE)
    .some((cookie) => isUnexpiredToken(cookie.value));
}
