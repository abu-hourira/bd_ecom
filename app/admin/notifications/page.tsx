"use client";
// app/admin/notifications/page.tsx - Complete Notifications Management with Direct Live Diagnostics

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
  KeyRound,
  ExternalLink,
  Info,
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
  const [testEmail, setTestEmail] = useState("");
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
          if (email.smtpUser && !testEmail) {
            setTestEmail(email.smtpUser);
          }
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
        setTestMessage({ text: "SMS Gateway credentials saved successfully.", type: "success" });
        fetchSettings();
      } else {
        setTestMessage({ text: json.error || "Failed to save SMS settings.", type: "error" });
      }
    } catch (err: any) {
      setTestMessage({ text: err.message, type: "error" });
    } finally {
      setSavingSMS(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.smtpUser.trim()) {
      setTestMessage({ text: "Please enter your Gmail address (Username).", type: "error" });
      return;
    }
    if (!emailForm.smtpPass.trim() && !emailGateway?.smtpPass) {
      setTestMessage({ text: "Please enter your 16-character Google App Password.", type: "error" });
      return;
    }

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
        setTestMessage({ text: "Gmail / SMTP Gateway credentials saved and encrypted securely! You can now send a test email below.", type: "success" });
        fetchSettings();
      } else {
        setTestMessage({ text: json.error || "Failed to save Email settings.", type: "error" });
      }
    } catch (err: any) {
      setTestMessage({ text: err.message, type: "error" });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSendTestSMS = async () => {
    if (!testPhone.trim()) return;
    setSendingTestSMS(true);
    setTestMessage(null);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "SMS", recipient: testPhone }),
      });
      const json = await res.json();
      if (json.success) {
        setTestMessage({ text: json.message, type: "success" });
        fetchSettings();
      } else {
        setTestMessage({ text: json.error || "Failed to send test SMS.", type: "error" });
      }
    } catch (err: any) {
      setTestMessage({ text: err.message, type: "error" });
    } finally {
      setSendingTestSMS(false);
    }
  };

  const handleSendTestEmail = async () => {
    const recipient = testEmail.trim() || emailForm.smtpUser.trim();
    if (!recipient) {
      setTestMessage({ text: "Please enter a recipient email address to receive the test email.", type: "error" });
      return;
    }
    setSendingTestEmail(true);
    setTestMessage(null);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "EMAIL",
          recipient,
          smtpHost: emailForm.smtpHost,
          smtpPort: emailForm.smtpPort,
          smtpUser: emailForm.smtpUser,
          smtpPass: emailForm.smtpPass,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestMessage({ text: json.message, type: "success" });
        // Auto-save verified settings
        await fetch("/api/admin/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: "EMAIL", ...emailForm }),
        }).catch(() => {});
        fetchSettings();
      } else {
        setTestMessage({ text: json.error || "Failed to send test email.", type: "error" });
      }
    } catch (err: any) {
      setTestMessage({ text: err.message, type: "error" });
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-forest mb-2" />
        <p className="text-sm font-semibold">Loading notification gateway settings...</p>
      </div>
    );
  }

  const emailGateway = gateways.find((g: any) => g.channel === "EMAIL");

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-forest" />
            <span>Notification Gateway Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Configure automated SMS and Email credentials for customer order updates and admin alerts.
          </p>
        </div>
      </div>

      {/* Global Alert Notification */}
      {testMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
            testMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          {testMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm font-semibold leading-relaxed flex-1">
            {testMessage.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. EMAIL GATEWAY (SMTP / GMAIL) */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-stone-900">Email Gateway (Gmail / SMTP)</h2>
                  <span className="text-xs text-stone-500">Transactional Order & Verification Emails</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  emailGateway?.isActive
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {emailGateway?.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Google App Password Guide Note */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>How to connect your Gmail in 2 minutes:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-800 leading-relaxed pl-1">
                <li>Make sure <strong>2-Step Verification</strong> is turned ON in your Google account.</li>
                <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-bold text-blue-950 inline-flex items-center gap-0.5">Google App Passwords <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                <li>Create an App Password named <strong>ENMAR</strong> and copy the 16-character code.</li>
                <li>Paste your Gmail ID and the 16-character code below and click <strong>Save Settings</strong>.</li>
              </ol>
            </div>

            <form onSubmit={handleSaveEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Provider
                </label>
                <select
                  value={emailForm.provider}
                  onChange={(e) => setEmailForm({ ...emailForm, provider: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:outline-none focus:border-forest"
                >
                  <option value="SMTP">Gmail SMTP (Recommended)</option>
                  <option value="SendGrid">SendGrid / Custom SMTP</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={emailForm.smtpHost}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    value={emailForm.smtpPort}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpPort: e.target.value })}
                    placeholder="587"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {emailForm.provider === "SMTP" ? "Gmail Address (Username)" : "Email Address / Username"}
                </label>
                <input
                  type="email"
                  value={emailForm.smtpUser}
                  onChange={(e) => setEmailForm({ ...emailForm, smtpUser: e.target.value })}
                  placeholder={emailForm.provider === "SMTP" ? "yourname@gmail.com" : "support@enmar.shop"}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>
                    {emailForm.provider === "SMTP"
                      ? "Google App Password (16-characters)"
                      : "cPanel / SMTP Email Password"}
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">Encrypted at rest</span>
                </label>
                <input
                  type="text"
                  value={emailForm.smtpPass}
                  onChange={(e) => setEmailForm({ ...emailForm, smtpPass: e.target.value })}
                  placeholder="e.g. abcd efgh ijkl mnop"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:border-forest"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="emailActive"
                  checked={emailForm.isActive}
                  onChange={(e) => setEmailForm({ ...emailForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <label htmlFor="emailActive" className="text-xs font-semibold text-stone-700">
                  Enable this Email Gateway for live notifications
                </label>
              </div>

              <button
                type="submit"
                disabled={savingEmail}
                className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
              >
                {savingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving & Encrypting...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Save Email Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Test Email Dispatcher */}
          <div className="border-t border-stone-100 pt-4 space-y-3 bg-stone-50/70 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-forest" />
              <span>Send Live Test Email</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Recipient email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-forest"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                {sendingTestEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. SMS GATEWAY (BulkSMSBD / Alpha SMS) */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-forest flex items-center justify-center border border-emerald-200">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-stone-900">SMS Gateway (Bangladeshi API)</h2>
                  <span className="text-xs text-stone-500">Order SMS & Login OTP</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  smsForm.isActive
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {smsForm.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <form onSubmit={handleSaveSMS} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Provider
                </label>
                <select
                  value={smsForm.provider}
                  onChange={(e) => setSmsForm({ ...smsForm, provider: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:outline-none focus:border-forest"
                >
                  <option value="BulkSMSBD">BulkSMSBD</option>
                  <option value="AlphaSMS">Alpha SMS</option>
                  <option value="Greenweb">Greenweb BD</option>
                  <option value="GenericREST">Generic REST API</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  API Key / Token
                </label>
                <input
                  type="password"
                  value={smsForm.apiKey}
                  onChange={(e) => setSmsForm({ ...smsForm, apiKey: e.target.value })}
                  placeholder="Enter API Key from your SMS provider"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Sender ID (Approved Masking / Non-Masking)
                </label>
                <input
                  type="text"
                  value={smsForm.senderId}
                  onChange={(e) => setSmsForm({ ...smsForm, senderId: e.target.value })}
                  placeholder="ENMAR"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Custom Endpoint URL (Optional)
                </label>
                <input
                  type="url"
                  value={smsForm.apiEndpoint}
                  onChange={(e) => setSmsForm({ ...smsForm, apiEndpoint: e.target.value })}
                  placeholder="https://bulksmsbd.net/api/smsapi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:border-forest"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="smsActive"
                  checked={smsForm.isActive}
                  onChange={(e) => setSmsForm({ ...smsForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <label htmlFor="smsActive" className="text-xs font-semibold text-stone-700">
                  Enable this SMS Gateway for live SMS
                </label>
              </div>

              <button
                type="submit"
                disabled={savingSMS}
                className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
              >
                {savingSMS ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving & Encrypting...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Save SMS Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Test SMS Dispatcher */}
          <div className="border-t border-stone-100 pt-4 space-y-3 bg-stone-50/70 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-forest" />
              <span>Send Live Test SMS</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-forest font-mono"
              />
              <button
                type="button"
                onClick={handleSendTestSMS}
                disabled={sendingTestSMS}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                {sendingTestSMS ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Activity Logs Table */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-forest" />
            <h3 className="font-display font-bold text-base text-stone-900">Recent Notification Delivery Logs</h3>
          </div>
          <button
            onClick={fetchSettings}
            className="text-xs font-bold text-forest hover:underline cursor-pointer"
          >
            Refresh Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Subject / Event</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Details / Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No notification logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] ${
                          log.channel === "SMS"
                            ? "bg-emerald-50 text-forest border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {log.channel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-stone-900">
                      {log.recipient}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-800 truncate max-w-xs">
                      {log.subject || "Order Notification"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === "SENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 text-[11px] max-w-xs truncate font-mono">
                      {log.errorReason || "Delivered successfully"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
