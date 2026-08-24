// app/api/storefront/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, generateTrackingId } from "@/lib/utils";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";
import { notifyOrderPlaced } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryZone = "Inside Dhaka",
      paymentMethod = "COD",
      items = [],
      promoCodeId,
      promoCodeText,
      customerNotes,
      userId,
    } = body;

    if (!customerName?.trim() || !customerPhone?.trim() || !shippingAddress?.trim() || items.length === 0) {
      return NextResponse.json(
        { error: "Please fill in your name, phone number, delivery address, and cart items." },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      let product = null;
      if (item.productId) {
        product = await prisma.product.findUnique({
          where: { id: Number(item.productId) },
        });
      } else if (item.productName) {
        product = await prisma.product.findFirst({
          where: { name: { contains: item.productName } },
        });
      }

      if (product) {
        const qty = Math.max(1, Number(item.quantity || 1));

        // Bug Fix 2: Prevent overselling / negative stock
        if (product.stockQuantity < qty) {
          return NextResponse.json(
            {
              error: `দুঃখিত, "${product.name}" এর পর্যাপ্ত স্টক নেই। বর্তমানে মাত্র ${product.stockQuantity} ${product.unit || "টি"} উপলব্ধ আছে।`,
            },
            { status: 400 }
          );
        }

        const unitPrice = Number(product.discountPrice || product.price);
        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;

        const imageSrc =
          Array.isArray(product.images) && product.images.length > 0
            ? (product.images[0] as string)
            : null;

        validatedItems.push({
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: qty,
          unit: product.unit || "piece",
          itemImage: imageSrc,
          totalPrice: itemTotal,
        });
      }
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: "No valid products in order." }, { status: 400 });
    }

    // Bug Fix 1: Check dynamic free shipping threshold from database setting
    let freeShippingThreshold = 1500;
    try {
      const thresholdSetting = await prisma.siteSetting.findUnique({
        where: { key: "freeShippingThreshold" },
      });
      if (thresholdSetting && Number(thresholdSetting.value) > 0) {
        freeShippingThreshold = Number(thresholdSetting.value);
      }
    } catch (e) {
      // fallback to 1500
    }

    let shippingFee = 0;
    if (subtotal >= freeShippingThreshold) {
      shippingFee = 0; // Free delivery qualified
    } else {
      shippingFee = deliveryZone === "Outside Dhaka" ? 130 : 70;
    }

    let discountAmount = 0;
    if (promoCodeId) {
      const promo = await prisma.promoCode.findUnique({
        where: { id: Number(promoCodeId) },
      });
      if (promo && promo.isActive) {
        if (promo.discountType === "PERCENTAGE") {
          discountAmount = (subtotal * Number(promo.discountValue)) / 100;
          if (promo.maxDiscountAmount && discountAmount > Number(promo.maxDiscountAmount)) {
            discountAmount = Number(promo.maxDiscountAmount);
          }
        } else if (promo.discountType === "FIXED") {
          discountAmount = Number(promo.discountValue);
        } else if (promo.discountType === "FREE_SHIPPING") {
          discountAmount = shippingFee;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
    const orderNumber = generateOrderNumber();
    const trackingId = generateTrackingId();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          trackingId,
          customerName: customerName.trim(),
          customerEmail: customerEmail?.trim() || "guest@enmar.bd",
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          deliveryZone,
          subtotal,
          discountAmount,
          promoCodeId: promoCodeId ? Number(promoCodeId) : null,
          promoCodeText: promoCodeText || null,
          shippingFee,
          totalAmount,
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          orderStatus: OrderStatus.PENDING,
          userId: userId ? Number(userId) : null,
          customerNotes: customerNotes || null,
          items: {
            create: validatedItems,
          },
        },
      });

      await tx.orderHistory.create({
        data: {
          orderId: createdOrder.id,
          status: OrderStatus.PENDING,
          note: "Order placed successfully. Awaiting order verification.",
          actorRole: "CUSTOMER",
          actorName: customerName,
        },
      });

      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: Number(promoCodeId) },
          data: { usageCount: { increment: 1 } },
        });
      }

      for (const it of validatedItems) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stockQuantity: { decrement: it.quantity } },
        });
      }

      return createdOrder;
    });

    notifyOrderPlaced(order).catch((err) =>
      console.error("[notifyOrderPlaced Exception]:", err)
    );

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("[Create Order Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
