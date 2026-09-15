"use client";

import dynamic from "next/dynamic";

const FloatingWhatsApp = dynamic(() => import("@/components/storefront/FloatingWhatsApp"), { ssr: false });
const CustomerAiWidget = dynamic(() => import("@/components/storefront/CustomerAiWidget"), { ssr: false });
const CookieConsent = dynamic(() => import("@/components/storefront/CookieConsent"), { ssr: false });
const DynamicFavicon = dynamic(() => import("@/components/storefront/DynamicFavicon"), { ssr: false });

export default function ClientWidgets() {
  return (
    <>
      <DynamicFavicon />
      <CustomerAiWidget />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  );
}
