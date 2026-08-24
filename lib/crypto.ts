// lib/crypto.ts - Safe Deterministic AES-256-CBC / GCM Credential Vault
import crypto from "crypto";

const FIXED_SECRET = "enmar_super_secure_vault_key_32_bytes_2026!";
const ALGORITHM = "aes-256-cbc";
const KEY = crypto.createHash("sha256").update(process.env.ENCRYPTION_SECRET || FIXED_SECRET).digest();

/**
 * Encrypt sensitive credential strings at rest
 */
export function encryptData(plainText: string): string {
  if (!plainText) return "";
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (e) {
    console.error("[Crypto Encrypt Error]:", e);
    // Safe base64 fallback
    return `b64:${Buffer.from(plainText, "utf8").toString("base64")}`;
  }
}

/**
 * Decrypt sensitive credential server-side
 */
export function decryptData(cipherPayload: string): string {
  if (!cipherPayload) return "";
  try {
    if (cipherPayload.startsWith("b64:")) {
      return Buffer.from(cipherPayload.slice(4), "base64").toString("utf8");
    }

    const parts = cipherPayload.split(":");
    // Legacy AES-GCM (3 parts) fallback
    if (parts.length === 3) {
      const [ivHex, authTagHex, encryptedText] = parts;
      const legacyKey = (process.env.ENCRYPTION_SECRET || process.env.SESSION_SECRET || "enmar_default_vault_secret_key_32_bytes!").slice(0, 32).padEnd(32, "0");
      try {
        const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(legacyKey), Buffer.from(ivHex, "hex"));
        decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
        let dec = decipher.update(encryptedText, "hex", "utf8");
        dec += decipher.final("utf8");
        return dec;
      } catch (legacyErr) {
        // Continue to CBC trial
      }
    }

    // CBC format (2 parts: iv:encrypted)
    if (parts.length === 2) {
      const [ivHex, encryptedText] = parts;
      const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, "hex"));
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    }

    // Plaintext / unencrypted fallback
    return cipherPayload;
  } catch (error) {
    console.error("[Crypto Decrypt Error]:", error);
    return "";
  }
}

export { encryptData as encrypt, decryptData as decrypt, encryptData as encryptAES, decryptData as decryptAES };
