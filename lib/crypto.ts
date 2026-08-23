// lib/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET = (process.env.ENCRYPTION_SECRET || process.env.SESSION_SECRET || "enmar_default_vault_secret_key_32_bytes!").slice(0, 32).padEnd(32, "0");

/**
 * Encrypt sensitive credential strings at rest before saving into MySQL/PostgreSQL
 */
export function encryptData(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET), iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt sensitive credential server-side only
 */
export function decryptData(cipherPayload: string): string {
  if (!cipherPayload) return "";
  try {
    const parts = cipherPayload.split(":");
    if (parts.length !== 3) return cipherPayload; // Fallback if plaintext
    const [ivHex, authTagHex, encryptedText] = parts;
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("[Crypto] Decryption error:", error);
    return "";
  }
}

export { encryptData as encrypt, decryptData as decrypt, encryptData as encryptAES, decryptData as decryptAES };

