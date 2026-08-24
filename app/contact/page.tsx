"use client";
// app/contact/page.tsx

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Send, MessageCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AlertModal from "@/components/ui/AlertModal";

export default function ContactPage() {
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";

  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [alertOpen, setAlertOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;
    setAlertOpen(true);
    setFormData({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-bg text-ink py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? "হোমপেজে ফিরে যান" : "Back to Home"}</span>
        </Link>

        <div className="space-y-3 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <MessageCircle className="w-4 h-4" />
            <span>{t("contact.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            {t("contact.title")}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-paper p-5 rounded-3xl border border-line shadow-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-ink text-sm">{t("contact.hotlineTitle")}</h4>
              <p className="text-xs text-ink-soft">{t("contact.phone")}</p>
              <a
                href="tel:+8801614113082"
                className="inline-block text-xs font-bold text-forest hover:underline"
              >
                {isBn ? "সরাসরি কল করুন →" : "Call Now →"}
              </a>
            </div>

            <div className="bg-paper p-5 rounded-3xl border border-line shadow-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-ink text-sm">WhatsApp</h4>
              <p className="text-xs text-ink-soft">+880 1614 113082</p>
              <a
                href="https://wa.me/8801614113082"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-bold text-emerald-700 hover:underline"
              >
                {isBn ? "হোয়াটসঅ্যাপে চ্যাট করুন →" : "Chat on WhatsApp →"}
              </a>
            </div>

            <div className="bg-paper p-5 rounded-3xl border border-line shadow-card space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-forest text-accent flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-ink text-sm">{t("contact.officeTitle")}</h4>
              <p className="text-xs text-ink-soft leading-relaxed">
                {t("contact.officeAddress")}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
            <h3 className="text-lg font-bold font-display text-ink">
              {t("contact.formTitle")}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                    {t("contact.formName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isBn ? "নাম লিখুন" : "Enter your full name"}
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                    {t("contact.formPhone")}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs font-mono focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  {t("contact.formEmail")}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  {t("contact.formMessage")}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={isBn ? "আপনার প্রশ্ন বা মন্তব্য লিখুন..." : "Write your query or message here..."}
                  className="w-full px-4 py-3 rounded-2xl bg-bg border border-line text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-xs shadow-premium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t("contact.formSubmit")}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertOpen}
        title={isBn ? "বার্তা গৃহীত হয়েছে!" : "Message Sent Successfully!"}
        message={isBn ? "ধন্যবাদ! আপনার বার্তাটি আমাদের কাছে পৌঁছেছে। আমাদের সাপোর্ট টিম দ্রুততম সময়ে আপনার সাথে যোগাযোগ করবে।" : "Thank you! Your message has been received. Our team will contact you shortly."}
        type="success"
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
