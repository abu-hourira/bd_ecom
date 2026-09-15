// lib/authGuard.ts
import { verifySessionToken, SessionPayload, isStaffRole } from "./authSession";
import { NextRequest } from "next/server";

export { verifySessionToken, isStaffRole };
export type { SessionPayload };

/**
 * Universal token verifier supporting both cookie extraction and Authorization header
 */
export function verifyJwtToken(tokenOrReq?: string | NextRequest | null): SessionPayload | null {
  if (!tokenOrReq) return null;

  if (typeof tokenOrReq === "string") {
    return verifySessionToken(tokenOrReq);
  }

  // If NextRequest is passed
  const req = tokenOrReq as NextRequest;
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const payload = verifySessionToken(token);
    if (payload) return payload;
  }

  const cookieToken = req.cookies.get("enmar_session")?.value || req.cookies.get("token")?.value;
  return verifySessionToken(cookieToken);
}

export function requireAdmin(req: NextRequest): SessionPayload | null {
  const session = verifyJwtToken(req);
  if (!session || !isStaffRole(session.role)) {
    return null;
  }
  return session;
}
