"use client";
// app/returns/page.tsx

import Link from "next/link";
import { RotateCcw, Clock, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ReturnsPolicyPage() {
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  return (
    <div className="min-h-screen bg-bg text-ink py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? "হোমপেজে ফিরে যান" : "Back to Home"}</span>
        </Link>

        <div className="space-y-3 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" />
            <span>{isBn ? "রিটার্ন ও রিফান্ড নীতি" : "Return & Refund Policy"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {isBn ? "সহজ ও ঝুঁকিমুক্ত রিটার্ন পলিসি" : "Hassle-free Returns & Refunds"}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            {isBn
              ? "ENMAR-এ আপনার সন্তুষ্টি আমাদের প্রধান অগ্রাধিকার। যেকোনো সমস্যায় দ্রুত সমাধানের নিশ্চয়তা।"
              : "At ENMAR, your satisfaction is our priority. Fast and transparent resolutions for all issues."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-ink">
              {isBn ? "৭ দিনের রিটার্ন সুবিধা" : "7 Days Return Policy"}
            </h3>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              {isBn
                ? "পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে ক্ষতিগ্রস্ত, ভুল বা মানহীন পণ্যের জন্য রিটার্ন বা এক্সচেঞ্জ আবেদন করতে পারবেন।"
                : "Eligible for return or exchange within 7 days of delivery in case of damaged, incorrect, or defective items."}
            </p>
          </div>

          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-ink">
              {isBn ? "১০০% রিফান্ড গ্যারান্টি" : "100% Refund Guarantee"}
            </h3>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              {isBn
                ? "রিটার্ন অনুমোদনের ৩-৫ কার্যদিবসের মধ্যে আপনার মূল পেমেন্ট মাধ্যমে (বিকাশ/নগদ/ব্যাংক) টাকা রিফান্ড পাবেন।"
                : "Refunds are processed within 3-5 business days directly to your original payment method (bKash/Nagad/Bank)."}
            </p>
          </div>
        </div>

        <div className="bg-forest/5 border border-forest/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-base font-bold text-forest">
              {isBn ? "রিটার্ন বা রিফান্ড আবেদন করতে চান?" : "Want to request a Return or Refund?"}
            </h4>
            <p className="text-xs text-ink-soft">
              {isBn
                ? "আপনার অর্ডার ট্র্যাকিং আইডি দিয়ে সহজেই অনলাইনে আবেদন সাবমিট করুন।"
                : "Submit your request easily online using your Order Tracking ID."}
            </p>
          </div>
          <Link
            href="/returns/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all shadow-md shrink-0"
          >
            <span>{isBn ? "রিটার্ন রিকোয়েস্ট পাঠান" : "Submit Return Request"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
