"use client";
// components/storefront/DynamicFavicon.tsx - Real-time Dynamic Favicon Updater from Site Settings

import { useEffect } from "react";
import { useStorefront } from "@/context/StorefrontContext";
import { getSafeImageUrl } from "@/lib/utils";

export default function DynamicFavicon() {
  const { settings } = useStorefront();
  const favicon = settings?.siteFavicon || settings?.siteLogo || "";

  useEffect(() => {
    if (!favicon || typeof document === "undefined") return;

    const safeUrl = getSafeImageUrl(favicon);

    // Update or create standard favicon link
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = safeUrl;

    // Update shortcut icon
    let shortcutLink = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement | null;
    if (!shortcutLink) {
      shortcutLink = document.createElement("link");
      shortcutLink.rel = "shortcut icon";
      document.head.appendChild(shortcutLink);
    }
    shortcutLink.href = safeUrl;

    // Update apple touch icon
    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.head.appendChild(appleLink);
    }
    appleLink.href = safeUrl;
  }, [favicon]);

  return null;
}
