"use client";
// app/privacy/page.tsx

import Link from "next/link";
import { ShieldCheck, Lock, Eye, ArrowLeft, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPolicyPage() {
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
            <Lock className="w-4 h-4" />
            <span>{isBn ? "গোপনীয়তা ও ডেটা সুরক্ষা" : "Privacy & Data Security"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {isBn ? "প্রাইভেসি পলিসি (Privacy Policy)" : "Privacy Policy"}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            {isBn
              ? "ENMAR আপনার তথ্যের সর্বোচ্চ গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। আমরা কীভাবে আপনার তথ্য সংগ্রহ, সংরক্ষণ ও নিরাপদ রাখি তা নিচে বর্ণনা করা হলো।"
              : "ENMAR is committed to protecting your personal information and privacy with bank-grade security standards."}
          </p>
        </div>

        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6 text-xs sm:text-sm text-ink-soft leading-relaxed">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">
                {isBn ? "১. সংগৃহীত তথ্যাবলি" : "1. Information We Collect"}
              </h3>
              <p>
                {isBn
                  ? "অর্ডার ডেলিভারি নিশ্চিত করতে আমরা আপনার নাম, মোবাইল নম্বর, ডেলিভারি ঠিকানা এবং ইমেইল সংগ্রহ করি। পেমেন্টের ক্ষেত্রে কার্ড বা মোবাইল ওয়ালেটের কোনো পিন নম্বর আমরা কখনোই সংরক্ষণ করি না।"
                  : "We collect customer names, phone numbers, delivery addresses, and emails solely for order fulfillment. Sensitive payment credentials (PIN/CVV) are handled directly by PCI-DSS compliant payment gateways."}
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-ink mb-1">
                {isBn ? "২. তথ্যের ব্যবহার" : "2. How We Use Information"}
              </h3>
              <p>
                {isBn
                  ? "আপনার তথ্য শুধুমাত্র পার্সেল ডেলিভারি, এসএমএস/ইমেইলে অর্ডার ট্র্যাকিং আপডেট পাঠানো এবং কাস্টমার সাপোর্টের প্রয়োজনে ব্যবহার করা হয়। আমরা কোনো তৃতীয় পক্ষের কাছে গ্রাহকের তথ্য বিক্রি বা হস্তান্তর করি না।"
                  : "Customer data is used strictly for parcel shipment, order tracking updates, and customer support. We never sell, rent, or trade your personal information to third parties."}
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-ink mb-1">
                {isBn ? "৩. ডেটা নিরাপত্তা ও এনক্রিপশন" : "3. Data Security & Encryption"}
              </h3>
              <p>
                {isBn
                  ? "আমাদের সার্ভারে সব পাসওয়ার্ড এবং সংবেদনশীল ক্রেডেনশিয়াল শক্তিশালী AES-256 এনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে। সম্পূর্ণ সাইট SSL (HTTPS) এর মাধ্যমে এনক্রিপ্টেড।"
                  : "All passwords and sensitive credentials are encrypted using industry-standard hashing and AES-256 encryption. The storefront is 100% protected with SSL encryption."}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span>{isBn ? "সর্বশেষ হালনাগাদ: আগস্ট ২০২৬" : "Last Updated: August 2026"}</span>
            <div className="flex items-center gap-4">
              <a href="mailto:privacy@enmar.bd" className="hover:text-forest font-semibold">privacy@enmar.bd</a>
              <span>•</span>
              <a href="tel:+8801614113082" className="hover:text-forest font-semibold">+880 1614 113082</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
