// lib/authSession.ts - Universal Edge & Node compatible Auth Session Helper

const SESSION_SECRET =
  process.env.ENCRYPTION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "enmar_master_auth_secret_vault_key_2026";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"];

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
  exp: number;
}

export function isStaffRole(role?: string): boolean {
  if (!role) return false;
  return STAFF_ROLES.includes(role);
}

// Simple Base64URL encode/decode
function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf8")
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
  return btoa(str)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf8");
  }
  return atob(base64);
}

/**
 * Creates a signed session token
 */
export function createSessionToken(payload: Omit<SessionPayload, "exp">, expiresInDays = 7): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  };

  const payloadStr = JSON.stringify(fullPayload);
  const encodedPayload = base64UrlEncode(payloadStr);

  // Simple signature hash based on secret
  let hash = 0;
  const combined = `${encodedPayload}.${SESSION_SECRET}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const signature = Math.abs(hash).toString(36);

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a session token
 */
export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token || !token.includes(".")) return null;

  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    // Verify signature
    let hash = 0;
    const combined = `${encodedPayload}.${SESSION_SECRET}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const expectedSignature = Math.abs(hash).toString(36);

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadStr = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadStr) as SessionPayload;

    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (e) {
    return null;
  }
}
