// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Expire auth cookies
  response.cookies.set("enmar_session", "", {
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("enmar_role", "", {
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("enmar_delivery_token", "", {
    path: "/",
    expires: new Date(0),
  });

  return response;
}
