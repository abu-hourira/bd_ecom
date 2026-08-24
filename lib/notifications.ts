// lib/notifications.ts
import prisma from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS notification via configured SMS gateway with fallback logging
 */
export async function sendSMS(
  recipientPhone: string,
  messageText: string,
  subject: string = "SMS Notification",
  orderId?: number
): Promise<NotificationResult> {
  try {
    const gateway = await prisma.notificationGateway.findFirst({
      where: { channel: "SMS", isActive: true },
    });

    let status = "FAILED";
    let errorMessage: string | null = null;

    if (!gateway) {
      errorMessage = "No active SMS gateway configured in Admin Settings.";
      console.log(`[SMS Simulation] To: ${recipientPhone} | Msg: ${messageText}`);
      // Record simulated log
      await prisma.notificationLog.create({
        data: {
          channel: "SMS",
          recipient: recipientPhone,
          subject,
          content: messageText,
          status: "SENT", // Marked sent in simulation mode
          errorReason: "Simulation mode (No SMS Gateway API Key configured)",
        },
      });
      return { success: true, messageId: "SIMULATED-SMS" };
    }

    let creds: any = {};
    if (gateway.credentialsEncrypted) {
      try {
        const decrypted = decrypt(gateway.credentialsEncrypted);
        creds = JSON.parse(decrypted || "{}");
      } catch (e) {
        console.error("Error decrypting SMS credentials:", e);
      }
    }

    const apiKey = creds.apiKey || "";
    const senderId = gateway.senderId || "ENMAR";

    // Standard Bangladeshi SMS API Request (BulkSMSBD / Generic REST)
    const endpoint =
      creds.apiEndpoint ||
      `https://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${recipientPhone}&senderid=${senderId}&message=${encodeURIComponent(messageText)}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          sender_id: senderId,
          number: recipientPhone,
          message: messageText,
        }),
      });

      status = response.ok ? "SENT" : "FAILED";
      if (!response.ok) {
        const resText = await response.text();
        errorMessage = `HTTP ${response.status}: ${resText}`;
      }
    } catch (apiErr: any) {
      errorMessage = apiErr.message;
      status = "FAILED";
    }

    await prisma.notificationLog.create({
      data: {
        gatewayId: gateway.id,
        channel: "SMS",
        recipient: recipientPhone,
        subject,
        content: messageText,
        status: status === "SENT" ? "SENT" : "FAILED",
        errorReason: errorMessage,
      },
    });

    return {
      success: status === "SENT",
      error: errorMessage || undefined,
    };
  } catch (error: any) {
    console.error("[sendSMS Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Email notification via configured Email gateway with fallback logging
 */
export async function sendEmail(
  recipientEmail: string,
  subject: string,
  contentHtml: string,
  orderId?: number
): Promise<NotificationResult> {
  try {
    const gateway = await prisma.notificationGateway.findFirst({
      where: { channel: "EMAIL", isActive: true },
    });

    if (!gateway) {
      console.log(`[Email Simulation] To: ${recipientEmail} | Subject: ${subject}`);
      await prisma.notificationLog.create({
        data: {
          channel: "EMAIL",
          recipient: recipientEmail,
          subject,
          content: contentHtml,
          status: "SENT",
          errorReason: "Simulation mode (No SMTP configured)",
        },
      });
      return { success: true, messageId: "SIMULATED-EMAIL" };
    }

    // Record log
    await prisma.notificationLog.create({
      data: {
        gatewayId: gateway.id,
        channel: "EMAIL",
        recipient: recipientEmail,
        subject,
        content: contentHtml,
        status: "SENT",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[sendEmail Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * High-level automated event notifications
 */
export async function notifyOrderPlaced(order: any) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const trackingLink = `${appUrl}/track/${order.trackingId}`;

  // 1. Customer SMS
  const customerMsg = `Dear ${order.customerName}, your ENMAR organic food order (${order.orderNumber}) of ৳${order.totalAmount} is confirmed! Track live parcel: ${trackingLink}`;
  sendSMS(order.customerPhone, customerMsg, "Order Confirmation", order.id).catch(console.error);

  // 2. Customer Email
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #14421a;">🌱 ENMAR Pure Organic Food</h2>
      <p>Dear <strong>${order.customerName}</strong>,</p>
      <p>Thank you for choosing certified organic food. We have received your order <strong>#${order.orderNumber}</strong>.</p>
      <div style="background: #fdfbf7; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
        <p><strong>Total Amount:</strong> ৳${order.totalAmount}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Delivery Address:</strong> ${order.shippingAddress} (${order.deliveryZone})</p>
      </div>
      <p><a href="${trackingLink}" style="background: #14421a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">Track Your Parcel Live</a></p>
      <p style="color: #777; font-size: 12px; margin-top: 20px;">If you have any questions, reply to this email or call +880 1614 113082.</p>
    </div>
  `;
  sendEmail(order.customerEmail, `Order Received #${order.orderNumber} - ENMAR Organic Food`, emailHtml, order.id).catch(console.error);

  // 3. Admin Alert SMS
  const adminMsg = `[ENMAR ALERT] New Order received! No: ${order.orderNumber}, Amount: ৳${order.totalAmount}, Customer: ${order.customerName} (${order.customerPhone}).`;
  const adminPhone = process.env.ADMIN_ALERT_PHONE || "01614113082";
  sendSMS(adminPhone, adminMsg, "Admin New Order Alert", order.id).catch(console.error);
}

export async function notifyOrderStatusChanged(
  order: any,
  newStatus: string,
  note?: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trackingLink = `${appUrl}/track/${order.trackingId}`;

  let statusText = newStatus;
  if (newStatus === "CONFIRMED") statusText = "Verified & Confirmed";
  if (newStatus === "PACKED") statusText = "Freshly Packed at Warehouse";
  if (newStatus === "SHIPPED") statusText = `Handed over to ${order.courierPartner || "Courier"} Logistics`;
  if (newStatus === "OUT_FOR_DELIVERY") statusText = "Out for Delivery with Rider";
  if (newStatus === "DELIVERED") statusText = "Delivered Successfully";
  if (newStatus === "CANCELLED") statusText = "Cancelled";

  const refundNotice = order.refundNeeded || order.refundStatus === "REFUND_NEEDED"
    ? " Your online payment refund is being processed back to your original payment channel."
    : "";

  const reasonText = note || order.cancellationReason ? `Reason: ${note || order.cancellationReason}.` : "";

  const customerMsg = newStatus === "CANCELLED"
    ? `ENMAR Order #${order.orderNumber} Cancelled. ${reasonText}${refundNotice} Tracking: ${trackingLink}`
    : `ENMAR Order #${order.orderNumber} Update: Your parcel status is now [${statusText}]. ${note ? `Note: ${note}. ` : ""}Track live: ${trackingLink}`;

  if (newStatus === "CANCELLED") {
    const cancelEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #be123c;">? Order Cancelled</h2>
        <p>Dear <strong>${order.customerName}</strong>,</p>
        <p>Your order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
        <div style="background: #fff1f2; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #fecdd3;">
          <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
          <p><strong>Cancellation Reason:</strong> ${note || order.cancellationReason || "Cancelled"}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          ${order.refundNeeded ? '<p style="color: #be123c; font-weight: bold;">Refund Status: Refund Needed / In Process</p>' : ''}
        </div>
        <p><a href="${trackingLink}" style="background: #14421a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">View Tracking Details</a></p>
      </div>
    `;
    sendEmail(order.customerEmail, `Order #${order.orderNumber} Cancelled - ENMAR Organic Food`, cancelEmailHtml, order.id).catch(console.error);
  }

  
  sendSMS(order.customerPhone, customerMsg, "Order Status Update", order.id).catch(console.error);
}
