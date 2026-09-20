// app/api/auth/google/route.ts - Initiate Google OAuth 2.0
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const clientId = process.env.GOOGLE_CLIENT_ID;

  // Determine site base URL (prefer production domain or request host)
  const host = req.headers.get("host") || "enmar.shop";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const defaultOrigin = `${protocol}://${host}`;
  const origin = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || defaultOrigin).replace(/\/$/, "");

  if (!clientId) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=GoogleAuthNotConfigured`, origin)
    );
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  // Encode state with callback URL and timestamp
  const statePayload = {
    callbackUrl,
    timestamp: Date.now(),
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(googleAuthUrl.toString());

  // Set secure CSRF state cookie
  res.cookies.set("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 15, // 15 mins
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
