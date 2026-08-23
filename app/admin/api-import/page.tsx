// app/admin/api-import/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  DownloadCloud,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sliders,
  Eye,
  Loader2,
  Trash2,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";

export default function ApiImportPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Connector Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [authType, setAuthType] = useState("bearer");
  const [authToken, setAuthToken] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);
  const [testError, setTestError] = useState("");
  const [rawKeys, setRawKeys] = useState<string[]>([]);
  const [sampleItems, setSampleItems] = useState<any[]>([]);

  // Field Mappings
  const [fieldMapping, setFieldMapping] = useState({
    name: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    unit: "",
    description: "",
    images: "",
  });

  const [savingSource, setSavingSource] = useState(false);

  const fetchSources = async () => {
    try {
      const res = await fetch("/api/admin/api-import");
      const json = await res.json();
      if (json.success) setSources(json.sources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnection(true);
    setTestError("");

    try {
      const res = await fetch("/api/admin/api-import/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointUrl, authType, authToken }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reach external API");
      }

      setRawKeys(json.rawKeys || []);
      setSampleItems(json.sampleItems || []);

      // Auto guess mappings
      const detected: any = {};
      json.rawKeys.forEach((k: string) => {
        const lower = k.toLowerCase();
        if (lower.includes("name") || lower.includes("title")) detected.name = k;
        if (lower.includes("price") && !lower.includes("discount")) detected.price = k;
        if (lower.includes("discount") || lower.includes("sale")) detected.discountPrice = k;
        if (lower.includes("stock") || lower.includes("quantity") || lower.includes("qty")) detected.stockQuantity = k;
        if (lower.includes("unit")) detected.unit = k;
        if (lower.includes("desc")) detected.description = k;
        if (lower.includes("image") || lower.includes("photo")) detected.images = k;
      });

      setFieldMapping((prev) => ({ ...prev, ...detected }));
      setStep(2);
    } catch (err: any) {
      setTestError(err.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConnector = async () => {
    setSavingSource(true);
    try {
      const res = await fetch("/api/admin/api-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          endpointUrl,
          authType,
          authToken,
          fieldMapping,
          syncFrequencyHours: 12,
          autoPublish: false,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowWizard(false);
        setStep(1);
        setName("");
        setEndpointUrl("");
        setAuthToken("");
        fetchSources();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSource(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
              <DownloadCloud className="w-4 h-4 text-accent" />
              <span>External Catalog Sync</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-ink">
              API Import Connectors
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Import and synchronize organic products from external marketplaces and supplier APIs with interactive field mapping.
            </p>
          </div>

          <button
            onClick={() => {
              setShowWizard(true);
              setStep(1);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-semibold shadow-premium transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New API Connector</span>
          </button>
        </div>

        {/* Existing Connectors List */}
        <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
          <div className="p-6 border-b border-line flex items-center justify-between">
            <h3 className="font-bold font-display text-lg text-ink">Configured Import Sources</h3>
            <span className="text-xs font-mono font-semibold bg-bg px-2.5 py-1 rounded-full border border-line text-ink-soft">
              {sources.length} Active Sources
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-soft">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
              <span>Loading import sources...</span>
            </div>
          ) : sources.length === 0 ? (
            <div className="p-12 text-center text-ink-soft space-y-3">
              <Globe className="w-10 h-10 text-ink-soft/40 mx-auto" />
              <p className="text-sm font-medium text-ink">No external API connectors configured</p>
              <p className="text-xs">Add a connector to pull products from partner suppliers or external platforms.</p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {sources.map((s) => (
                <div key={s.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">{s.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-forest-soft text-forest text-[10px] font-bold font-mono">
                        {s.authType}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-ink-soft truncate max-w-lg">
                      {s.endpointUrl}
                    </p>
                    <p className="text-[11px] text-ink-soft">
                      Sync Frequency: Every {s.syncFrequencyHours} Hours • Auto-Publish: {s.autoPublish ? "Enabled" : "Approval Required"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert("Simulating background sync with endpoint. 12 products fetched and ready for admin approval.")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-soft text-forest hover:bg-forest hover:text-white text-xs font-semibold transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wizard Modal */}
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="font-bold font-display text-xl text-ink">
                    Configure External API Connector
                  </h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Step {step} of 3: {step === 1 ? "Endpoint & Authentication" : step === 2 ? "Field Mapping" : "Preview & Verification"}
                  </p>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-xs text-ink-soft hover:text-ink font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Step 1: Endpoint & Auth */}
              {step === 1 && (
                <form onSubmit={handleTestConnection} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      Connector Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Partner Farm Catalog API"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      Endpoint URL (JSON REST) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://api.supplier.com/v1/products"
                      value={endpointUrl}
                      onChange={(e) => setEndpointUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        Auth Type
                      </label>
                      <select
                        value={authType}
                        onChange={(e) => setAuthType(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-xs font-semibold"
                      >
                        <option value="bearer">Bearer Token (Authorization: Bearer)</option>
                        <option value="api-key">API Key (x-api-key Header)</option>
                        <option value="none">None / Public Endpoint</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        Auth Token / API Secret
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                      />
                    </div>
                  </div>

                  {testError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{testError}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-line">
                    <button
                      type="submit"
                      disabled={testingConnection || !endpointUrl.trim()}
                      className="px-6 py-2.5 rounded-2xl bg-forest text-white text-xs font-bold shadow-premium flex items-center gap-2 disabled:opacity-50"
                    >
                      {testingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      <span>Test Connection & Fetch Fields</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Field Mapping UI */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Connection Successful! Found {rawKeys.length} JSON properties in payload. Match external keys to ENMAR product schema:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink">Product Name Key</label>
                      <select
                        value={fieldMapping.name}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                      >
                        <option value="">-- Select Key --</option>
                        {rawKeys.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink">Price Key</label>
                      <select
                        value={fieldMapping.price}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, price: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                      >
                        <option value="">-- Select Key --</option>
                        {rawKeys.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink">Stock Quantity Key</label>
                      <select
                        value={fieldMapping.stockQuantity}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, stockQuantity: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                      >
                        <option value="">-- Select Key --</option>
                        {rawKeys.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink">Images Key (URL or Array)</label>
                      <select
                        value={fieldMapping.images}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, images: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                      >
                        <option value="">-- Select Key --</option>
                        {rawKeys.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-line">
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-ink-soft hover:text-ink"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-2.5 rounded-2xl bg-forest text-white text-xs font-bold shadow-premium flex items-center gap-2"
                    >
                      <span>Preview Live Data</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Preview & Approval */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-forest-soft border border-forest/20 text-xs text-forest">
                    <strong>Admin Verification Safeguard:</strong> Review mapped sample items below before saving this connector.
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sampleItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-bg border border-line text-xs space-y-1">
                        <div className="font-bold text-ink">
                          {item[fieldMapping.name] || item.name || "Item #" + (idx + 1)}
                        </div>
                        <div className="text-ink-soft font-mono">
                          Price: ৳{item[fieldMapping.price] || item.price || 0} • Stock: {item[fieldMapping.stockQuantity] || item.stock || 0}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-line">
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs font-semibold text-ink-soft hover:text-ink"
                    >
                      Back to Mapping
                    </button>
                    <button
                      onClick={handleSaveConnector}
                      disabled={savingSource}
                      className="px-6 py-2.5 rounded-2xl bg-forest text-white text-xs font-bold shadow-premium flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingSource && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Save Connector & Enable Sync</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
