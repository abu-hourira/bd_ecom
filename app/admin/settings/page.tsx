"use client";
// app/admin/settings/page.tsx - Complete Site Settings & Theme Management

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
  MapPin,
  MessageCircle,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import AlertModal from "@/components/admin/AlertModal";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [settings, setSettings] = useState<Record<string, string>>({
    brandName: "ENMAR",
    brandTagline: "100% Pure Organic Food & Pantry Essentials",
    contactPhone: "+880 1614 113082",
    contactEmail: "support@enmar.shop",
    contactAddress: "House 14, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh",
    whatsappNumber: "8801614113082",
    whatsappDefaultMessage: "Hello ENMAR, I would like to order organic food.",
    shippingFlat: "70",
    freeShippingThreshold: "1500",
    siteLogo: "",
    siteFavicon: "",
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
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
          if (data.theme) {
            setTheme(data.theme);
          }
        }
      })
      .catch((e) => console.error("Failed to fetch settings:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, theme }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save settings");
      }

      setAlertState({
        isOpen: true,
        title: "Settings Saved Successfully",
        message: "Your brand identity, contact information, and theme customizations are now live across the website!",
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "Save Failed",
        message: err.message || "An error occurred while saving.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-ink-soft space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-forest" />
        <span className="font-semibold text-sm">Loading store settings & theme...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header & Sticky Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink flex items-center gap-3">
            <Palette className="w-8 h-8 text-forest" />
            <span>Site Identity & Theme Settings</span>
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Database-driven branding, custom logo upload, shipping rates, and theme customization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-sm shadow-premium transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* 1. Site Identity & Logos */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h2 className="text-lg font-bold font-display text-ink border-b border-line pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-forest" />
            <span>Brand Identity & Assets</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Brand / Store Name
              </label>
              <input
                type="text"
                value={settings.brandName || ""}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                placeholder="e.g. ENMAR"
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Brand Tagline
              </label>
              <input
                type="text"
                value={settings.brandTagline || ""}
                onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                placeholder="e.g. 100% Pure Organic Food"
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
              />
            </div>

            {/* Direct Logo Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Site Logo (Botanical Monogram)
              </label>
              <ImageUploader
                images={settings.siteLogo ? [settings.siteLogo] : []}
                onChange={(imgs) => setSettings({ ...settings, siteLogo: imgs[0] || "" })}
              />
            </div>

            {/* Direct Favicon Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Browser Tab Favicon (.ico / .png)
              </label>
              <ImageUploader
                images={settings.siteFavicon ? [settings.siteFavicon] : []}
                onChange={(imgs) => setSettings({ ...settings, siteFavicon: imgs[0] || "" })}
              />
            </div>
          </div>
        </div>

        {/* 2. Theme Customizer with Live Preview Card */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h2 className="text-lg font-bold font-display text-ink border-b border-line pb-3 flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" />
            <span>Theme Colors & Typography</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Color Pickers */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Primary Color (Brand Green)
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
                      className="flex-1 px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
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
                      className="flex-1 px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Accent Highlight (Gold / Amber)
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
                      className="flex-1 px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">Background Color</label>
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
                      className="flex-1 px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
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

        {/* 3. Shipping Rates & Contact Details */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <h2 className="text-lg font-bold font-display text-ink border-b border-line pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-forest" />
            <span>Shipping Rates & Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Flat Delivery Fee (৳)
              </label>
              <input
                type="number"
                value={settings.shippingFlat || "70"}
                onChange={(e) => setSettings({ ...settings, shippingFlat: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Free Delivery Order Threshold (৳)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold || "1500"}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Support Phone
              </label>
              <input
                type="text"
                value={settings.contactPhone || ""}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Support Email
              </label>
              <input
                type="email"
                value={settings.contactEmail || ""}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Physical Store Address
              </label>
              <input
                type="text"
                value={settings.contactAddress || ""}
                onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* WhatsApp Support Configuration */}
          <div className="pt-6 border-t border-line space-y-4">
            <h3 className="text-sm font-bold font-display text-ink flex items-center gap-2 text-emerald-700">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Floating Button & Customer Support</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                  WhatsApp Number (With Country Code)
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber || ""}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="e.g. 8801614113082"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono focus:outline-none focus:border-forest"
                />
                <span className="text-[11px] text-ink-soft mt-1 block">Example: 8801614113082 (no spaces or dashes)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                  WhatsApp Default Pre-filled Message
                </label>
                <input
                  type="text"
                  value={settings.whatsappDefaultMessage || ""}
                  onChange={(e) => setSettings({ ...settings, whatsappDefaultMessage: e.target.value })}
                  placeholder="Hello ENMAR, I want to order..."
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            {/* Direct Section Save Button */}
            <div className="flex items-center justify-end pt-3">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-premium transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saving ? "Saving..." : "Save Shipping & Contact Details"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-line">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-sm shadow-premium transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
          </button>
        </div>
      </div>

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
