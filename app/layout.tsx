// app/layout.tsx
import type { Metadata } from "next";
import { Hind_Siliguri, Fraunces, Baloo_Da_2, Space_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { StorefrontProvider } from "@/context/StorefrontContext";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import CartDrawer from "@/components/storefront/CartDrawer";
import FloatingWhatsApp from "@/components/storefront/FloatingWhatsApp";
import CustomerAiWidget from "@/components/storefront/CustomerAiWidget";
import CookieConsent from "@/components/storefront/CookieConsent";
import MobileBottomNav from "@/components/storefront/MobileBottomNav";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const balooDa2 = Baloo_Da_2({
  subsets: ["bengali", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-bengali-display",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

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
    <html
      lang="bn"
      suppressHydrationWarning
      className={`overflow-x-hidden max-w-[100vw] ${hindSiliguri.variable} ${fraunces.variable} ${balooDa2.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen bg-[#FAF8F5] text-stone-900 antialiased overflow-x-hidden max-w-[100vw] w-full relative font-body" suppressHydrationWarning>
        <AuthProvider>
          <StorefrontProvider>
            <FeatureFlagProvider>
              <LanguageProvider>
                <CartProvider>
                  <div className="pb-20 md:pb-0 min-h-screen flex flex-col justify-between w-full overflow-x-hidden">
                    {children}
                  </div>
                  <MobileBottomNav />
                  <CartDrawer />
                  <CustomerAiWidget />
                  <FloatingWhatsApp />
                  <CookieConsent />
                </CartProvider>
              </LanguageProvider>
            </FeatureFlagProvider>
          </StorefrontProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
