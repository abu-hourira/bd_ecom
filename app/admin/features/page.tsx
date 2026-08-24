"use client";
import AlertModal from "@/components/ui/AlertModal";
// app/admin/features/page.tsx

import { useEffect, useState, useMemo } from "react";
import {
  Sliders,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Filter,
  Info,
} from "lucide-react";

interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string | null;
  category: string;
  isEnabled: boolean;
  updatedAt: string;
}

export default function AdminFeaturesPage() {
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/features");
      const data = await res.json();
      if (data.success && data.flags) {
        setFlags(data.flags);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (flag: FeatureFlag) => {
    const nextState = !flag.isEnabled;
    setUpdatingKey(flag.key);

    // Optimistic UI update
    setFlags((prev) =>
      prev.map((f) => (f.key === flag.key ? { ...f, isEnabled: nextState } : f))
    );

    try {
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: flag.key, isEnabled: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.message);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        // Rollback
        setFlags((prev) =>
          prev.map((f) => (f.key === flag.key ? { ...f, isEnabled: !nextState } : f))
        );
        setAlertState({
          isOpen: true,
          title: "Feature Toggle Error",
          message: data.error || "Failed to update feature toggle.",
          type: "error",
        });
      }
    } catch (err: any) {
      setFlags((prev) =>
        prev.map((f) => (f.key === flag.key ? { ...f, isEnabled: !nextState } : f))
      );
      setAlertState({
        isOpen: true,
        title: "Toggle Error",
        message: err.message || "Failed to update toggle.",
        type: "error",
      });
    } finally {
      setUpdatingKey(null);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    flags.forEach((f) => cats.add(f.category));
    return ["all", ...Array.from(cats).sort()];
  }, [flags]);

  const filteredFlags = useMemo(() => {
    return flags.filter((f) => {
      const matchCat = selectedCategory === "all" || f.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [flags, selectedCategory, searchQuery]);

  const enabledCount = flags.filter((f) => f.isEnabled).length;
  const disabledCount = flags.filter((f) => !f.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-6 rounded-3xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Storefront Visibility Control</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Feature Toggles
          </h2>
          <p className="text-xs text-ink-soft mt-0.5 max-w-2xl leading-relaxed">
            Enable or disable major customer-facing features, widgets, and payment options instantly without deploying code. Disabled features disappear cleanly from both UI and backend APIs.
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{enabledCount} Active</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-bold">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{disabledCount} Disabled</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-forest text-white text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-paper p-4 rounded-2xl border border-line shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Search feature toggle by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
            />
          </div>

          <div className="text-xs text-ink-soft font-mono">
            Showing <strong className="text-ink">{filteredFlags.length}</strong> of {flags.length} toggles
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? "bg-forest text-white shadow-xs"
                  : "bg-bg text-ink-soft hover:text-ink hover:bg-stone-200/60"
              }`}
            >
              {cat === "all" ? "All Features" : `${cat} toggles`}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-ink-soft flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-forest" />
            <span className="text-xs">Loading feature toggles...</span>
          </div>
        ) : filteredFlags.length === 0 ? (
          <div className="col-span-full py-16 text-center text-ink-soft text-xs bg-paper rounded-3xl border border-line">
            No matching feature flags found for "{searchQuery}".
          </div>
        ) : (
          filteredFlags.map((flag) => (
            <div
              key={flag.key}
              className={`p-5 rounded-3xl border transition-all space-y-4 ${
                flag.isEnabled
                  ? "bg-paper border-line shadow-xs hover:border-forest/40"
                  : "bg-stone-100/70 border-stone-200 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-mono text-[10px] font-bold uppercase">
                      {flag.category}
                    </span>
                    <span className="font-mono text-[11px] text-ink-soft">
                      {flag.key}
                    </span>
                  </div>
                  <h3 className="font-bold text-base font-display text-ink">
                    {flag.name}
                  </h3>
                </div>

                {/* Switch Button */}
                <button
                  type="button"
                  onClick={() => handleToggle(flag)}
                  disabled={updatingKey === flag.key}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    flag.isEnabled ? "bg-forest" : "bg-stone-300"
                  }`}
                  aria-label={`Toggle ${flag.name}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                      flag.isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {updatingKey === flag.key ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-forest" />
                    ) : flag.isEnabled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </span>
                </button>
              </div>

              <p className="text-xs text-ink-soft leading-relaxed">
                {flag.description || "No description provided."}
              </p>

              <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px]">
                <span
                  className={`font-semibold flex items-center gap-1.5 ${
                    flag.isEnabled ? "text-emerald-700" : "text-stone-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      flag.isEnabled ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
                    }`}
                  />
                  {flag.isEnabled ? "Visible on Storefront" : "Hidden from Customers"}
                </span>

                <span className="text-ink-soft font-mono text-[10px]">
                  Updated: {new Date(flag.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
