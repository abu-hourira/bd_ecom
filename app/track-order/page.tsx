// app/track-order/page.tsx - Redirector & Universal Route for /track-order
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function TrackOrderRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || searchParams.get("trackingId");

  useEffect(() => {
    if (id) {
      router.replace(`/track/${encodeURIComponent(id.trim().toUpperCase())}`);
    } else {
      router.replace("/track");
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-forest animate-spin" />
        <p className="text-sm font-semibold text-ink-soft">অর্ডার ট্র্যাকিং পেজে নিয়ে যাওয়া হচ্ছে...</p>
      </div>
    </div>
  );
}

export default function TrackOrderRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-forest animate-spin" />
        </div>
      }
    >
      <TrackOrderRedirectContent />
    </Suspense>
  );
}
