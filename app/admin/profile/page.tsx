"use client";
// app/admin/profile/page.tsx

import { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  Mail,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  RefreshCw,
} from "lucide-react";
import AlertModal from "@/components/ui/AlertModal";

export default function AdminProfilePage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Email Update States
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailPreviewOtp, setEmailPreviewOtp] = useState("");

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passOtp, setPassOtp] = useState("");
  const [passOtpSent, setPassOtpSent] = useState(false);
  const [sendingPassOtp, setSendingPassOtp] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);
  const [passPreviewOtp, setPassPreviewOtp] = useState("");

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

  const fetchAdminProfile = async () => {
    try {
      // Default to logged-in admin email from session or admin@enmar.bd
      const email = localStorage.getItem("enmar_admin_email") || "admin@enmar.bd";
      const res = await fetch(`/api/account/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && data.user) {
        setAdminUser(data.user);
        setNewEmail("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // Send OTP for Change Email
  const handleSendEmailOtp = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setAlertState({
        isOpen: true,
        title: "Invalid Email",
        message: "Please enter a valid new Gmail or Email address.",
        type: "warning",
      });
      return;
    }

    setSendingEmailOtp(true);
    try {
      const res = await fetch("/api/account/security?action=send_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: adminUser?.id,
          targetEmail: newEmail,
          type: "CHANGE_EMAIL",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send OTP.");
      }

      setEmailOtpSent(true);
      if (json.previewCode) setEmailPreviewOtp(json.previewCode);
      setAlertState({
        isOpen: true,
        title: "Verification OTP Sent!",
        message: `A 6-digit OTP code has been sent to ${newEmail}. Please enter the code below to confirm.`,
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "OTP Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setSendingEmailOtp(false);
    }
  };

  // Verify and Update Email
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp) return;

    setUpdatingEmail(true);
    try {
      const res = await fetch("/api/account/security?action=update_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: adminUser?.id,
          newEmail,
          otpCode: emailOtp,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Verification failed.");
      }

      // Update local storage email
      localStorage.setItem("enmar_admin_email", newEmail);
      setEmailOtpSent(false);
      setEmailOtp("");
      setEmailPreviewOtp("");
      await fetchAdminProfile();

      setAlertState({
        isOpen: true,
        title: "Email Updated Successfully!",
        message: `Your Admin email address has been verified and updated to ${newEmail}.`,
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "Update Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setUpdatingEmail(false);
    }
  };

  // Send OTP for Change Password
  const handleSendPassOtp = async () => {
    if (!currentPassword) {
      setAlertState({
        isOpen: true,
        title: "Current Password Required",
        message: "Please enter your current password first.",
        type: "warning",
      });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setAlertState({
        isOpen: true,
        title: "Weak Password",
        message: "New password must be at least 6 characters.",
        type: "warning",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlertState({
        isOpen: true,
        title: "Password Mismatch",
        message: "New password and confirmation password do not match.",
        type: "warning",
      });
      return;
    }

    setSendingPassOtp(true);
    try {
      const res = await fetch("/api/account/security?action=send_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: adminUser?.id,
          userEmail: adminUser?.email,
          type: "CHANGE_PASSWORD",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send OTP.");
      }

      setPassOtpSent(true);
      if (json.previewCode) setPassPreviewOtp(json.previewCode);
      setAlertState({
        isOpen: true,
        title: "Security OTP Sent!",
        message: `A 6-digit password change verification OTP has been sent to your registered Gmail (${adminUser?.email}).`,
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "OTP Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setSendingPassOtp(false);
    }
  };

  // Verify and Update Password
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passOtp) return;

    setUpdatingPass(true);
    try {
      const res = await fetch("/api/account/security?action=update_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: adminUser?.id,
          currentPassword,
          newPassword,
          otpCode: passOtp,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Password change failed.");
      }

      setPassOtpSent(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPassOtp("");
      setPassPreviewOtp("");

      setAlertState({
        isOpen: true,
        title: "Password Changed!",
        message: "Your Admin account password has been updated securely. Use your new password on next login.",
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: "Change Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setUpdatingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-forest flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading Admin Profile...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest text-accent font-display font-bold text-2xl flex items-center justify-center shadow-md">
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-display text-ink">{adminUser?.name || "Admin User"}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-forest-soft text-forest text-[11px] font-bold uppercase tracking-wider border border-forest/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin</span>
              </span>
            </div>
            <p className="text-xs text-ink-soft mt-1 font-mono">{adminUser?.email || "admin@enmar.bd"}</p>
          </div>
        </div>

        <div className="text-xs text-ink-soft space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-forest" />
            <span>Account Active &bull; Role: SUPER_ADMIN</span>
          </div>
          <p className="text-[11px] text-ink-soft">2FA & Gmail Security Verification Enabled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Change Email with Gmail OTP */}
        <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-5">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-ink">Change Admin Email</h3>
              <p className="text-[11px] text-ink-soft">Verify via 6-digit Gmail OTP code</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Current Registered Email
              </label>
              <input
                type="text"
                disabled
                value={adminUser?.email || ""}
                className="w-full px-4 py-2.5 rounded-xl bg-bg/50 border border-line text-xs font-mono text-ink-soft cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                New Gmail / Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. newadmin@gmail.com"
                  disabled={emailOtpSent}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-bg border border-line text-xs font-mono focus:outline-none focus:border-forest"
                />
                {!emailOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={sendingEmailOtp || !newEmail}
                    className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {sendingEmailOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send OTP</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEmailOtpSent(false); setEmailOtp(""); }}
                    className="px-3 py-2.5 rounded-xl bg-bg border border-line hover:text-rose-600 text-xs font-semibold"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>

            {emailOtpSent && (
              <form onSubmit={handleVerifyEmail} className="p-4 rounded-2xl bg-forest/5 border border-forest/20 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                    Enter 6-Digit OTP Code
                  </label>
                  {emailPreviewOtp && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                      Test Code: {emailPreviewOtp}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-forest/30 text-center text-lg font-mono font-bold tracking-widest text-forest focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={updatingEmail || emailOtp.length < 6}
                  className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Verify OTP & Update Email</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 2. Change Password with Gmail OTP */}
        <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-5">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-ink">Change Admin Password</h3>
              <p className="text-[11px] text-ink-soft">Secure update with current password & OTP</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            {!passOtpSent ? (
              <button
                type="button"
                onClick={handleSendPassOtp}
                disabled={sendingPassOtp || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {sendingPassOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                <span>Send Security OTP to Gmail</span>
              </button>
            ) : (
              <form onSubmit={handleVerifyPassword} className="p-4 rounded-2xl bg-forest/5 border border-forest/20 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                    Enter Gmail OTP Code
                  </label>
                  {passPreviewOtp && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                      Test Code: {passPreviewOtp}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={passOtp}
                  onChange={(e) => setPassOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-forest/30 text-center text-lg font-mono font-bold tracking-widest text-forest focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={updatingPass || passOtp.length < 6}
                  className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Verify OTP & Update Password</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />
    </div>
  );
}
