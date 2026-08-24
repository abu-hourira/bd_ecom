"use client";
// app/account/profile/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import AccountNav from "@/components/account/AccountNav";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("enmar_customer");
      if (!stored) {
        router.push("/auth/login");
        return;
      }
      const parsed = JSON.parse(stored);
      fetch(`/api/account/profile?email=${encodeURIComponent(parsed.email || "")}&phone=${encodeURIComponent(parsed.phone || "")}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCustomer(data.user);
            setName(data.user.name || "");
            setCity(data.user.city || "Dhaka");
            setAddress(data.user.address || "");
            setPostalCode(data.user.postalCode || "");
          } else {
            router.push("/auth/login");
          }
        })
        .finally(() => setLoading(false));
    } catch (e) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) return;

    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: customer.id,
          name,
          city,
          address,
          postalCode,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <AccountNav />

          <div className="flex-1 w-full space-y-6">
            <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
              <div className="border-b border-line pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-ink">
                    {lang === "bn" ? "প্রোফাইল তথ্য ও সেটিংস" : "Personal Information"}
                  </h1>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {lang === "bn"
                      ? "আপনার নাম, ঠিকানা ও পাসওয়ার্ড পরিবর্তন করুন"
                      : "Manage your contact credentials and password"}
                  </p>
                </div>
                {customer && (
                  <span className="text-[11px] font-mono text-forest bg-forest-soft px-3 py-1 rounded-full font-bold">
                    ID #{customer.id}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="p-12 text-center text-ink-soft">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
                  <span>Loading profile...</span>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {savedSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{lang === "bn" ? "প্রোফাইল সফলভাবে আপডেট হয়েছে!" : "Profile updated successfully!"}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        {lang === "bn" ? "পুরো নাম" : "Full Name"}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        {lang === "bn" ? "মোবাইল নম্বর" : "Phone Number"}
                      </label>
                      <input
                        type="text"
                        disabled
                        value={customer?.phone || "—"}
                        className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono text-ink-soft cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        {lang === "bn" ? "ইমেইল এড্রেস" : "Email Address"}
                      </label>
                      <input
                        type="email"
                        disabled
                        value={customer?.email || "—"}
                        className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs text-ink-soft cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        {lang === "bn" ? "শহর" : "City / Division"}
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      {lang === "bn" ? "স্থায়ী ডেলিভারি ঠিকানা" : "Street Address"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. House 14, Road 5, Block B, Dhanmondi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs"
                    />
                  </div>

                  {/* Password Change Box */}
                  <div className="p-5 rounded-2xl bg-bg border border-line space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-ink">
                      <Lock className="w-4 h-4 text-forest" />
                      <span>{lang === "bn" ? "পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)" : "Change Password (Optional)"}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-paper border border-line text-xs font-mono"
                      />
                      <input
                        type="password"
                        placeholder="New password (min 6 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-paper border border-line text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-premium disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{lang === "bn" ? "পরিবর্তন সংরক্ষণ করুন" : "Save Profile Changes"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
