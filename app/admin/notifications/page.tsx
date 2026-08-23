// app/admin/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  MessageSquare,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Shield,
  Activity,
  Phone,
} from "lucide-react";

export default function AdminNotificationSettingsPage() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSMS, setSavingSMS] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // SMS Gateway Form State
  const [smsForm, setSmsForm] = useState({
    provider: "BulkSMSBD",
    apiKey: "",
    senderId: "ENMAR",
    apiEndpoint: "",
    isActive: true,
  });

  // Email Gateway Form State
  const [emailForm, setEmailForm] = useState({
    provider: "SMTP",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    isActive: true,
  });

  // Test Dispatches
  const [testPhone, setTestPhone] = useState("01614113082");
  const [testEmail, setTestEmail] = useState("admin@enmar.bd");
  const [sendingTestSMS, setSendingTestSMS] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testMessage, setTestMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const json = await res.json();
      if (json.success) {
        setGateways(json.gateways);
        setLogs(json.logs);

        const sms = json.gateways.find((g: any) => g.channel === "SMS");
        if (sms) {
          setSmsForm({
            provider: sms.provider,
            apiKey: sms.apiKey || "",
            senderId: sms.senderId || "ENMAR",
            apiEndpoint: sms.apiEndpoint || "",
            isActive: sms.isActive,
          });
        }

        const email = json.gateways.find((g: any) => g.channel === "EMAIL");
        if (email) {
          setEmailForm({
            provider: email.provider,
            smtpHost: email.smtpHost || "smtp.gmail.com",
            smtpPort: email.smtpPort ? email.smtpPort.toString() : "587",
            smtpUser: email.smtpUser || "",
            smtpPass: email.smtpPass || "",
            isActive: email.isActive,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSMS(true);
    setTestMessage(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "SMS", ...smsForm }),
      });
      const json = await res.json();
      if (json.success) {
        setTestMessage({ text: "SMS Gateway credentials encrypted & saved!", type: "success" });
        fetchSettings();
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      setTestMessage({ text: "Failed to save SMS: " + err.message, type: "error" });
    } finally {
      setSavingSMS(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    setTestMessage(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "EMAIL", ...emailForm }),
      });
      const json = await res.json();
      if (json.success) {
        setTestMessage({ text: "Email Gateway credentials saved!", type: "success" });
        fetchSettings();
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      setTestMessage({ text: "Failed to save Email: " + err.message, type: "error" });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSendTest = async (channel: "SMS" | "EMAIL") => {
    if (channel === "SMS") setSendingTestSMS(true);
    if (channel === "EMAIL") setSendingTestEmail(true);
    setTestMessage(null);

    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          recipient: channel === "SMS" ? testPhone : testEmail,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestMessage({ text: json.message, type: "success" });
        fetchSettings(); // Refresh logs
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      setTestMessage({ text: `Test ${channel} Failed: ` + err.message, type: "error" });
    } finally {
      if (channel === "SMS") setSendingTestSMS(false);
      if (channel === "EMAIL") setSendingTestEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-ink-soft">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-forest mb-2" />
        <span>Loading notification gateways...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink flex items-center gap-2">
          <Bell className="w-7 h-7 text-forest" />
          <span>Notification Gateways & Automation</span>
        </h1>
        <p className="text-xs text-ink-soft mt-1">
          Configure automated customer SMS & Email notifications for new orders, tracking updates, and admin alerts.
        </p>
      </div>

      {/* Global Status Message */}
      {testMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            testMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {testMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{testMessage.text}</span>
        </div>
      )}

      {/* 2-Column Gateways Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. SMS Gateway Card */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-soft text-forest flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-ink">
                  Bangladeshi SMS Gateway
                </h2>
                <p className="text-[11px] text-ink-soft">
                  BulkSMSBD, AlphaSMS, Onnorokom, or Custom API
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono">
              AES-256 ENCRYPTED
            </span>
          </div>

          <form onSubmit={handleSaveSMS} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">SMS Provider</label>
              <select
                value={smsForm.provider}
                onChange={(e) => setSmsForm({ ...smsForm, provider: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-semibold text-ink"
              >
                <option value="BulkSMSBD">BulkSMSBD (Recommended)</option>
                <option value="AlphaSMS">Alpha SMS</option>
                <option value="Onnorokom">Onnorokom SMS</option>
                <option value="GenericREST">Generic REST Endpoint</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">API Key / Token</label>
              <input
                type="password"
                placeholder="Enter SMS API Key"
                value={smsForm.apiKey}
                onChange={(e) => setSmsForm({ ...smsForm, apiKey: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Sender ID (Masking)</label>
                <input
                  type="text"
                  placeholder="ENMAR"
                  value={smsForm.senderId}
                  onChange={(e) => setSmsForm({ ...smsForm, senderId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Gateway Status</label>
                <button
                  type="button"
                  onClick={() => setSmsForm({ ...smsForm, isActive: !smsForm.isActive })}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    smsForm.isActive
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-bg text-ink-soft border-line"
                  }`}
                >
                  {smsForm.isActive ? "● Active & Online" : "Disabled"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSMS}
              className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
            >
              {savingSMS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save SMS Gateway Settings</span>
            </button>
          </form>

          {/* Test SMS Box */}
          <div className="p-4 rounded-2xl bg-bg border border-line space-y-3">
            <span className="text-xs font-bold text-ink block">Send Live Test SMS</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-paper border border-line text-xs font-mono"
              />
              <button
                type="button"
                disabled={sendingTestSMS}
                onClick={() => handleSendTest("SMS")}
                className="px-4 py-2 rounded-xl bg-forest-deep text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {sendingTestSMS ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Test SMS</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Email SMTP Gateway Card */}
        <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-soft text-forest flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-ink">
                  Email Gateway (SMTP / Resend)
                </h2>
                <p className="text-[11px] text-ink-soft">
                  Transactional order confirmation invoices
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono">
              AES-256 ENCRYPTED
            </span>
          </div>

          <form onSubmit={handleSaveEmail} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-ink">SMTP Host</label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  value={emailForm.smtpHost}
                  onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Port</label>
                <input
                  type="text"
                  placeholder="587"
                  value={emailForm.smtpPort}
                  onChange={(e) => setEmailForm({ ...emailForm, smtpPort: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">SMTP Username / Email</label>
              <input
                type="text"
                placeholder="orders@enmar.bd"
                value={emailForm.smtpUser}
                onChange={(e) => setEmailForm({ ...emailForm, smtpUser: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">SMTP Password / App Key</label>
              <input
                type="password"
                placeholder="Enter SMTP App Password"
                value={emailForm.smtpPass}
                onChange={(e) => setEmailForm({ ...emailForm, smtpPass: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={savingEmail}
              className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
            >
              {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Email Settings</span>
            </button>
          </form>

          {/* Test Email Box */}
          <div className="p-4 rounded-2xl bg-bg border border-line space-y-3">
            <span className="text-xs font-bold text-ink block">Send Live Test Email</span>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="admin@enmar.bd"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-paper border border-line text-xs"
              />
              <button
                type="button"
                disabled={sendingTestEmail}
                onClick={() => handleSendTest("EMAIL")}
                className="px-4 py-2 rounded-xl bg-forest-deep text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {sendingTestEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Test Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Activity Logs */}
      <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-4">
        <h2 className="text-base font-bold font-display text-ink flex items-center gap-2">
          <Activity className="w-5 h-5 text-forest" />
          <span>Notification Dispatch Audit Logs</span>
        </h2>

        {logs.length === 0 ? (
          <p className="text-xs text-ink-soft py-6 text-center">
            No notification logs yet. Orders and status changes will log their dispatch results here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg text-ink-soft uppercase font-mono text-[10px] border-b border-line">
                <tr>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Note/Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg/50">
                    <td className="py-3 px-4 font-bold text-ink">{log.channel}</td>
                    <td className="py-3 px-4 font-mono">{log.recipient}</td>
                    <td className="py-3 px-4">{log.subject || "Notification"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          log.status === "SENT"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink-soft font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} • {new Date(log.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                    <td className="py-3 px-4 text-ink-soft truncate max-w-xs">
                      {log.errorReason || "Delivered successfully"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
