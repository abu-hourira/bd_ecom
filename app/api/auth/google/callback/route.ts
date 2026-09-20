// app/api/auth/google/callback/route.ts - Handle Google OAuth 2.0 Callback
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/authSession";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const host = req.headers.get("host") || "enmar.shop";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const defaultOrigin = `${protocol}://${host}`;
  const origin = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || defaultOrigin).replace(/\/$/, "");

  // Determine fallback or target redirect url
  let callbackUrl = "/account/profile";
  if (state) {
    try {
      const parsedState = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      if (parsedState.callbackUrl && typeof parsedState.callbackUrl === "string") {
        callbackUrl = parsedState.callbackUrl;
      }
    } catch (e) {
      // Ignore invalid state json
    }
  }

  if (error || !code) {
    console.error("[Google OAuth Callback Error]:", error || "No code received");
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error || "AccessDenied")}`, origin)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    console.error("[Google OAuth Error]: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    return NextResponse.redirect(
      new URL(`/auth/login?error=GoogleAuthNotConfigured`, origin)
    );
  }

  try {
    // 1. Exchange authorization code for access & ID tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("[Google Token Exchange Failed]:", tokenData);
      return NextResponse.redirect(
        new URL(`/auth/login?error=GoogleTokenExchangeFailed`, origin)
      );
    }

    // 2. Fetch authenticated user profile from Google
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userinfoRes.json();

    if (!userinfoRes.ok || !googleUser.email) {
      console.error("[Google User Info Failed]:", googleUser);
      return NextResponse.redirect(
        new URL(`/auth/login?error=GoogleProfileFetchFailed`, origin)
      );
    }

    const cleanEmail = String(googleUser.email).toLowerCase().trim();
    const googleId = String(googleUser.id);
    const fullName = (googleUser.name || googleUser.given_name || cleanEmail.split("@")[0]).trim();
    const avatarUrl = googleUser.picture || null;

    // 3. Find existing user by googleId OR email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email: cleanEmail },
        ],
      },
    });

    if (user) {
      // Update googleId and avatar if missing
      const updateData: any = {};
      if (!user.googleId) updateData.googleId = googleId;
      if (!user.avatar && avatarUrl) updateData.avatar = avatarUrl;
      if (!user.isEmailVerified) updateData.isEmailVerified = true;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Create new customer account with Google identity
      user = await prisma.user.create({
        data: {
          name: fullName,
          email: cleanEmail,
          googleId,
          avatar: avatarUrl,
          role: Role.CUSTOMER,
          isEmailVerified: true,
          isPhoneVerified: false,
        },
      });
    }

    // 4. Generate signed session token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Determine safe redirect path
    const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"].includes(user.role);
    const finalRedirect = callbackUrl.startsWith("/")
      ? callbackUrl
      : isStaff
      ? "/admin"
      : "/account/profile";

    const response = NextResponse.redirect(new URL(finalRedirect, origin));

    // 5. Set session cookies
    response.cookies.set("enmar_session", token, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("enmar_role", user.role, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Clear state cookie
    response.cookies.delete("google_oauth_state");

    return response;
  } catch (err: any) {
    console.error("[Google OAuth Callback Exception]:", err);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(err.message || "ServerError")}`, origin)
    );
  }
}
