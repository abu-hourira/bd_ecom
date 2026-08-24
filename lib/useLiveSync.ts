// lib/useLiveSync.ts
"use client";

import { useEffect, useRef } from "react";

interface LiveSyncOptions {
  interval?: number; // In milliseconds, default 5000 (5s)
  enabled?: boolean; // Default true
  syncOnFocus?: boolean; // Default true
}

/**
 * Lightweight, unified polling hook for bidirectional real-time sync across
 * customer order tracking, admin dashboard, order queues, return requests, and inventory.
 */
export function useLiveSync(
  syncCallback: () => void | Promise<void>,
  options: LiveSyncOptions = {}
) {
  const { interval = 5000, enabled = true, syncOnFocus = true } = options;
  const isSyncingRef = useRef(false);
  const callbackRef = useRef(syncCallback);

  useEffect(() => {
    callbackRef.current = syncCallback;
  }, [syncCallback]);

  useEffect(() => {
    if (!enabled) return;

    const executeSync = async () => {
      if (isSyncingRef.current) return;
      if (document.hidden) return; // Skip polling when tab is inactive to save battery/bandwidth

      isSyncingRef.current = true;
      try {
        await callbackRef.current();
      } catch (err) {
        console.debug("[LiveSync Silent Catch]:", err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Polling interval
    const timerId = setInterval(executeSync, interval);

    // Sync immediately on tab focus
    const handleVisibilityChange = () => {
      if (!document.hidden && syncOnFocus) {
        executeSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      clearInterval(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [interval, enabled, syncOnFocus]);
}
