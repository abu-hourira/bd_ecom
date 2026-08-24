"use client";
// app/admin/banners/page.tsx - Promotional Banner & Ads Slider Management

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
  Link as LinkIcon,
  Eye,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import AlertModal from "@/components/admin/AlertModal";
import { getSafeImageUrl } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

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
    targetLink: "/products",
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (e) {
      console.error("Failed to load banners", e);
    } finally {
      setLoading(false);
    }
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
        body: JSON.stringify(formData),
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
          targetLink: "/products",
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-forest" />
            <span>Homepage Promo Ads & Banners</span>
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Upload multiple promotional ad images to run automatically in the homepage top slider.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Ad Banner</span>
        </button>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-ink-soft">
            Loading active promotional banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-paper rounded-3xl border border-line p-8 space-y-3">
            <Sparkles className="w-12 h-12 text-forest/40 mx-auto" />
            <h3 className="font-bold text-base text-ink">No custom ad banners yet</h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              Click &quot;Upload New Ad Banner&quot; to upload promotional offer graphics and banners from your phone or PC.
            </p>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className={`bg-paper rounded-3xl border border-line overflow-hidden shadow-card flex flex-col justify-between transition-all ${
                !b.isActive ? "opacity-60" : ""
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
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px]">
                    {b.headline}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-5 space-y-3 flex-1">
                <h3 className="font-bold text-ink text-base line-clamp-1">{b.title}</h3>
                {b.subtitle && (
                  <p className="text-xs text-ink-soft line-clamp-2">{b.subtitle}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-forest font-mono">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span className="truncate">{b.targetLink || "/products"}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-line bg-bg/50 flex items-center justify-between">
                <button
                  onClick={() => handleToggle(b)}
                  disabled={togglingId === b.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    b.isActive
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {b.isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>{b.isActive ? "Running" : "Paused"}</span>
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

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl border border-line shadow-floating max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-xl font-bold font-display text-ink">Upload Ad Banner</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Image Uploader */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  Banner Image (Upload from phone / PC) *
                </label>
                <ImageUploader
                  images={formData.imageUrl ? [formData.imageUrl] : []}
                  onChange={(imgs) => setFormData({ ...formData, imageUrl: imgs[0] || "" })}
                  
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. সুন্দরবনের খাঁটি কাঁচা মধু অফার"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Badge / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. স্পেশাল অফার / ৫০% ছাড়"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Target Link URL</label>
                  <input
                    type="text"
                    placeholder="/products or link"
                    value={formData.targetLink}
                    onChange={(e) => setFormData({ ...formData, targetLink: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Short Subtitle / Description</label>
                <textarea
                  rows={2}
                  placeholder="সংক্ষিপ্ত অফার বিবরণী..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-line text-ink text-sm hover:bg-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save & Publish Ad</span>
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
