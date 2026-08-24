"use client";
// app/admin/orders/[id]/invoice/page.tsx

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Leaf, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { formatTaka } from "@/lib/utils";

export default function OrderInvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setOrder(json.order);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-forest font-medium">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span>Generating printable invoice...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-ink-soft">
        <p>Order not found</p>
        <Link href="/admin/orders" className="text-forest underline text-xs mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-8 print:p-0 print:bg-white text-neutral-900 font-sans">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Details</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-md transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Invoice Document Sheet */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl print:shadow-none print:p-8 border border-neutral-200 print:border-none space-y-8">
        {/* Header: Logo & Invoice Details */}
        <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest text-accent font-bold flex items-center justify-center text-xl font-display">
                E
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display tracking-wide text-forest leading-tight">
                  ENMAR
                </h1>
                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 block">
                  Pure Organic Food
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-600 max-w-xs leading-tight">
              House 12, Road 4, Dhanmondi, Dhaka - 1205, Bangladesh <br />
              Hotline: +880 1614 113082 • Web: enmar.bd
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-forest-soft text-forest text-xs font-bold font-mono rounded-lg">
              INVOICE / PACKING SLIP
            </span>
            <h2 className="text-lg font-bold font-mono text-neutral-900 mt-1">
              #{order.orderNumber}
            </h2>
            <p className="text-xs text-neutral-500 font-mono">
              Date: {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="text-xs text-neutral-500 font-mono">
              Tracking ID: <strong>{order.trackingId}</strong>
            </p>
          </div>
        </div>

        {/* 2-Column Addresses */}
        <div className="grid grid-cols-2 gap-8 py-2">
          {/* Bill & Ship To */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              Deliver To (Customer)
            </span>
            <h3 className="font-bold text-base text-neutral-900">{order.customerName}</h3>
            <p className="text-xs text-neutral-700 font-mono">{order.customerPhone}</p>
            <p className="text-xs text-neutral-600 leading-relaxed mt-1">
              {order.shippingAddress}
            </p>
            <span className="inline-block text-[11px] font-semibold text-forest bg-forest-soft px-2 py-0.5 rounded mt-1">
              {order.deliveryZone}
            </span>
          </div>

          {/* Logistics & Payment */}
          <div className="space-y-1.5 text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              Payment & Logistics
            </span>
            <p className="text-xs text-neutral-800">
              Payment Method: <strong>{order.paymentMethod}</strong>
            </p>
            <p className="text-xs text-neutral-800">
              Payment Status: <strong>{order.paymentStatus}</strong>
            </p>
            {order.courierPartner && (
              <p className="text-xs text-neutral-800">
                Courier: <strong>{order.courierPartner} Logistics</strong>
              </p>
            )}
            {order.courierTrackingId && (
              <p className="text-xs text-neutral-800 font-mono">
                Courier AWB: <strong>{order.courierTrackingId}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-neutral-300 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 uppercase font-mono text-[10px] text-neutral-700 border-b border-neutral-300">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items?.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="py-3 px-4 font-mono text-neutral-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-neutral-900">{item.productName}</td>
                  <td className="py-3 px-4 text-center text-neutral-600">{item.unit || "piece"}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatTaka(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                    {formatTaka(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Breakdown */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-mono text-neutral-900 font-semibold">
                {formatTaka(order.subtotal)}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.promoCodeText || "Coupon"}):</span>
                <span className="font-mono">-{formatTaka(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>Delivery Fee ({order.deliveryZone}):</span>
              <span className="font-mono text-neutral-900">
                {order.shippingFee === 0 ? "FREE" : formatTaka(order.shippingFee)}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t-2 border-neutral-900">
              <span>Total Amount:</span>
              <span className="font-mono text-forest">{formatTaka(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Guarantee */}
        <div className="border-t border-neutral-200 pt-6 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>100% Certified Organic & Unadulterated Food Guarantee.</span>
          </div>
          <div className="font-mono text-[11px]">
            Thank you for shopping with ENMAR!
          </div>
        </div>
      </div>
    </div>
  );
}
