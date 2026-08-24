"use client";
// app/shipping/page.tsx

import Link from "next/link";
import { Truck, Clock, ShieldCheck, MapPin, CheckCircle2, Phone, ArrowLeft, PackageCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ShippingPolicyPage() {
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  return (
    <div className="min-h-screen bg-bg text-ink py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Breadcrumb / Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? "হোমপেজে ফিরে যান" : "Back to Home"}</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>{isBn ? "ডেলিভারি নির্দেশিকা" : "Delivery Guidelines"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {isBn ? "শিপিং ও ডেলিভারি পলিসি" : "Shipping & Delivery Policy"}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            {isBn
              ? "ENMAR-এর ১০০% বিশুদ্ধ ও অর্গানিক পণ্য সর্বোচ্চ সতেজতা নিশ্চিত করে দ্রুততম সময়ে আপনার ঘরে পৌঁছে দেওয়ার জন্য আমাদের বিশেষ ডেলিভারি ব্যবস্থা।"
              : "ENMAR's specialized delivery network ensures 100% pure, farm-fresh organic food reaches your doorstep quickly and securely."}
          </p>
        </div>

        {/* Delivery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-ink">
              {isBn ? "ঢাকা শহরের ভেতরে ডেলিভারি" : "Inside Dhaka Delivery"}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest shrink-0" />
                <span>{isBn ? "ডেলিভারি সময়: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে" : "Delivery Time: 24 to 48 Hours"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest shrink-0" />
                <span>{isBn ? "ডেলিভারি চার্জ: মাত্র ৳৭০" : "Delivery Charge: ৳70"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span className="font-bold text-forest">{isBn ? "৳১,৫০০ বা ততোধিক অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি!" : "Free Delivery on orders ৳1,500+"}</span>
              </li>
            </ul>
          </div>

          <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/30 text-forest flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-ink">
              {isBn ? "ঢাকা শহরের বাইরে (সারা বাংলাদেশ)" : "Outside Dhaka (Nationwide)"}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest shrink-0" />
                <span>{isBn ? "ডেলিভারি সময়: ২ থেকে ৪ কার্যদিবস" : "Delivery Time: 2 to 4 Business Days"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest shrink-0" />
                <span>{isBn ? "ডেলিভারি চার্জ: ৳১৩০ (কুরিয়ার পার্টনার: পাঠাও / স্টেডফাস্ট)" : "Delivery Charge: ৳130 (via Pathao / Steadfast)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span className="font-bold text-forest">{isBn ? "ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ" : "Cash on Delivery (COD) Available"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Detailed Points */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6 text-xs sm:text-sm text-ink-soft leading-relaxed">
          <h3 className="text-lg font-bold font-display text-ink">
            {isBn ? "ডেলিভারি সংক্রান্ত গুরুত্বপূর্ণ তথ্যাবলি" : "Important Delivery Terms"}
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-ink mb-1">
                {isBn ? "১. প্যাকেজিং ও কোয়ালিটি নিশ্চয়তা" : "1. Food Grade Eco Packaging"}
              </h4>
              <p>
                {isBn
                  ? "আমাদের মধু, ঘি, তেল ও মসলা ফুড-গ্রেড ও লিক-প্রুফ কাঁচ বা বিশেষ জারে সিল করে প্যাকেজিং করা হয়, যাতে ট্রানজিটে কোনো অপচয় বা ক্ষতি না ঘটে।"
                  : "All honey, ghee, oils, and spices are sealed in food-grade, leak-proof airtight jars ensuring pristine quality during transit."}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">
                {isBn ? "২. রিয়েল-টাইম অর্ডার ট্র্যাকিং ও লাইভ জিপিএস" : "2. Live GPS Order Tracking"}
              </h4>
              <p>
                {isBn
                  ? "অর্ডার প্লেস করার পর প্রতিটি গ্রাহককে একটি ট্র্যাকিং আইডি দেওয়া হয়। আমাদের ট্র্যাক পেজে গিয়ে যেকোনো সময় পার্সেলের বর্তমান স্ট্যাটাস ও রাইডারের লাইভ লোকেশন ম্যাপে দেখা যায়।"
                  : "Every order receives a unique Tracking ID. Visit our tracking page anytime to monitor live stage progression and GPS rider locations."}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">
                {isBn ? "৩. ডেলিভারি গ্রহণের সময় পণ্য যাচাই" : "3. Inspection at Delivery"}
              </h4>
              <p>
                {isBn
                  ? "ডেলিভারি ম্যানের উপস্থিতিতে পার্সেল চেক করে গ্রহণ করুন। কোনো পণ্য ক্ষতিগ্রস্ত বা অমিল থাকলে তাৎক্ষণিকভাবে ডেলিভারি ম্যানকে জানান অথবা আমাদের হেল্পলাইনে যোগাযোগ করুন।"
                  : "Please inspect items upon arrival. If any breakage or mismatch is found, notify the rider immediately or contact our support team."}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-forest" />
              <span className="font-bold text-ink">{isBn ? "সহায়তা হেল্পলাইন: +880 1614 113082" : "Support: +880 1614 113082"}</span>
            </div>
            <Link
              href="/track"
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-premium transition-all"
            >
              {isBn ? "অর্ডার ট্র্যাক করুন →" : "Track Your Order →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
