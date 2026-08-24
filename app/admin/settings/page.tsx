import AlertModal from "@/components/ui/AlertModal";
// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Palette,
  Globe,
  Truck,
  Phone,
  Mail,
  Save,
  Loader2,
  Sparkles,
  Eye,
  CheckCircle2,
  Upload,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [settings, setSettings] = useState<Record<string, string>>({
    brandName: "ENMAR",
    brandTagline: "100% Pure Organic Food & Pantry Essentials",
    contactPhone: "+880 1614 113082",
    contactEmail: "info@enmar.bd",
    contactAddress: "House 12, Road 4, Dhanmondi, Dhaka - 1205, Bangladesh",
    shippingFlat: "70",
    freeShippingThreshold: "1500",
    siteLogo: "/assets/logo/logo.png",
    siteFavicon: "/favicon.ico",
  });

  const [theme, setTheme] = useState({
    primaryColor: "#14421a",
    secondaryColor: "#5c3a21",
    accentColor: "#f5a623",
    backgroundColor: "#fdfbf7",
    textColor: "#1f2937",
    fontHeading: "Fraunces",
    fontBody: "Work Sans",
    buttonRadius: "rounded-xl",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
          if (data.theme) setTheme(data.theme);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, theme }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");

      setAlertState({
        isOpen: true,
        title: "Settings Saved",
        message: "Site settings and theme customizations have been published successfully.",
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "Save Error",
        message: err.message || "Failed to save settings.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
        <span className="ml-3 font-medium">Loading store settings & theme...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Site Identity & Theme Customization
          </h2>
          <p className="text-sm text-ink-soft">
            100% database-driven branding, logo uploads, and real-time color theme controls.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-sm shadow-premium transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Site Identity & Logos */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-forest" />
            <span>Site Identity & Brand Assets</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Brand / Store Name</label>
              <input
                type="text"
                value={settings.brandName || ""}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Brand Tagline</label>
              <input
                type="text"
                value={settings.brandTagline || ""}
                onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            {/* Direct Logo Upload */}
            <div className="space-y-2">
              <ImageUploader
                images={settings.siteLogo ? [settings.siteLogo] : []}
                onChange={(imgs) => setSettings({ ...settings, siteLogo: imgs[0] || "" })}
                multiple={false}
                label="Site Logo (Botanical Monogram)"
                helperText="Upload official ENMAR logo file. Direct device upload."
              />
            </div>

            {/* Direct Favicon Upload */}
            <div className="space-y-2">
              <ImageUploader
                images={settings.siteFavicon ? [settings.siteFavicon] : []}
                onChange={(imgs) => setSettings({ ...settings, siteFavicon: imgs[0] || "" })}
                multiple={false}
                label="Store Favicon (.ico / .png)"
                helperText="Browser tab icon. Direct device upload."
              />
            </div>
          </div>
        </div>

        {/* 2. Theme Customizer with Live Preview Card */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3 flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" />
            <span>Visual Theme Engine (Admin Controlled)</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Color Pickers */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Primary Brand Color (Forest Green)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-line cursor-pointer p-0.5 bg-bg"
                    />
                    <input
                      type="text"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Secondary Color (Earthy Brown)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-line cursor-pointer p-0.5 bg-bg"
                    />
                    <input
                      type="text"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Accent Color (Warm Amber)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-line cursor-pointer p-0.5 bg-bg"
                    />
                    <input
                      type="text"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.backgroundColor}
                      onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-line cursor-pointer p-0.5 bg-bg"
                    />
                    <input
                      type="text"
                      value={theme.backgroundColor}
                      onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Font Pairings */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Heading Font</label>
                  <select
                    value={theme.fontHeading}
                    onChange={(e) => setTheme({ ...theme, fontHeading: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-medium focus:outline-none"
                  >
                    <option value="Fraunces">Fraunces (Warm Botanical Serif)</option>
                    <option value="Playfair Display">Playfair Display (Classic Serif)</option>
                    <option value="Outfit">Outfit (Modern Clean Sans)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Body Font</label>
                  <select
                    value={theme.fontBody}
                    onChange={(e) => setTheme({ ...theme, fontBody: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-medium focus:outline-none"
                  >
                    <option value="Work Sans">Work Sans (Legible Organic)</option>
                    <option value="DM Sans">DM Sans (Minimalist)</option>
                    <option value="Inter">Inter (Tech Modern)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Real-time Theme Live Preview Box */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Interactive Storefront Preview:</span>
              </div>

              <div
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                }}
                className="p-6 rounded-3xl border border-line shadow-card space-y-4 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div
                    style={{ color: theme.primaryColor }}
                    className="font-bold text-lg font-display"
                  >
                    {settings.brandName || "ENMAR"}
                  </div>
                  <span
                    style={{ backgroundColor: theme.accentColor, color: "#1f2937" }}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  >
                    100% Organic
                  </span>
                </div>

                <div>
                  <h4 style={{ color: theme.textColor }} className="font-bold text-sm">
                    Sundarban Wild Raw Honey
                  </h4>
                  <p style={{ color: theme.textColor, opacity: 0.7 }} className="text-xs mt-0.5">
                    {settings.brandTagline || "Pure farm-to-table organic essentials."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span style={{ color: theme.secondaryColor }} className="font-bold font-mono">
                    ৳650
                  </span>
                  <button
                    type="button"
                    style={{ backgroundColor: theme.primaryColor, color: "#ffffff" }}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Delivery & Contact Details */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h3 className="text-lg font-bold font-display text-ink border-b border-line pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-forest" />
            <span>Shipping Rates & Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Flat Delivery Fee (৳)</label>
              <input
                type="number"
                value={settings.shippingFlat || "70"}
                onChange={(e) => setSettings({ ...settings, shippingFlat: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Free Delivery Order Threshold (৳)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold || "1500"}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Support Phone</label>
              <input
                type="text"
                value={settings.contactPhone || ""}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Support Email</label>
              <input
                type="email"
                value={settings.contactEmail || ""}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-ink">Physical Store Address</label>
              <input
                type="text"
                value={settings.contactAddress || ""}
                onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>

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
