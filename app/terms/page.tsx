"use client";
// app/terms/page.tsx

import Link from "next/link";
import { ShieldCheck, FileText, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
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
            <FileText className="w-4 h-4" />
            <span>{isBn ? "শর্তাবলি ও নিয়মকানুন" : "Terms & Conditions"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {isBn ? "টার্মস অ্যান্ড কন্ডিশনস" : "Terms of Service"}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            {isBn
              ? "ENMAR ওয়েবসাইট ব্যবহার এবং পণ্য ক্রয়ের ক্ষেত্রে প্রযোজ্য সাধারণ নিয়মাবলি ও শর্তাবলি।"
              : "General terms and conditions governing the use of ENMAR website and product orders."}
          </p>
        </div>

        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6 text-xs sm:text-sm text-ink-soft leading-relaxed">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">
                {isBn ? "১. পণ্য ও মূল্য নির্ধারণ" : "1. Products & Pricing"}
              </h3>
              <p>
                {isBn
                  ? "ওয়েবসাইটে প্রদর্শিত সব পণ্যের মূল্য বাংলাদেশি টাকায় (BDT) নির্ধারিত। স্টক থাকা সাপেক্ষে সকল অর্ডার সম্পন্ন করা হয়। কোনো কারণে পণ্যের স্টক শেষ হয়ে গেলে গ্রাহককে অবহিত করে রিফান্ড বা বিকল্প প্রস্তাব দেওয়া হবে।"
                  : "All product prices are quoted in Bangladeshi Taka (BDT). Orders are subject to inventory availability. If an item runs out of stock, we will notify you promptly for a replacement or refund."}
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-ink mb-1">
                {isBn ? "২. অর্ডার কনফার্মেশন ও ক্যান্সেলেশন" : "2. Order Confirmation & Cancellation"}
              </h3>
              <p>
                {isBn
                  ? "অর্ডার প্লেস করার পর ডেলিভারি শুরুর আগে গ্রাহক তার অ্যাকাউন্ট থেকে সরাসরি অর্ডার বাতিল করতে পারেন। পার্সেল ডেলিভারিতে চলে গেলে ক্যান্সেলেশন প্রযোজ্য হবে না।"
                  : "Customers can cancel pending orders directly from their account before dispatch. Once an order is handed over to the courier, standard cancellation is closed."}
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-ink mb-1">
                {isBn ? "৩. রিটার্ন ও রিফান্ড নীতি" : "3. Returns & Refunds"}
              </h3>
              <p>
                {isBn
                  ? "পণ্য প্রাপ্তির ৩ দিনের মধ্যে কোনো ত্রুটি থাকলে সরাসরি আমাদের রিটার্ন পেজ থেকে রিফান্ড বা এক্সচেঞ্জের আবেদন করা যাবে। অনুমোদিত রিফান্ড বিকাশ/নগদে ২৪-৭২ ঘণ্টার মধ্যে পরিশোধ করা হয়।"
                  : "Customers can submit return/refund requests within 3 days of delivery for damaged or incorrect goods. Approved refunds are processed via bKash/Nagad within 24-72 hours."}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span>{isBn ? "ENMAR Organic Food - ট্রেড লাইসেন্স ও বিএসটিআই মানসম্পন্ন" : "ENMAR Organic Food - Trade Licensed & BSTI Certified"}</span>
            <Link href="/shipping" className="text-forest font-bold hover:underline">
              {isBn ? "শিপিং পলিসি দেখুন →" : "View Shipping Policy →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
