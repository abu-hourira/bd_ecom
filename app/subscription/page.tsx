"use client";
// app/subscription/page.tsx - Monthly & Weekly Organic Grocery Subscriptions
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Truck,
  RotateCcw,
  Plus,
  Loader2,
  ArrowRight,
  Package,
  X,
  CreditCard,
  Banknote,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AlertModal from "@/components/ui/AlertModal";

export default function SubscriptionPage() {
  const { lang } = useLanguage();
  const language = lang;
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [subscribeModal, setSubscribeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    shippingAddress: "",
    frequency: "MONTHLY",
    paymentMethod: "COD",
  });

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/storefront/subscriptions");
        const data = await res.json();
        if (data.success) {
          setPlans(data.plans || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleOpenSubscribe = (plan: any) => {
    setSelectedPlan(plan);
    setForm((prev) => ({
      ...prev,
      frequency: plan.frequency || "MONTHLY",
    }));
    setSubscribeModal(true);
  };

  const handleConfirmSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/storefront/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          ...form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "সাবস্ক্রিপশন সফল হয়েছে!",
          message: data.message || "আমাদের টিম শীঘ্রই প্রথম ডেলিভারির সময় কনফার্ম করতে কল করবে।",
          type: "success",
        });
        setSubscribeModal(false);
      } else {
        setAlert({
          isOpen: true,
          title: "সাবস্ক্রিপশন ব্যর্থ",
          message: data.error || "অনুগ্রহ করে সকল তথ্য দিয়ে আবার চেষ্টা করুন।",
          type: "error",
        });
      }
    } catch (err: any) {
      setAlert({ isOpen: true, title: "Error", message: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Hero Banner */}
      <div className="bg-forest-deep text-white py-14 sm:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "অটো-গ্রোসারি সাবস্ক্রিপশন" : "Auto-Grocery Replenishment"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            {language === "bn"
              ? "মাসিক অর্গানিক গ্রোসারি বক্স — প্রতি মাসে খাঁটি খাবারের নিশ্চয়তা"
              : "Monthly Organic Pantry Boxes Delivered to Your Doorstep"}
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            {language === "bn"
              ? "প্রতি মাসে বাজারের ঝামেলা ভুলে যান! কাঠের ঘানির সরিষার তেল, সুন্দরবনের মধু ও গাওয়া ঘি নিয়মিত রুটিনে ঘরে পৌঁছাবে সর্বোচ্চ ১২% অতিরিক্ত ছাড়ে।"
              : "Never run out of pure pantry staples again. Automated doorstep delivery with subscriber discounts and easy 1-click pause/cancel."}
          </p>

          {/* Value Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-accent" />
              ১০০% খাঁটি ও ল্যাব পরীক্ষিত
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              <Truck className="w-4 h-4 text-accent" />
              ফ্রি হোম ডেলিভারি
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              <RotateCcw className="w-4 h-4 text-accent" />
              যেকোনো সময় বাতিল বা পজ করুন
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink">
            আমাদের জনপ্রিয় সাবস্ক্রিপশন প্যাকেজসমূহ
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
            আপনার পরিবারের প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন। প্রতিটি ডেলিভারিতে নিশ্চিত সেভিংস উপভোগ করুন।
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-forest" />
            <p className="text-xs">প্যাকেজ লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-48 bg-stone-100 relative overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {p.discountPercent}% ছাড়ে প্রতিবার
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {p.frequency === "WEEKLY"
                        ? "সাপ্তাহিক"
                        : p.frequency === "BI_WEEKLY"
                        ? "১৫ দিনে ১ বার"
                        : "মাসিক ডেলিভারি"}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-base font-bold font-display text-ink group-hover:text-forest transition-colors leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-display text-forest">
                          ৳{p.price}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">/ প্রতি ডেলিভারি</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        রেগুলার মূল্যের চেয়ে ৳{Math.round((Number(p.price) * Number(p.discountPercent)) / 100)} সেভ হবে
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleOpenSubscribe(p)}
                    className="w-full py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-forest/20 cursor-pointer"
                  >
                    <span>সাবস্ক্রাইব করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      {subscribeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-line shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-full uppercase">
                  অর্ডার সিডিউল
                </span>
                <h3 className="text-base font-bold font-display text-ink mt-1">
                  {selectedPlan.title}
                </h3>
              </div>
              <button
                onClick={() => setSubscribeModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubscribe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  আপনার নাম (Full Name)
                </label>
                <input
                  type="text"
                  placeholder="e.g. তানভীর হাসান"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  মোবাইল নম্বর (Phone Number)
                </label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ডেলিভারি ঠিকানা (Full Delivery Address)
                </label>
                <textarea
                  rows={2}
                  placeholder="বাসা/রোড নম্বর, এলাকা ও শহর..."
                  value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ডেলিভারি ফ্রিকোয়েন্সি
                  </label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  >
                    <option value="WEEKLY">Weekly (প্রতি সপ্তাহে)</option>
                    <option value="BI_WEEKLY">Bi-Weekly (১৫ দিনে ১ বার)</option>
                    <option value="MONTHLY">Monthly (প্রতি মাসে ১ বার)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    পেমেন্ট পদ্ধতি
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
                  >
                    <option value="COD">ক্যাশ অন ডেলিভারি</option>
                    <option value="BKASH">বিকাশ / অনলাইন পেমেন্ট</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest/5 border border-forest/20 text-xs space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>প্রতি ডেলিভারিতে প্রদেয় মূল্য:</span>
                  <span className="text-forest font-display text-sm">৳{selectedPlan.price}</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  কোনো অগ্রিম চার্জ নেই। প্রথম পার্সেল রিসিভ করার সময় পেমেন্ট করবেন।
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubscribeModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>সাবস্ক্রিপশন কনফার্ম করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
