"use client";
// app/admin/banners/page.tsx - Promotional Banner & Ads Slider Management with Master Showcase Toggle

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Loader2,
  Power,
  Upload,
  Layers,
  Eye,
  Tag,
  ToggleLeft,
  ToggleRight,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Megaphone,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import AlertModal from "@/components/admin/AlertModal";
import { getSafeImageUrl } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Banner {
  id: number;
  title: string;
  headline?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  targetLink?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSectionEnabled, setIsSectionEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [togglingMaster, setTogglingMaster] = useState(false);

  const [alertState, setAlertState] = useState<{
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

  const [formData, setFormData] = useState({
    title: "",
    headline: "স্পেশাল অফার",
    subtitle: "",
    imageUrl: "",
    targetCategory: "/products",
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBannersAndCategories();
  }, []);

  const fetchBannersAndCategories = async () => {
    try {
      setLoading(true);
      const [resBanners, resCats] = await Promise.all([
        fetch("/api/admin/banners"),
        fetch("/api/storefront/categories"),
      ]);

      const dataBanners = await resBanners.json();
      const dataCats = await resCats.json();

      if (dataBanners.success) {
        setBanners(dataBanners.banners || []);
        if (dataBanners.isSectionEnabled !== undefined) {
          setIsSectionEnabled(Boolean(dataBanners.isSectionEnabled));
        }
      }
      if (dataCats.success && dataCats.categories) {
        setCategories(dataCats.categories);
      }
    } catch (e) {
      console.error("Failed to load banners and categories", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterToggle = async () => {
    const nextState = !isSectionEnabled;
    setIsSectionEnabled(nextState);
    setTogglingMaster(true);

    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSectionEnabled: nextState }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Revert on error
        setIsSectionEnabled(!nextState);
        setAlertState({
          isOpen: true,
          title: "ত্রুটি",
          message: data.error || "ব্যানার মোড পরিবর্তন করা যায়নি।",
          type: "error",
        });
      } else {
        setAlertState({
          isOpen: true,
          title: nextState ? "ব্যানার প্রদর্শন চালু" : "ব্যানার প্রদর্শন বন্ধ",
          message: nextState
            ? "হোমপেজে ব্যানার স্লাইডার এখন সফলভাবে লাইভ দেখানো হচ্ছে।"
            : "হোমপেজ থেকে ব্যানার স্লাইডার সাময়িকভাবে বন্ধ/লুকিয়ে রাখা হয়েছে।",
          type: "success",
        });
      }
    } catch (e: any) {
      setIsSectionEnabled(!nextState);
      setAlertState({
        isOpen: true,
        title: "নেটওয়ার্ক ত্রুটি",
        message: e.message || "সার্ভারে সংযোগ করা যায়নি।",
        type: "error",
      });
    } finally {
      setTogglingMaster(false);
    }
  };

  const getCategoryNameFromLink = (link?: string | null) => {
    if (!link || link === "/products") return "সব পণ্য (All Products)";
    if (link.includes("combo-bundle-deals")) return "ফ্যামিলি কম্বো ও ডিলস";

    if (link.includes("category=")) {
      const slug = link.split("category=")[1];
      const match = categories.find((c) => c.slug === slug);
      if (match) return match.name;
      return slug;
    }
    return link;
  };

  const handleToggle = async (banner: Banner) => {
    try {
      setTogglingId(banner.id);
      const newStatus = !banner.isActive;

      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: newStatus } : b))
      );

      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ad banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        setAlertState({
          isOpen: true,
          title: "Banner Deleted",
          message: "The promotional banner has been removed.",
          type: "success",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Error",
        message: e.message || "Failed to delete.",
        type: "error",
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setAlertState({
        isOpen: true,
        title: "Image Required",
        message: "Please upload an ad banner image from your device.",
        type: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          headline: formData.headline,
          subtitle: formData.subtitle,
          imageUrl: formData.imageUrl,
          targetLink: formData.targetCategory,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners([...banners, data.banner]);
        setModalOpen(false);
        setFormData({
          title: "",
          headline: "স্পেশাল অফার",
          subtitle: "",
          imageUrl: "",
          targetCategory: "/products",
          displayOrder: 0,
          isActive: true,
        });
        setAlertState({
          isOpen: true,
          title: "Banner Published",
          message: "New promotional ad banner is now live on the homepage slider!",
          type: "success",
        });
      } else {
        setAlertState({
          isOpen: true,
          title: "Failed",
          message: data.error || "Failed to create banner.",
          type: "error",
        });
      }
    } catch (e: any) {
      setAlertState({
        isOpen: true,
        title: "Error",
        message: e.message || "Network error.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-forest" />
            <span>Ads & Promo Banners (বিজ্ঞাপন ও ব্যানার)</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            হোমপেজের ব্যানার স্লাইডার চালু/বন্ধ রাখুন এবং স্পেশাল অফার ব্যানারসমূহ ম্যানেজ করুন।
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-semibold text-xs sm:text-sm shadow-premium transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ব্যানার আপলোড করুন</span>
        </button>
      </div>

      {/* 🌟 Master Toggle Mode Control Card */}
      <div className={`rounded-3xl border transition-all duration-300 p-5 sm:p-6 shadow-sm ${
        isSectionEnabled
          ? "bg-gradient-to-r from-emerald-500/10 via-emerald-50/60 to-paper border-emerald-300/70"
          : "bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-paper border-amber-300/70"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`p-3.5 rounded-2xl shrink-0 transition-colors ${
              isSectionEnabled
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-amber-600 text-white shadow-md shadow-amber-600/20"
            }`}>
              <Sliders className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-ink">
                  হোমপেজ ব্যানার প্রদর্শন মোড (Banner Showcase Toggle)
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isSectionEnabled
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isSectionEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`} />
                  {isSectionEnabled ? "ব্যানার মোড চালু (ACTIVE)" : "ব্যানার মোড বন্ধ (HIDDEN)"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-soft">
                {isSectionEnabled
                  ? "হোমপেজের শীর্ষে ব্যানার স্লাইডার সক্রিয় রয়েছে (ওয়েবসাইটে প্রদর্শন হচ্ছে)।"
                  : "ব্যানার স্লাইডার বন্ধ রয়েছে (ওয়েবসাইট থেকে সাময়িকভাবে লুকানো রয়েছে)।"}
              </p>
            </div>
          </div>

          {/* Action Switch Button */}
          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <button
              onClick={handleMasterToggle}
              disabled={togglingMaster || loading}
              className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60 ${
                isSectionEnabled
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-stone-800 hover:bg-stone-900 text-white"
              }`}
            >
              {togglingMaster ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSectionEnabled ? (
                <ToggleRight className="w-5 h-5 text-emerald-200" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-stone-400" />
              )}
              <span>{isSectionEnabled ? "ব্যানার বন্ধ করুন" : "ব্যানার চালু করুন"}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats strip */}
        <div className="mt-4 pt-4 border-t border-line/60 flex flex-wrap items-center gap-4 sm:gap-8 text-xs text-ink-soft">
          <div>
            মোট ব্যানার: <strong className="text-ink font-bold">{banners.length} টি</strong>
          </div>
          <div>
            রানিং স্লাইড: <strong className="text-emerald-700 font-bold">{activeCount} টি</strong>
          </div>
          <div>
            স্টোরফ্রন্ট স্ট্যাটাস:{" "}
            <strong className={isSectionEnabled && activeCount > 0 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
              {isSectionEnabled && activeCount > 0 ? "লাইভ দেখা যাচ্ছে" : "লুকানো রয়েছে"}
            </strong>
          </div>
        </div>
      </div>

      {/* Grid of Banners */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest" />
            <span>আপলোডকৃত ব্যানার তালিকা ({banners.length})</span>
          </h2>
          <span className="text-xs text-ink-soft">
            প্রতিটি ব্যানারের পাওয়ার বাটন দিয়ে আলাদাভাবেও চালু/বন্ধ করতে পারবেন
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-16 text-center text-ink-soft">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-forest" />
              লোড হচ্ছে...
            </div>
          ) : banners.length === 0 ? (
            <div className="col-span-full py-14 text-center bg-paper rounded-3xl border border-line p-8 space-y-3">
              <Sparkles className="w-12 h-12 text-forest/40 mx-auto" />
              <h3 className="font-bold text-base text-ink">কোনো ব্যানার আপলোড করা নেই</h3>
              <p className="text-xs text-ink-soft max-w-md mx-auto">
                &quot;নতুন ব্যানার আপলোড করুন&quot; বাটনে ক্লিক করে ফোন বা কম্পিউটার থেকে অফার ব্যানার যোগ করতে পারেন।
              </p>
            </div>
          ) : (
            banners.map((b) => (
              <div
                key={b.id}
                className={`bg-paper rounded-3xl border border-line overflow-hidden shadow-card flex flex-col justify-between transition-all ${
                  !b.isActive || !isSectionEnabled ? "opacity-75" : ""
                }`}
              >
                {/* Image Preview */}
                <div className="relative w-full aspect-[16/9] bg-stone-900">
                  <Image
                    src={getSafeImageUrl(b.imageUrl)}
                    alt={b.title}
                    fill
                    className="object-cover"
                  />
                  {b.headline && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] shadow-sm">
                      {b.headline}
                    </span>
                  )}
                  {!isSectionEnabled && (
                    <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-amber-500/90 text-stone-950 font-bold text-xs shadow-md">
                        মাস্টার মোড বন্ধ
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 space-y-2.5 flex-1">
                  <h3 className="font-bold text-ink text-sm sm:text-base line-clamp-1">{b.title}</h3>
                  {b.subtitle && (
                    <p className="text-xs text-ink-soft line-clamp-2">{b.subtitle}</p>
                  )}

                  {/* Target Category Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-forest-soft text-forest text-[11px] font-bold border border-forest/20">
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">লিংক: {getCategoryNameFromLink(b.targetLink)}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-3.5 border-t border-line bg-bg/50 flex items-center justify-between">
                  <button
                    onClick={() => handleToggle(b)}
                    disabled={togglingId === b.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      b.isActive
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    {b.isActive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>{b.isActive ? "সক্রিয় (Running)" : "বন্ধ (Paused)"}</span>
                    <Power className="w-3 h-3 ml-0.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 text-ink-soft hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl border border-line shadow-floating max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-lg sm:text-xl font-bold font-display text-ink flex items-center gap-2">
                <Upload className="w-5 h-5 text-forest" />
                <span>নতুন অ্যাড ব্যানার আপলোড</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-bg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Image Uploader */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  ব্যানার ছবি (ফোন / পিসি থেকে আপলোড করুন) *
                </label>
                <ImageUploader
                  images={formData.imageUrl ? [formData.imageUrl] : []}
                  onChange={(imgs) => setFormData({ ...formData, imageUrl: imgs[0] || "" })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">ব্যানার টাইটেল / নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. স্পেশাল ফ্রোজেন ফুড অফার"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">ব্যাজ / ট্যাগ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="e.g. স্পেশাল অফার / ৫০% ছাড়"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                  />
                </div>

                {/* Target Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    টার্গেট ক্যাটাগরি (ক্লিকে কোন পেজে যাবে) *
                  </label>
                  <select
                    value={formData.targetCategory}
                    onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-medium focus:outline-none focus:border-forest cursor-pointer"
                  >
                    <option value="/products">সব পণ্য (All Products)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={`/products?category=${cat.slug}`}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="/products?category=combo-bundle-deals">
                      ফ্যামিলি কম্বো ও ডিলস (Combos)
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">সংক্ষিপ্ত সাবটাইটেল / বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="সংক্ষিপ্ত অফার বিবরণী..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-line text-ink text-sm hover:bg-bg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>সংরক্ষণ ও প্রকাশ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  );
}
