"use client";
// components/storefront/ScrollToTop.tsx - Smooth 1-click back to top button

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 p-3 rounded-full bg-forest hover:bg-forest-deep text-white shadow-premium border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group animate-in fade-in zoom-in-75"
      title="উপরে যান"
    >
      <ArrowUp className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}
