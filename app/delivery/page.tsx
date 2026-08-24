"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/delivery/dashboard");
  }, [router]);

  return null;
}
