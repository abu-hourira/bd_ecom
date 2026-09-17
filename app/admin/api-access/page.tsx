"use client";
import ConfirmModal from "@/components/ui/ConfirmModal";
// app/admin/api-access/page.tsx

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
  const [revokeKeyTarget, setRevokeKeyTarget] = useState<any | null>(null);
  const [revoking, setRevoking] = useState(false);

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

  const confirmRevokeKey = async () => {
    if (!revokeKeyTarget) return;
    setRevoking(true);
    try {
      await fetch(`/api/admin/api-keys/${revokeKeyTarget.id}`, { method: "DELETE" });
      setRevokeKeyTarget(null);
      fetchKeys();
    } catch (e) {
      console.error(e);
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest uppercase tracking-wider mb-0.5">
            <Key className="w-3.5 h-3.5 text-accent" />
            <span>Developer & Marketplace Gateway</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-ink">
            API Access & Keys
          </h1>
          <p className="text-xs text-ink-soft mt-0.5">
            Expose ENMAR's catalog to external consumers and mobile apps safely with encrypted API keys.
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedRawKey(null);
            setNewKeyName("");
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-semibold shadow-xs transition-all hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Security Isolation Notice */}
      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Strict Public-Safe Data Isolation Active:</strong> External API consumers only receive public-safe catalog data (name, price, images, units, organic badges, stock status). Customer personal data, admin passwords, vendor purchase costs, and financial reports are strictly unreachable via public APIs.
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-paper rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h3 className="font-bold font-display text-sm text-ink">Active API Keys</h3>
          <span className="text-[11px] font-mono font-semibold bg-bg px-2 py-0.5 rounded-md border border-line text-ink-soft">
            {keys.length} Keys Configured
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-ink-soft">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-forest mb-2" />
            <span className="text-xs">Loading API keys...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-10 text-center text-ink-soft space-y-2">
            <Key className="w-8 h-8 text-ink-soft/40 mx-auto" />
            <p className="text-xs font-medium text-ink">No API keys created yet</p>
            <p className="text-[11px]">Generate an API key to allow other platforms to read your catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Key Name</th>
                  <th className="px-4 py-2.5">Prefix Token</th>
                  <th className="px-4 py-2.5">Rate Limit</th>
                  <th className="px-4 py-2.5">Total Requests</th>
                  <th className="px-4 py-2.5">Last Used</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-ink">{k.name}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-soft bg-paper/50">
                      {k.keyPrefix}••••••••••••
                    </td>
                    <td className="px-4 py-2.5 font-mono">{k.rateLimit} req/min</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-forest">{k.requestCount}</td>
                    <td className="px-4 py-2.5 text-ink-soft font-mono text-[11px]">
                      {k.lastUsedAt
                        ? new Date(k.lastUsedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Never"}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleToggleKey(k.id, k.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setRevokeKeyTarget(k)}
                        className="p-1 text-ink-soft hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Revoke & Delete Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      <div className="bg-paper rounded-2xl border border-line p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="font-bold font-display text-sm text-ink flex items-center gap-2">
              <Code2 className="w-4 h-4 text-forest" />
              <span>REST API Reference</span>
            </h3>
            <p className="text-[11px] text-ink-soft mt-0.5">
              Authentication requires passing your API key in the <code className="bg-bg px-1.5 py-0.5 rounded border border-line text-forest font-mono">x-api-key</code> header.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Endpoint 1: List Products */}
          <div className="p-3.5 rounded-xl bg-bg border border-line space-y-2">
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">GET</span>
              <span className="font-bold text-ink">/api/v1/products</span>
              <span className="text-ink-soft text-[10px] ml-auto">Returns all active catalog products</span>
            </div>

            <div className="bg-forest-deep text-white p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
              <div className="text-accent"># Example cURL Request</div>
              <div>curl -X GET "https://enmar.bd/api/v1/products" \</div>
              <div className="pl-4">-H "x-api-key: enm_live_YOUR_KEY_HERE"</div>
            </div>
          </div>

          {/* Endpoint 2: Single Product */}
          <div className="p-3.5 rounded-xl bg-bg border border-line space-y-2">
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">GET</span>
              <span className="font-bold text-ink">/api/v1/products/:id</span>
              <span className="text-ink-soft text-[10px] ml-auto">Retrieve product by ID or Slug</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live API Usage Logs */}
      <div className="bg-paper rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h3 className="font-bold font-display text-sm text-ink flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span>Live API Access Logs (Last 20)</span>
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center text-ink-soft text-xs">
            No API requests logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg border-b border-line text-ink-soft uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Key</th>
                  <th className="px-4 py-2.5">Endpoint</th>
                  <th className="px-4 py-2.5">IP Address</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-bg/50">
                    <td className="px-4 py-2 text-ink-soft font-mono text-[11px]">
                      {new Date(l.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-4 py-2 font-semibold text-ink">{l.apiKey?.name || "Unknown"}</td>
                    <td className="px-4 py-2 font-mono text-forest">{l.endpoint}</td>
                    <td className="px-4 py-2 font-mono text-ink-soft text-[11px]">{l.ipAddress}</td>
                    <td className="px-4 py-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
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
          <div className="bg-paper rounded-2xl border border-line shadow-2xl p-5 sm:p-6 max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-bold font-display text-base text-ink">
                {createdRawKey ? "Your Secret API Key" : "Generate API Key"}
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                {createdRawKey
                  ? "Please copy and save this secret key now. You will not be able to view it again!"
                  : "Create a unique access token for external integrations."}
              </p>
            </div>

            {createdRawKey ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Important Security Warning</span>
                  </div>
                  <p className="text-[11px]">
                    This is the only time this secret key is displayed in plain text. Store it securely in your environment variables.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-bg border border-line font-mono text-xs break-all flex items-center justify-between gap-2 select-all">
                  <span className="font-bold text-forest">{createdRawKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdRawKey)}
                    className="px-2.5 py-1 rounded-lg bg-forest text-white text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-2.5 rounded-xl bg-forest text-white font-bold text-xs shadow-xs"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">
                    Integration Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Partner Mobile App or Marketplace Hub"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">
                    Rate Limit (Requests Per Minute)
                  </label>
                  <input
                    type="number"
                    value={newKeyRateLimit}
                    onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    className="px-4 py-1.5 rounded-xl bg-forest text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Create Key</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(revokeKeyTarget)}
        onClose={() => setRevokeKeyTarget(null)}
        onConfirm={confirmRevokeKey}
        title="Revoke & Delete API Key?"
        message={`Are you sure you want to permanently revoke API key "${revokeKeyTarget?.name || ""}"?\n\nExternal consumers and connected mobile apps using this key will immediately lose access to ENMAR's catalog API.`}
        confirmText="Revoke Key"
        cancelText="Keep Key Active"
        type="danger"
        isLoading={revoking}
        requireTypedConfirmation="REVOKE"
      />
    </div>
  );
}
