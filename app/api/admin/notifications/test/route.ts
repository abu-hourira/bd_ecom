// app/api/admin/notifications/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendSMS, sendEmail } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, recipient, smtpHost, smtpPort, smtpUser, smtpPass } = body;

    if (!channel || !recipient) {
      return NextResponse.json(
        { error: "Channel and recipient are required" },
        { status: 400 }
      );
    }

    const ch = channel.trim().toUpperCase();

    if (ch === "SMS") {
      const msg = `[ENMAR Test] Verification SMS from ENMAR Admin Panel at ${new Date().toLocaleTimeString("en-GB")}. SMS Gateway is online!`;
      const result = await sendSMS(recipient, msg, "TEST");
      if (!result.success) {
        return NextResponse.json({ error: result.error || "SMS failed to send" }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Test SMS sent successfully." });
    } else if (ch === "EMAIL") {
      const subject = `[ENMAR Test] Email Gateway Verification - ${new Date().toLocaleTimeString("en-GB")}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 540px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background: #ffffff;">
          <h2 style="color: #14421a; margin-top: 0;">🌱 ENMAR Email Gateway Online!</h2>
          <p>Congratulations! Your SMTP email gateway has been verified and is working properly.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Sent from ENMAR Organic Food BD &bull; ${new Date().toLocaleString()}</p>
        </div>
      `;

      const overrideCredentials =
        smtpUser && smtpPass
          ? {
              smtpHost,
              smtpPort,
              smtpUser,
              smtpPass: smtpPass !== "••••••••••••" ? smtpPass : undefined,
            }
          : undefined;

      const result = await sendEmail(recipient, subject, html, undefined, overrideCredentials);
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Email failed to send" }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Test email sent successfully to " + recipient });
    }

    return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
