// app/layout.tsx
import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import CartDrawer from "@/components/storefront/CartDrawer";
import FloatingWhatsApp from "@/components/storefront/FloatingWhatsApp";
import CustomerAiWidget from "@/components/storefront/CustomerAiWidget";
import CookieConsent from "@/components/storefront/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: "ENMAR — 100% Pure Organic Food & Pantry Essentials",
  description:
    "Bangladesh's premium organic food brand delivering honey, ghee, cold-pressed oils, organic spices, and grains directly from partner farms to your home.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Serif+Bengali:wght@400;600;700&family=Space+Mono:wght@400;700&family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF8F5] text-stone-900 antialiased" suppressHydrationWarning>
        <FeatureFlagProvider>
          <LanguageProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <CustomerAiWidget />
              <FloatingWhatsApp />
              <CookieConsent />
            </CartProvider>
          </LanguageProvider>
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
