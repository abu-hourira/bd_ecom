"use client";
// app/account/profile/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  CheckCircle2,
  Loader2,
  Save,
  Send,
  Key,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import AccountNav from "@/components/account/AccountNav";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import AlertModal from "@/components/ui/AlertModal";

export default function ProfilePage() {
  const router = useRouter();
  const { lang, locale } = useLanguage();
  const { user: storedAuth, isAuthenticated, isLoaded, updateUser } = useAuth();
  const isBn = locale === "bn";

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // General Form states
  const [name, setName] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [savingGeneral, setSavingGeneral] = useState(false);

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

  const loadUserData = (storedData: any) => {
    fetch(`/api/account/profile?email=${encodeURIComponent(storedData.email || "")}&phone=${encodeURIComponent(storedData.phone || "")}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCustomer(data.user);
          setName(data.user.name || "");
          setCity(data.user.city || "Dhaka");
          setAddress(data.user.address || "");
          setPostalCode(data.user.postalCode || "");
        } else {
          router.push("/auth/login");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated || !storedAuth) {
      router.push("/auth/login");
      return;
    }
    loadUserData(storedAuth);
  }, [isLoaded, isAuthenticated]);

  // Update General Details (Name, Address, City)
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) return;
    setSavingGeneral(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: customer.id,
          name,
          city,
          address,
          postalCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update profile");

      updateUser({ name });

      setAlertState({
        isOpen: true,
        title: isBn ? "প্রোফাইল আপডেট হয়েছে!" : "Profile Updated!",
        message: isBn ? "আপনার নাম ও ঠিকানার বিবরণ সফলভাবে সেভ করা হয়েছে।" : "Your personal profile details have been saved.",
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: isBn ? "ত্রুটি ঘটেছে" : "Error",
        message: err.message,
        type: "error",
      });
    } finally {
      setSavingGeneral(false);
    }
  };

  // 1. Send OTP for Customer Email Change
  const handleSendEmailOtp = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setAlertState({
        isOpen: true,
        title: isBn ? "সঠিক ইমেইল লিখুন" : "Invalid Email",
        message: isBn ? "অনুগ্রহ করে আপনার নতুন Gmail বা ইমেইল ঠিকানাটি লিখুন।" : "Please enter a valid new email address.",
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
          userId: customer?.id,
          targetEmail: newEmail,
          type: "CHANGE_EMAIL",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to send OTP");

      setEmailOtpSent(true);
      if (json.previewCode) setEmailPreviewOtp(json.previewCode);
      setAlertState({
        isOpen: true,
        title: isBn ? "ভেরিফিকেশন ওটিপি পাঠানো হয়েছে!" : "OTP Sent Successfully!",
        message: isBn ? `আপনার নতুন ইমেইলে (${newEmail}) ৬-ডিজিটের একটি কোড পাঠানো হয়েছে।` : `A 6-digit verification code has been sent to ${newEmail}.`,
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: isBn ? "ওটিপি পাঠানো যায়নি" : "OTP Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setSendingEmailOtp(false);
    }
  };

  // 2. Verify Customer Email Change
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp) return;
    setUpdatingEmail(true);
    try {
      const res = await fetch("/api/account/security?action=update_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customer?.id,
          newEmail,
          otpCode: emailOtp,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Verification failed");

      updateUser({ email: newEmail });
      setCustomer({ ...customer, email: newEmail });
      setEmailOtpSent(false);
      setEmailOtp("");
      setEmailPreviewOtp("");

      setAlertState({
        isOpen: true,
        title: isBn ? "ইমেইল সফলভাবে পরিবর্তন হয়েছে!" : "Email Updated!",
        message: isBn ? `আপনার অ্যাকাউন্ট ইমেইল ${newEmail} এ হালনাগাদ করা হয়েছে।` : `Your profile email has been updated to ${newEmail}.`,
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: isBn ? "ব্যর্থ হয়েছে" : "Update Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setUpdatingEmail(false);
    }
  };

  // 3. Send OTP for Customer Password Change
  const handleSendPassOtp = async () => {
    if (!currentPassword) {
      setAlertState({
        isOpen: true,
        title: isBn ? "বর্তমান পাসওয়ার্ড দিন" : "Current Password Required",
        message: isBn ? "অনুগ্রহ করে প্রথমে আপনার বর্তমান পাসওয়ার্ডটি লিখুন।" : "Please enter your current password.",
        type: "warning",
      });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setAlertState({
        isOpen: true,
        title: isBn ? "পাসওয়ার্ড দুর্বল" : "Weak Password",
        message: isBn ? "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "New password must be at least 6 characters.",
        type: "warning",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlertState({
        isOpen: true,
        title: isBn ? "পাসওয়ার্ড মেলেনি" : "Password Mismatch",
        message: isBn ? "নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।" : "Passwords do not match.",
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
          userId: customer?.id,
          userEmail: customer?.email,
          type: "CHANGE_PASSWORD",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to send OTP");

      setPassOtpSent(true);
      if (json.previewCode) setPassPreviewOtp(json.previewCode);
      setAlertState({
        isOpen: true,
        title: isBn ? "সিকিউরিটি ওটিপি পাঠানো হয়েছে!" : "Security OTP Sent!",
        message: isBn ? `আপনার নিবন্ধিত জিমেইল (${customer?.email})-এ পাসওয়ার্ড পরিবর্তনের ৬-ডিজিট ওটিপি পাঠানো হয়েছে।` : `A 6-digit password verification OTP has been sent to ${customer?.email}.`,
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: isBn ? "ওটিপি ব্যর্থ" : "OTP Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setSendingPassOtp(false);
    }
  };

  // 4. Verify Customer Password Change
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passOtp) return;
    setUpdatingPass(true);
    try {
      const res = await fetch("/api/account/security?action=update_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customer?.id,
          currentPassword,
          newPassword,
          otpCode: passOtp,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to change password");

      setPassOtpSent(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPassOtp("");
      setPassPreviewOtp("");

      setAlertState({
        isOpen: true,
        title: isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!" : "Password Changed!",
        message: isBn ? "আপনার অ্যাকাউন্টের পাসওয়ার্ড আপডেট করা হয়েছে। পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।" : "Your password has been changed securely.",
        type: "success",
      });
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        title: isBn ? "ব্যর্থ হয়েছে" : "Change Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setUpdatingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
        <StorefrontHeader />
        <div className="flex-1 flex items-center justify-center py-24 text-forest font-medium">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          <span>{isBn ? "প্রোফাইল লোড হচ্ছে..." : "Loading profile..."}</span>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <AccountNav />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info (Name, Address) */}
          <div className="lg:col-span-1 bg-paper p-6 rounded-3xl border border-line shadow-card space-y-5">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold font-display text-lg">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="font-bold text-ink text-base">{name || "Customer"}</h3>
                <p className="text-xs text-ink-soft font-mono">{customer?.phone || ""}</p>
              </div>
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  {isBn ? "পূর্ণ নাম *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  {isBn ? "শহর / জেলা *" : "City / District *"}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                >
                  <option value="Dhaka">Dhaka (ঢাকা)</option>
                  <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                  <option value="Sylhet">Sylhet (সিলেট)</option>
                  <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                  <option value="Khulna">Khulna (খুলনা)</option>
                  <option value="Barisal">Barisal (বরিশাল)</option>
                  <option value="Rangpur">Rangpur (রংপুর)</option>
                  <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  {isBn ? "ডেলিভারি ঠিকানা *" : "Delivery Address *"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isBn ? "হাউজ, রোড, এলাকা..." : "House, Road, Area..."}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <button
                type="submit"
                disabled={savingGeneral}
                className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingGeneral ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isBn ? "তথ্য সেভ করুন" : "Save Personal Info"}</span>
              </button>
            </form>
          </div>

          {/* Right Column (2 Cols): Email & Password Changes with Gmail OTP */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Email Change Box */}
            <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-4">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-ink">
                    {isBn ? "ইমেইল পরিবর্তন ও জিমেইল ভেরিফিকেশন" : "Change Email (Gmail OTP Verification)"}
                  </h3>
                  <p className="text-[11px] text-ink-soft">
                    {isBn ? "নিরাপত্তার স্বার্থে নতুন ইমেইলে ওটিপি পাঠিয়ে নিশ্চিত করা হয়।" : "A 6-digit OTP code will verify your new email."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-1">
                    {isBn ? "বর্তমান ইমেইল" : "Current Email"}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={customer?.email || (isBn ? "কোনো ইমেইল সেট নেই" : "No email set")}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg/50 border border-line text-xs font-mono text-ink-soft cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-1">
                    {isBn ? "নতুন জিমেইল / ইমেইল *" : "New Gmail / Email Address *"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      disabled={emailOtpSent}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-bg border border-line text-xs font-mono focus:outline-none focus:border-forest"
                    />
                    {!emailOtpSent ? (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={sendingEmailOtp || !newEmail}
                        className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {sendingEmailOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{isBn ? "ওটিপি পাঠান" : "Send OTP"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setEmailOtpSent(false); setEmailOtp(""); }}
                        className="px-3 py-2 rounded-xl bg-bg border border-line hover:text-rose-600 text-xs font-semibold"
                      >
                        {isBn ? "পরিবর্তন" : "Change"}
                      </button>
                    )}
                  </div>
                </div>

                {emailOtpSent && (
                  <form onSubmit={handleVerifyEmail} className="p-3.5 rounded-2xl bg-forest/5 border border-forest/20 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                        {isBn ? "৬-ডিজিট ওটিপি কোড লিখুন" : "Enter 6-Digit OTP"}
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
                      className="w-full px-4 py-2 rounded-xl bg-white border border-forest/30 text-center text-lg font-mono font-bold tracking-widest text-forest focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={updatingEmail || emailOtp.length < 6}
                      className="w-full py-2 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {updatingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{isBn ? "ইমেইল ভেরিফাই ও সেভ করুন" : "Verify & Update Email"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* 2. Password Change Box */}
            <div className="bg-paper p-6 rounded-3xl border border-line shadow-card space-y-4">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-ink">
                    {isBn ? "পাসওয়ার্ড পরিবর্তন ও সিকিউরিটি ওটিপি" : "Change Password (Gmail OTP)"}
                  </h3>
                  <p className="text-[11px] text-ink-soft">
                    {isBn ? "পাসওয়ার্ড পরিবর্তনের জন্য আপনার নিবন্ধিত জিমেইলে ওটিপি যাবে।" : "An OTP will be sent to your registered Gmail to authorize password changes."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-1">
                    {isBn ? "বর্তমান পাসওয়ার্ড *" : "Current Password *"}
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={isBn ? "বর্তমান পাসওয়ার্ড লিখুন" : "Enter current password"}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-1">
                      {isBn ? "নতুন পাসওয়ার্ড *" : "New Password *"}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isBn ? "কমপক্ষে ৬ অক্ষর" : "Min 6 chars"}
                      className="w-full px-3.5 py-2 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-1">
                      {isBn ? "পাসওয়ার্ড নিশ্চিত করুন *" : "Confirm Password *"}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={isBn ? "পুনরায় লিখুন" : "Repeat new password"}
                      className="w-full px-3.5 py-2 rounded-xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
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
                    <span>{isBn ? "জিমেইলে সিকিউরিটি ওটিপি পাঠান" : "Send Security OTP to Gmail"}</span>
                  </button>
                ) : (
                  <form onSubmit={handleVerifyPassword} className="p-3.5 rounded-2xl bg-forest/5 border border-forest/20 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-forest uppercase tracking-wider">
                        {isBn ? "জিমেইল ওটিপি কোড লিখুন" : "Enter Gmail OTP"}
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
                      className="w-full px-4 py-2 rounded-xl bg-white border border-forest/30 text-center text-lg font-mono font-bold tracking-widest text-forest focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={updatingPass || passOtp.length < 6}
                      className="w-full py-2 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {updatingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{isBn ? "ওটিপি যাচাই ও পাসওয়ার্ড পরিবর্তন" : "Verify OTP & Update Password"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />

      <StorefrontFooter />
    </div>
  );
}
