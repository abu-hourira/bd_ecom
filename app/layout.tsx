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

const siteUrl = process.env.NEXTAUTH_URL || "https://enmar.bd";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ENMAR — 100% Pure Organic Food & Pantry Essentials | খাঁটি অর্গানিক খাদ্য".normalize("NFC"),
    template: "%s | ENMAR Organic Food",
  },
  description:
    "বাংলাদেশের প্রিমিয়াম অর্গানিক ফুড ব্র্যান্ড। সুন্দরবনের খাঁটি মধু, গাওয়া ঘি, কাঠের ঘানির সরিষার তেল, অর্গানিক চাল, ডাল ও মশলা। সারাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি।".normalize("NFC"),
  keywords: [
    "ENMAR",
    "অর্গানিক ফুড বাংলাদেশ",
    "খাঁটি মধু",
    "সুন্দরবনের মধু",
    "গাওয়া ঘি",
    "খাঁটি সরিষার তেল",
    "কাঠের ঘানির তেল",
    "কালোজিরা তেল",
    "অর্গানিক খাদ্য",
    "Organic Food Bangladesh",
    "Pure Honey BD",
    "Deshi Ghee Dhaka",
    "Cold Pressed Mustard Oil",
    "Organic Grocery Bangladesh",
    "Health Food Store Dhaka",
    "Buy Pure Honey Online",
  ].map((k) => k.normalize("NFC")),
  authors: [{ name: "ENMAR Organic", url: siteUrl }],
  creator: "ENMAR Bangladesh",
  publisher: "ENMAR Organic Food",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
      "en-US": "/?lang=en",
    },
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "ENMAR — Pure Organic Food Bangladesh".normalize("NFC"),
    title: "ENMAR — 100% Pure Organic Food & Pantry Essentials | খাঁটি অর্গানিক খাদ্য".normalize("NFC"),
    description:
      "সুন্দরবনের খাঁটি মধু, গাওয়া ঘি, কাঠের ঘানির সরিষার তেল ও অর্গানিক খাদ্য সম্ভার। ১০০% বিশুদ্ধতার নিশ্চয়তা।".normalize("NFC"),
    images: [
      {
        url: "/assets/logo/logo.png",
        width: 800,
        height: 600,
        alt: "ENMAR Organic Food Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ENMAR — 100% Pure Organic Food & Pantry Essentials",
    description:
      "খাঁটি সুন্দরবনের মধু, গাওয়া ঘি, কাঠের ঘানির সরিষার তেল ও অর্গানিক খাদ্য। সারাদেশে ক্যাশ অন ডেলিভারি।".normalize("NFC"),
    images: ["/assets/logo/logo.png"],
    creator: "@enmar_organic",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/assets/logo/logo.png",
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ENMAR Organic Food",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/logo/logo.png`,
        caption: "ENMAR Organic Logo",
      },
      sameAs: [
        "https://facebook.com/enmar.organic",
        "https://instagram.com/enmar.organic",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+8801700000000",
        contactType: "customer service",
        areaServed: "BD",
        availableLanguage: ["Bengali", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ENMAR",
      description: "100% Pure Organic Food & Grocery Store in Bangladesh",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/products?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      inLanguage: ["bn", "en"],
    },
    {
      "@type": "Store",
      "@id": `${siteUrl}/#store`,
      name: "ENMAR Organic Store",
      image: `${siteUrl}/assets/logo/logo.png`,
      priceRange: "৳৳",
      currenciesAccepted: "BDT",
      paymentAccepted: "Cash, bKash, Nagad, Rocket, Credit Card",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Dhaka",
        addressLocality: "Dhaka",
        addressCountry: "BD",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "22:00",
      },
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
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
