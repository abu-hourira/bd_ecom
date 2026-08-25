// middleware.ts - Next.js Edge Middleware for Admin & Delivery Route Protection
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, isStaffRole } from "@/lib/authSession";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Portal
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("enmar_session")?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session || !isStaffRole(session.role)) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Delivery Dashboard
  if (pathname.startsWith("/delivery/dashboard")) {
    const deliveryCookie = request.cookies.get("enmar_delivery_token")?.value;
    if (!deliveryCookie) {
      const loginUrl = new URL("/delivery/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/delivery/dashboard/:path*",
  ],
};
