"use client";
import AlertModal from "@/components/ui/AlertModal";
// app/admin/content/page.tsx

import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Search,
  Save,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  Globe,
  Filter,
  Plus,
  X,
} from "lucide-react";

interface ContentItem {
  key: string;
  section: string;
  bnValue: string;
  enValue: string;
  isCustomized: boolean;
}

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");

  // New Custom String Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newBn, setNewBn] = useState("");
  const [newEn, setNewEn] = useState("");

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const sections = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => s.add(it.section));
    return ["all", ...Array.from(s).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchSection = selectedSection === "all" || it.section === selectedSection;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        it.key.toLowerCase().includes(q) ||
        it.bnValue.toLowerCase().includes(q) ||
        it.enValue.toLowerCase().includes(q);
      return matchSection && matchSearch;
    });
  }, [items, selectedSection, searchQuery]);

  const handleValueChange = (key: string, lang: "bn" | "en", value: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.key === key) {
          return {
            ...it,
            [lang === "bn" ? "bnValue" : "enValue"]: value,
            isCustomized: true,
          };
        }
        return it;
      })
    );
    setSavedSuccess(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setAlertState({
          isOpen: true,
          title: "Content Save Error",
          message: data.error || "Failed to save content.",
          type: "error",
        });
      }
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "Save Error",
        message: err.message || "Failed to save content.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewString = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const formattedKey = newKey.trim().toLowerCase().replace(/\s+/g, ".");
    const section = formattedKey.split(".")[0] || "custom";

    setItems((prev) => [
      {
        key: formattedKey,
        section,
        bnValue: newBn.trim(),
        enValue: newEn.trim(),
        isCustomized: true,
      },
      ...prev,
    ]);

    setNewKey("");
    setNewBn("");
    setNewEn("");
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-6 rounded-3xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Zero-Hardcoding Content Engine</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Site Content & Dynamic Text
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Every customer-facing button, heading, error message, and label is 100% database-driven and editable without code deploys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-line bg-white hover:bg-bg text-ink text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-forest" />
            <span>Add Text Key</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-premium disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedSuccess ? "Saved to Live Database!" : "Publish Live Changes"}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-paper p-4 rounded-2xl border border-line shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Search translation by key, Bengali, or English word..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
            />
          </div>

          <div className="text-xs text-ink-soft font-mono">
            Showing <strong className="text-ink">{filteredItems.length}</strong> of {items.length} text blocks
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-all ${
                selectedSection === sec
                  ? "bg-forest text-white shadow-xs"
                  : "bg-bg text-ink-soft hover:text-ink hover:bg-stone-200/60"
              }`}
            >
              {sec === "all" ? "All Sections" : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Content Editor Table */}
      <div className="bg-paper rounded-3xl border border-line shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-ink-soft flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-forest" />
            <span className="text-xs">Loading database content blocks...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-ink-soft text-xs">
            No matching content blocks found for "{searchQuery}".
          </div>
        ) : (
          <div className="divide-y divide-line">
            {filteredItems.map((item) => (
              <div key={item.key} className="p-4 sm:p-5 hover:bg-bg/40 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-mono text-[10px] font-bold">
                      {item.section}
                    </span>
                    <span className="font-mono text-xs font-bold text-ink">{item.key}</span>
                  </div>

                  {item.isCustomized && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200 w-fit">
                      <Sparkles className="w-3 h-3" />
                      <span>Customized in DB</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Bengali Field */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-forest flex items-center justify-between">
                      <span>বাংলা টেক্সট (Bengali)</span>
                      <span className="font-mono font-normal text-ink-soft text-[10px]">locale: bn</span>
                    </label>
                    <textarea
                      rows={item.bnValue.length > 80 ? 3 : 2}
                      value={item.bnValue}
                      onChange={(e) => handleValueChange(item.key, "bn", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-sans focus:outline-none focus:border-forest"
                    />
                  </div>

                  {/* English Field */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-earth flex items-center justify-between">
                      <span>English Text</span>
                      <span className="font-mono font-normal text-ink-soft text-[10px]">locale: en</span>
                    </label>
                    <textarea
                      rows={item.enValue.length > 80 ? 3 : 2}
                      value={item.enValue}
                      onChange={(e) => handleValueChange(item.key, "en", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-sans focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Save Footer Bar */}
      <div className="sticky bottom-6 bg-forest-deep text-white p-4 rounded-2xl shadow-floating flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3 text-xs">
          <Globe className="w-5 h-5 text-accent" />
          <span>
            Changes are saved directly to database key-values and reflect immediately on the customer storefront.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-forest-deep font-extrabold text-xs shadow-xs hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? "Saved Successfully!" : "Save All to Database"}</span>
        </button>
      </div>

      {/* Add Custom String Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl border border-line shadow-floating max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-bold text-base font-display text-ink">Add Custom Text Key</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-ink-soft hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewString} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">Key Identifier (e.g. promo.eidNotice)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. checkout.vatNotice"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">Bengali Text (বাংলা)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="বাংলা অনুবাদ লিখুন..."
                  value={newBn}
                  onChange={(e) => setNewBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">English Text</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter English translation..."
                  value={newEn}
                  onChange={(e) => setNewEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-line text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold"
                >
                  Add Key
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
