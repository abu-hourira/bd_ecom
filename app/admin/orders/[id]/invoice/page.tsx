"use client";
// app/admin/orders/[id]/invoice/page.tsx

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Leaf, ShieldCheck, CheckCircle2, Loader2, Tag } from "lucide-react";
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
    fetch('/api/admin/orders/' + id)
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
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 print:p-0 print:m-0 print:bg-white text-neutral-900 font-sans">
      {/* Strict 1-Page Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 10mm 6mm 10mm;
          }
          html, body {
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #111827 !important;
            font-size: 11px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between no-print print:hidden">
        <Link
          href={'/admin/orders/' + order.id}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Details</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}/label`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-forest/30 bg-forest-soft text-forest hover:bg-forest hover:text-white text-xs font-bold transition-all shadow-xs"
          >
            <Tag className="w-4 h-4" />
            <span>Shipping Label (2&quot;&times;3&quot;)</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as 1-Page PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Sheet (1-Page Fitted) */}
      <div className="invoice-sheet max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl print:shadow-none border border-neutral-200 print:border-none space-y-4">
        {/* Header: Logo & Invoice Details */}
        <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest text-accent font-bold flex items-center justify-center text-lg font-display">
                E
              </div>
              <div>
                <h1 className="text-xl font-bold font-display tracking-wide text-forest leading-tight">
                  ENMAR
                </h1>
                <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block leading-none">
                  Pure Organic Food
                </span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-600 leading-tight pt-1">
              House 14, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh <br />
              Hotline: +880 1614 113082 &bull; Email: support@enmar.bd &bull; Web: enmar.bd
            </p>
          </div>

          <div className="text-right space-y-0.5">
            <span className="inline-block px-2.5 py-0.5 bg-forest-soft text-forest text-[10px] font-bold font-mono rounded">
              INVOICE / PACKING SLIP
            </span>
            <h2 className="text-base font-bold font-mono text-neutral-900">
              #{order.orderNumber}
            </h2>
            <p className="text-[10px] text-neutral-500 font-mono">
              Date: {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">
              Tracking: <strong>{order.trackingId}</strong>
            </p>
          </div>
        </div>

        {/* 2-Column Addresses */}
        <div className="grid grid-cols-2 gap-6 py-1 text-xs">
          {/* Bill & Ship To */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Deliver To (Customer)
            </span>
            <h3 className="font-bold text-sm text-neutral-900 leading-tight">{order.customerName}</h3>
            <p className="text-xs text-neutral-700 font-mono">{order.customerPhone}</p>
            <p className="text-[11px] text-neutral-600 leading-snug">
              {order.shippingAddress}
            </p>
            <span className="inline-block text-[10px] font-semibold text-forest bg-forest-soft px-1.5 py-0.5 rounded">
              {order.deliveryZone}
            </span>
          </div>

          {/* Logistics & Payment */}
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Payment & Logistics
            </span>
            <p className="text-[11px] text-neutral-800">
              Payment Method: <strong>{order.paymentMethod}</strong>
            </p>
            <p className="text-[11px] text-neutral-800">
              Payment Status: <strong>{order.paymentStatus}</strong>
            </p>
            {order.courierPartner && (
              <p className="text-[11px] text-neutral-800">
                Courier: <strong>{order.courierPartner}</strong>
              </p>
            )}
            {order.courierTrackingId && (
              <p className="text-[11px] text-neutral-800 font-mono">
                AWB: <strong>{order.courierTrackingId}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-neutral-300 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 uppercase font-mono text-[9px] text-neutral-700 border-b border-neutral-300">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Item Description</th>
                <th className="py-2 px-3 text-center">Unit</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3 text-right">Unit Price</th>
                <th className="py-2 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items?.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="py-1.5 px-3 font-mono text-neutral-500 text-[11px]">{idx + 1}</td>
                  <td className="py-1.5 px-3 font-bold text-neutral-900 text-[11px]">{item.productName}</td>
                  <td className="py-1.5 px-3 text-center text-neutral-600 text-[10px]">{item.unit || "piece"}</td>
                  <td className="py-1.5 px-3 text-center font-mono font-bold text-neutral-900 text-[11px]">{item.quantity}</td>
                  <td className="py-1.5 px-3 text-right font-mono text-[11px]">{formatTaka(item.unitPrice)}</td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold text-neutral-900 text-[11px]">
                    {formatTaka(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Breakdown */}
        <div className="flex justify-end pt-1">
          <div className="w-60 space-y-1 text-xs">
            <div className="flex justify-between text-neutral-600 text-[11px]">
              <span>Subtotal:</span>
              <span className="font-mono text-neutral-900 font-semibold">
                {formatTaka(order.subtotal)}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 text-[11px]">
                <span>Discount ({order.promoCodeText || "Coupon"}):</span>
                <span className="font-mono">-{formatTaka(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600 text-[11px]">
              <span>Delivery Fee ({order.deliveryZone}):</span>
              <span className="font-mono text-neutral-900">
                {order.shippingFee === 0 ? "FREE" : formatTaka(order.shippingFee)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1.5 border-t-2 border-neutral-900">
              <span>Total Amount:</span>
              <span className="font-mono text-forest">{formatTaka(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Guarantee */}
        <div className="border-t border-neutral-200 pt-3 flex items-center justify-between text-[10px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            <span>100% Certified Organic & Unadulterated Food Guarantee.</span>
          </div>
          <div className="font-mono text-[10px] font-semibold">
            Thank you for choosing ENMAR!
          </div>
        </div>
      </div>
    </div>
  );
}
