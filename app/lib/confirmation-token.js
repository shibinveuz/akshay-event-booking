import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
const LEGACY_TOKEN_GRACE_MS = 24 * 60 * 60 * 1000;

export const CONFIRMATION_LIFETIME_SECONDS = TOKEN_LIFETIME_MS / 1000;

function getEncryptionKey() {
  const secret = process.env.SERVER_SECRET_KEY;

  if (!secret) {
    throw new Error("SERVER_SECRET_KEY is not configured on the server.");
  }

  return createHash("sha256").update(secret).digest();
}

export function createConfirmationToken(data) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const issuedAt = Date.now();
  const plaintext = JSON.stringify({
    ...data,
    issuedAt,
    expiresAt: issuedAt + TOKEN_LIFETIME_MS,
  });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function readConfirmationToken(token, confirmationId) {
  try {
    const [ivValue, authTagValue, encryptedValue] = String(token).split(".");

    if (!ivValue || !authTagValue || !encryptedValue) {
      return null;
    }

    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const data = JSON.parse(plaintext);

    const expiresAt = Number(data.expiresAt);
    const isLegacyToken = !Number.isFinite(Number(data.issuedAt));
    const hasExpired =
      !Number.isFinite(expiresAt) ||
      expiresAt + (isLegacyToken ? LEGACY_TOKEN_GRACE_MS : 0) < Date.now();

    if (hasExpired || String(data.confirmationId) !== String(confirmationId)) {
      return null;
    }

    const {
      expiresAt: _expiresAt,
      issuedAt: _issuedAt,
      ...confirmation
    } = data;
    return confirmation;
  } catch {
    return null;
  }
}
