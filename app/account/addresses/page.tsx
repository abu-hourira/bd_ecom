// app/account/addresses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Home,
  Building,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import AccountNav from "@/components/account/AccountNav";
import { useLanguage } from "@/context/LanguageContext";

export default function CustomerAddressesPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [customer, setCustomer] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New address modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("Home");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = (userId: number) => {
    fetch(`/api/account/addresses?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAddresses(data.addresses || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("enmar_customer");
      if (!stored) {
        router.push("/auth/login");
        return;
      }
      const parsed = JSON.parse(stored);
      setCustomer(parsed);
      setRecipientName(parsed.name || "");
      setPhone(parsed.phone || "");
      if (parsed.id) {
        fetchAddresses(parsed.id);
      }
    } catch (e) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) return;

    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customer.id,
          title,
          recipientName,
          phone,
          streetAddress,
          area,
          city,
          isDefault,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setStreetAddress("");
        setArea("");
        fetchAddresses(customer.id);
      } else {
        alert(data.error || "Failed to save address");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
      if (customer?.id) fetchAddresses(customer.id);
    } catch (e) {
      console.error(e);
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
                    {lang === "bn" ? "সংরক্ষিত ডেলিভারি ঠিকানা" : "Saved Delivery Addresses"}
                  </h1>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {lang === "bn"
                      ? "চেকআউটে দ্রুত ডেলিভারির জন্য ঠিকানা যোগ করুন"
                      : "Add addresses for one-click express checkout selection"}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === "bn" ? "নতুন ঠিকানা" : "Add Address"}</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-ink-soft">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
                  <span>Loading addresses...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-12 text-center text-ink-soft space-y-3">
                  <MapPin className="w-10 h-10 mx-auto text-forest/40" />
                  <p className="text-sm font-semibold text-ink">
                    {lang === "bn" ? "কোন সংরক্ষিত ঠিকানা নেই" : "No saved addresses yet"}
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex px-5 py-2 rounded-full bg-forest text-white text-xs font-semibold"
                  >
                    {lang === "bn" ? "প্রথম ঠিকানা যোগ করুন" : "Add Delivery Address"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="p-5 rounded-2xl bg-bg border border-line flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-ink flex items-center gap-1.5">
                            {a.title === "Home" ? <Home className="w-3.5 h-3.5 text-forest" /> : <Building className="w-3.5 h-3.5 text-forest" />}
                            {a.title}
                          </span>
                          {a.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-ink">{a.recipientName}</div>
                        <div className="text-xs text-ink-soft">{a.phone}</div>
                        <p className="text-xs text-ink leading-relaxed pt-1">
                          {a.streetAddress}, {a.area ? `${a.area}, ` : ""}{a.city}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-line/60 flex items-center justify-end">
                        <button
                          onClick={() => handleDeleteAddress(a.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Address Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 animate-in zoom-in-95">
              <h3 className="font-bold font-display text-lg text-ink">
                {lang === "bn" ? "নতুন ডেলিভারি ঠিকানা যোগ করুন" : "Add Delivery Address"}
              </h3>

              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink">Address Label</label>
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-semibold"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink">City / Zone</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-semibold"
                    >
                      <option value="Dhaka">Dhaka (৳70)</option>
                      <option value="Chittagong">Chittagong (৳130)</option>
                      <option value="Sylhet">Sylhet (৳130)</option>
                      <option value="Rajshahi">Rajshahi (৳130)</option>
                      <option value="Khulna">Khulna (৳130)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink">Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">Full Street Address</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House, Road, Block/Sector, Landmark..."
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-forest rounded"
                  />
                  <span>Set as default checkout address</span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-xs disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
