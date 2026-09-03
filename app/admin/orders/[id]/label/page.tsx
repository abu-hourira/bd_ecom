"use client";
// app/admin/orders/[id]/label/page.tsx
// 2" x 3" (50.8mm x 76.2mm) Thermal Shipping Label / Parcel Sticker for Customer Orders

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Printer,
  FileText,
  Loader2,
  Phone,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Edit3,
  Check,
} from "lucide-react";
import { formatTaka, getSafeImageUrl } from "@/lib/utils";
import { generateBarcodeSvg } from "@/lib/barcode";

export default function OrderShippingLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<any | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [previewZoom, setPreviewZoom] = useState<number>(1.25);
  const [isEditing, setIsEditing] = useState(false);

  // Custom overrides if admin wants to fine-tune text before printing
  const [customSenderName, setCustomSenderName] = useState("");
  const [customSenderPhone, setCustomSenderPhone] = useState("");
  const [customSenderAddress, setCustomSenderAddress] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders/" + id).then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()).catch(() => ({ settings: {} })),
    ])
      .then(([orderRes, settingsRes]) => {
        if (orderRes.success && orderRes.order) {
          setOrder(orderRes.order);
        }
        if (settingsRes.success && settingsRes.settings) {
          const s = settingsRes.settings;
          setSettings(s);
          setCustomSenderName(s.brandName || "ENMAR");
          setCustomSenderPhone(s.contactPhone || s.whatsappNumber || "");
          setCustomSenderAddress(s.contactAddress || "Dhaka, Bangladesh");
        }
      })
      .catch((err) => console.error("Error loading label data:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 text-forest font-medium">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-forest" />
        <span>Loading shipping sticker label (2&quot; &times; 3&quot;)...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-neutral-600">
        <p>Order not found</p>
        <Link
          href="/admin/orders"
          className="text-forest underline text-xs mt-2 inline-block font-semibold"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const barcodeSvg = generateBarcodeSvg(order.trackingId || order.orderNumber, {
    height: 24,
    moduleWidth: 1.1,
    showText: true,
  });

  const isCOD = order.paymentMethod === "COD" || order.paymentStatus !== "PAID";
  
  // Sender Details (Prioritizing database settings and custom overrides)
  const brandName = customSenderName || settings.brandName || "ENMAR";
  const brandPhone = customSenderPhone || settings.contactPhone || settings.whatsappNumber || "";
  const brandAddress = customSenderAddress || settings.contactAddress || "Dhaka, Bangladesh";
  const brandLogo = settings.siteLogo || "";

  // Total items count
  const totalItemsCount =
    order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0;

  return (
    <div className="min-h-screen bg-neutral-200 py-6 px-4 print:p-0 print:m-0 print:bg-white text-neutral-900 font-sans">
      {/* Strict 2" x 3" Thermal Label Printing CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: 2in 3in;
            margin: 1.5mm 2mm 1.5mm 2mm;
          }
          html,
          body {
            width: 2in !important;
            height: 3in !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 8px !important;
            line-height: 1.15 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .label-container {
            width: 100% !important;
            max-width: 2in !important;
            height: auto !important;
            max-height: 3in !important;
            padding: 0 !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 1px dashed #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            transform: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Control Bar (Hidden when printing) */}
      <div className="max-w-md mx-auto mb-6 no-print space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/admin/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Order</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold shadow-xs transition-colors ${
                isEditing
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-forest" />}
              <span>{isEditing ? "Done Editing" : "Edit Sender Info"}</span>
            </button>

            <Link
              href={`/admin/orders/${order.id}/invoice`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4 text-forest" />
              <span>A4 Invoice</span>
            </Link>
          </div>
        </div>

        {/* Quick Edit Sender / Brand details drawer */}
        {isEditing && (
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 shadow-sm space-y-2 text-xs">
            <div className="font-bold text-amber-950 flex items-center justify-between">
              <span>Quick Edit Sender Information:</span>
              <span className="text-[10px] font-normal text-amber-800">
                (Temporary for this label print)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-amber-900 font-semibold mb-0.5">
                  Brand / Sender Name:
                </label>
                <input
                  type="text"
                  value={customSenderName}
                  onChange={(e) => setCustomSenderName(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-amber-900 font-semibold mb-0.5">
                  Sender Phone / Hotline:
                </label>
                <input
                  type="text"
                  value={customSenderPhone}
                  onChange={(e) => setCustomSenderPhone(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-amber-900 font-semibold mb-0.5">
                Return / Store Address:
              </label>
              <input
                type="text"
                value={customSenderAddress}
                onChange={(e) => setCustomSenderAddress(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
              />
            </div>
          </div>
        )}

        <div className="bg-white p-3 rounded-2xl border border-neutral-300 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
            <span>Zoom:</span>
            <button
              onClick={() => setPreviewZoom((z) => Math.max(0.8, Number((z - 0.15).toFixed(2))))}
              className="p-1 rounded bg-neutral-100 hover:bg-neutral-200"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs font-bold w-10 text-center">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              onClick={() => setPreviewZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
              className="p-1 rounded bg-neutral-100 hover:bg-neutral-200"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewZoom(1.25)}
              className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-500 ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label (2&quot; &times; 3&quot;)</span>
          </button>
        </div>

        <p className="text-[11px] text-center text-neutral-500">
          💡 Fits standard <strong>2&quot; &times; 3&quot; (50mm &times; 75mm)</strong> parcel sticker &amp; thermal POS barcode rolls.
        </p>
      </div>

      {/* 2" x 3" Shipping Label Card */}
      <div className="flex justify-center items-start">
        <div
          style={{ transform: `scale(${previewZoom})`, transformOrigin: "top center" }}
          className="transition-transform duration-150"
        >
          <div
            className="label-container bg-white text-black border-2 border-black rounded-lg p-2 shadow-xl print:shadow-none font-sans select-none"
            style={{
              width: "2in",
              minHeight: "3in",
              boxSizing: "border-box",
            }}
          >
            {/* 1. Brand Header with Real Store Logo */}
            <div className="flex items-center justify-between border-b border-black pb-1 mb-1">
              <div className="flex items-center gap-1.5">
                {brandLogo ? (
                  <div className="relative w-5 h-5 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getSafeImageUrl(brandLogo)}
                      alt={brandName}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded bg-black text-white font-bold flex items-center justify-center text-[10px] leading-none">
                    E
                  </div>
                )}
                <div>
                  <h1 className="text-[10.5px] font-black uppercase tracking-tight leading-none">
                    {brandName}
                  </h1>
                  <span className="text-[6.5px] uppercase font-bold text-neutral-700 tracking-wider block leading-none">
                    {settings.brandTagline || "Pure Organic Food"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[7.5px] font-mono font-black uppercase block leading-none">
                  #{order.orderNumber}
                </span>
                <span className="text-[6.5px] font-mono text-neutral-600 block leading-tight">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </div>

            {/* 2. Barcode & Tracking Number */}
            <div className="text-center my-0.5 border-b border-black pb-1">
              {barcodeSvg ? (
                <div
                  className="w-full flex justify-center [&>svg]:max-h-7 [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                />
              ) : (
                <div className="font-mono text-[9px] font-bold tracking-wider">
                  {order.trackingId}
                </div>
              )}
            </div>

            {/* 3. Recipient (Deliver To) Details */}
            <div className="border-b border-black pb-1 mb-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-black uppercase tracking-wider bg-black text-white px-1 py-0.2 rounded-xs">
                  SHIP TO:
                </span>
                <span className="text-[7.5px] font-bold text-neutral-800">
                  {order.deliveryZone || "Standard Delivery"}
                </span>
              </div>

              <div className="text-[9.5px] font-black leading-tight text-black truncate">
                {order.customerName}
              </div>

              <div className="flex items-center gap-1 font-mono text-[9px] font-black text-black">
                <Phone className="w-2.5 h-2.5 inline stroke-[2.5]" />
                <span>{order.customerPhone}</span>
              </div>

              <div className="text-[7.5px] leading-snug font-medium text-neutral-900 line-clamp-3">
                <MapPin className="w-2.5 h-2.5 inline mr-0.5 stroke-[2]" />
                {order.shippingAddress}
              </div>

              {order.customerNotes && (
                <div className="text-[6.5px] text-neutral-600 italic leading-tight pt-0.5">
                  <strong>Note:</strong> {order.customerNotes}
                </div>
              )}
            </div>

            {/* 4. Payment & COD Amount Box (Crucial for Courier Delivery) */}
            <div className="my-1 border-2 border-black rounded p-1 text-center bg-neutral-50 print:bg-white">
              {isCOD ? (
                <>
                  <div className="text-[7.5px] font-black uppercase tracking-wider text-black">
                    CASH ON DELIVERY (COD)
                  </div>
                  <div className="text-[13px] font-black font-mono leading-tight text-black">
                    COLLECT: {formatTaka(order.totalAmount)}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[7.5px] font-black uppercase tracking-wider bg-black text-white px-1 py-0.5 rounded-xs inline-block">
                    PREPAID &bull; {order.paymentMethod}
                  </div>
                  <div className="text-[11px] font-black font-mono leading-tight text-black mt-0.5">
                    COLLECT: ৳0 (PAID)
                  </div>
                </>
              )}
            </div>

            {/* 5. Courier & Package Content Breakdown */}
            <div className="text-[7px] space-y-0.5 border-b border-black pb-1 mb-1">
              <div className="flex justify-between items-center text-neutral-800 font-medium">
                <span>
                  <strong>Courier:</strong> {order.courierPartner || "Standard Delivery"}
                </span>
                <span>
                  <strong>Items:</strong> {totalItemsCount} pcs
                </span>
              </div>

              {order.courierTrackingId && (
                <div className="font-mono text-[7px]">
                  <strong>AWB/CN:</strong> {order.courierTrackingId}
                </div>
              )}

              {/* Items Summary Snippet */}
              <div className="text-[6.5px] text-neutral-700 leading-tight pt-0.5 line-clamp-2">
                <strong>Contents:</strong>{" "}
                {order.items
                  ?.map((it: any) => `${it.productName} (x${it.quantity})`)
                  .join(", ")}
              </div>
            </div>

            {/* 6. Return / Brand Origin Footer */}
            <div className="text-[6px] text-neutral-700 leading-tight text-center">
              <div className="font-bold text-black uppercase">
                Return if Undelivered To: {brandName}
              </div>
              <div>
                {brandAddress}
                {brandPhone ? ` • ☎ ${brandPhone}` : ""}
              </div>
              <div className="text-[5.5px] font-semibold text-neutral-500 pt-0.5">
                🌿 100% Organic • Handle with Care
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
