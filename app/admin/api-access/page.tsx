// app/admin/api-access/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  ShieldCheck,
  Activity,
  Code2,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";

export default function ApiAccessPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Key Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(60);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/admin/api-keys");
      const json = await res.json();
      if (json.success) {
        setKeys(json.keys || []);
        setLogs(json.recentLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          rateLimit: newKeyRateLimit,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedRawKey(json.rawKey);
        fetchKeys();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleKey = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm("Are you sure you want to permanently revoke and delete this API key? External clients using this key will immediately lose access.")) return;

    try {
      await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
              <Key className="w-4 h-4 text-accent" />
              <span>Developer & Marketplace Gateway</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-ink">
              API Access & Keys
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Expose ENMAR's catalog to external consumers and mobile apps safely with encrypted API keys.
            </p>
          </div>

          <button
            onClick={() => {
              setCreatedRawKey(null);
              setNewKeyName("");
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-deep text-white text-xs font-semibold shadow-premium transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Key</span>
          </button>
        </div>

        {/* Security Isolation Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Strict Public-Safe Data Isolation Active:</strong> External API consumers only receive public-safe catalog data (name, price, images, units, organic badges, stock status). Customer personal data, admin passwords, vendor purchase costs, and financial reports are strictly unreachable via public APIs.
          </div>
        </div>

        {/* API Keys Table */}
        <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
          <div className="p-6 border-b border-line flex items-center justify-between">
            <h3 className="font-bold font-display text-lg text-ink">Active API Keys</h3>
            <span className="text-xs font-mono font-semibold bg-bg px-2.5 py-1 rounded-full border border-line text-ink-soft">
              {keys.length} Keys Configured
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-soft">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
              <span>Loading API keys...</span>
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center text-ink-soft space-y-3">
              <Key className="w-10 h-10 text-ink-soft/40 mx-auto" />
              <p className="text-sm font-medium text-ink">No API keys created yet</p>
              <p className="text-xs">Generate an API key to allow other platforms to read your catalog.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Key Name</th>
                    <th className="p-4">Prefix Token</th>
                    <th className="p-4">Rate Limit</th>
                    <th className="p-4">Total Requests</th>
                    <th className="p-4">Last Used</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-bg/50 transition-colors">
                      <td className="p-4 font-semibold text-ink">{k.name}</td>
                      <td className="p-4 font-mono text-ink-soft bg-paper/50">
                        {k.keyPrefix}••••••••••••
                      </td>
                      <td className="p-4 font-mono">{k.rateLimit} req/min</td>
                      <td className="p-4 font-mono font-bold text-forest">{k.requestCount}</td>
                      <td className="p-4 text-ink-soft font-mono">
                        {k.lastUsedAt
                          ? new Date(k.lastUsedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleKey(k.id, k.isActive)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            k.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              k.isActive ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                          <span>{k.isActive ? "Active" : "Revoked"}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          className="p-1.5 text-ink-soft hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Revoke & Delete Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* API Reference & Interactive Documentation */}
        <div className="bg-paper rounded-3xl border border-line p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2">
                <Code2 className="w-5 h-5 text-forest" />
                <span>REST API Reference</span>
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Authentication requires passing your API key in the <code className="bg-bg px-1.5 py-0.5 rounded border border-line text-forest font-mono">x-api-key</code> header.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Endpoint 1: List Products */}
            <div className="p-4 rounded-2xl bg-bg border border-line space-y-3">
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">GET</span>
                <span className="font-bold text-ink">/api/v1/products</span>
                <span className="text-ink-soft text-[11px] ml-auto">Returns all active catalog products</span>
              </div>

              <div className="bg-forest-deep text-white p-3 rounded-xl font-mono text-xs overflow-x-auto">
                <div className="text-accent"># Example cURL Request</div>
                <div>curl -X GET "https://enmar.bd/api/v1/products" \</div>
                <div className="pl-4">-H "x-api-key: enm_live_YOUR_KEY_HERE"</div>
              </div>
            </div>

            {/* Endpoint 2: Single Product */}
            <div className="p-4 rounded-2xl bg-bg border border-line space-y-3">
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">GET</span>
                <span className="font-bold text-ink">/api/v1/products/:id</span>
                <span className="text-ink-soft text-[11px] ml-auto">Retrieve product by ID or Slug</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live API Usage Logs */}
        <div className="bg-paper rounded-3xl border border-line shadow-card overflow-hidden">
          <div className="p-6 border-b border-line flex items-center justify-between">
            <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              <span>Live API Access Logs (Last 20)</span>
            </h3>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-ink-soft text-xs">
              No API requests logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Key</th>
                    <th className="p-4">Endpoint</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-bg/50">
                      <td className="p-4 text-ink-soft font-mono">
                        {new Date(l.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="p-4 font-semibold text-ink">{l.apiKey?.name || "Unknown"}</td>
                      <td className="p-4 font-mono text-forest">{l.endpoint}</td>
                      <td className="p-4 font-mono text-ink-soft">{l.ipAddress}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                          {l.status} OK
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Key Generation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 animate-in zoom-in-95 duration-200">
              <div>
                <h3 className="font-bold font-display text-xl text-ink">
                  {createdRawKey ? "Your Secret API Key" : "Generate API Key"}
                </h3>
                <p className="text-xs text-ink-soft mt-1">
                  {createdRawKey
                    ? "Please copy and save this secret key now. You will not be able to view it again!"
                    : "Create a unique access token for external integrations."}
                </p>
              </div>

              {createdRawKey ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Important Security Warning</span>
                    </div>
                    <p>
                      This is the only time this secret key is displayed in plain text. Store it securely in your environment variables.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-bg border border-line font-mono text-xs break-all flex items-center justify-between gap-3 select-all">
                    <span className="font-bold text-forest">{createdRawKey}</span>
                    <button
                      onClick={() => copyToClipboard(createdRawKey)}
                      className="px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-full py-3 rounded-2xl bg-forest text-white font-bold text-xs shadow-premium"
                  >
                    Done & Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      Integration Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Partner Mobile App or Marketplace Hub"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      Rate Limit (Requests Per Minute)
                    </label>
                    <input
                      type="number"
                      value={newKeyRateLimit}
                      onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-sm font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !newKeyName.trim()}
                      className="px-6 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-premium disabled:opacity-50 flex items-center gap-2"
                    >
                      {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Create Key</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
