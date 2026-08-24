"use client";
// components/ui/BrandLoader.tsx - Ultra-Premium Animated Brand Logo Loader

import { useState, useEffect } from "react";
import Image from "next/image";
import { Store, Leaf } from "lucide-react";
import { getSafeImageUrl } from "@/lib/utils";

interface BrandLoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function BrandLoader({
  fullScreen = false,
  message,
  size = "md",
}: BrandLoaderProps) {
  const [logo, setLogo] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");

  useEffect(() => {
    fetch("/api/storefront/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          if (data.settings.siteLogo) setLogo(data.settings.siteLogo);
          if (data.settings.brandName) setBrandName(data.settings.brandName);
        }
      })
      .catch(() => {});
  }, []);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16 sm:w-20 sm:h-20",
    lg: "w-20 h-20 sm:w-24 sm:h-24",
  };

  const container = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-300">
      {/* Animated Glowing Logo Outer Container */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Backlight Glow */}
        <div className="absolute inset-0 rounded-3xl bg-forest/20 blur-xl animate-ping opacity-60 scale-125" />
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-500 to-forest animate-spin-slow opacity-80 blur-xs" />

        {/* Main Logo Box */}
        <div
          className={`relative ${sizeClasses[size]} rounded-2xl sm:rounded-3xl bg-white p-2 shadow-2xl flex items-center justify-center border-2 border-amber-400/40 z-10 animate-bounce-slow`}
        >
          {logo ? (
            <div className="relative w-full h-full">
              <Image
                src={getSafeImageUrl(logo)}
                alt={brandName || "Logo"}
                fill
                className="object-contain p-1"
                sizes="80px"
                priority
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-xl bg-[#143520] text-amber-400 flex items-center justify-center shadow-inner">
              <Leaf className="w-8 h-8 animate-pulse text-amber-400" />
            </div>
          )}
        </div>
      </div>

      {/* Pulsing Shimmer Text */}
      <div className="text-center space-y-1">
        {brandName && (
          <h3 className="font-display font-bold text-sm sm:text-base text-stone-900 tracking-tight">
            {brandName}
          </h3>
        )}
        <div className="flex items-center justify-center gap-1.5 text-xs text-forest font-semibold">
          <span>{message || "লোডিং হচ্ছে..."}</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md flex items-center justify-center">
        {container}
      </div>
    );
  }

  return container;
}
