"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";

export default function NewReturnPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [reason, setReason] = useState("");
  const [returnType, setReturnType] = useState("REFUND");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim() || !reason.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/storefront/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingId, reason, returnType }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        alert(json.error || "Failed to submit return request");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl border border-line bg-paper text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink">
              Request Return or Replacement
            </h1>
            <p className="text-xs text-ink-soft mt-0.5">
              100% money-back guarantee for damaged, broken seal, or incorrect organic items.
            </p>
          </div>
        </div>

        {success ? (
          <div className="bg-paper p-8 rounded-3xl border border-line shadow-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold font-display text-xl text-ink">
              Return Request Submitted!
            </h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
              Our quality assurance team will inspect your claim within 12–24 hours and issue a full refund or replacement dispatch.
            </p>
            <Link
              href="/"
              className="inline-flex px-6 py-2.5 rounded-full bg-forest text-white text-xs font-semibold"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">
                Order Tracking ID (e.g. ENM-XXXXXXXX) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ENM-XXXXXXXX"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">
                Request Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReturnType("REFUND")}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left ${
                    returnType === "REFUND"
                      ? "border-forest bg-forest-soft text-forest"
                      : "border-line bg-bg text-ink"
                  }`}
                >
                  Full Money Refund (bKash/Nagad/Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setReturnType("REPLACEMENT")}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left ${
                    returnType === "REPLACEMENT"
                      ? "border-forest bg-forest-soft text-forest"
                      : "border-line bg-bg text-ink"
                  }`}
                >
                  Free Fresh Replacement Parcel
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">
                Reason & Details of Defect <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe any damaged packaging, broken glass jar, or unsealed honey container..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs"
              />
            </div>

            <div className="p-4 rounded-2xl bg-forest-soft/60 border border-forest/10 text-xs text-forest flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>ENMAR Trust Policy: Returns accepted within 7 days of delivery.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-sm shadow-premium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              <span>Submit Return Request</span>
            </button>
          </form>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
