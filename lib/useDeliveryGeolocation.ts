"use client";
// lib/useDeliveryGeolocation.ts - Ultra-Robust Mobile GPS Geolocation Engine

import { useState, useEffect, useRef } from "react";

interface GeolocationState {
  isSharing: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  lastUpdated: Date | null;
  permissionStatus: "granted" | "denied" | "prompt" | "unsupported";
}

export function useDeliveryGeolocation(activeOrdersCount: number) {
  const [geoState, setGeoState] = useState<GeolocationState>({
    isSharing: false,
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    lastUpdated: null,
    permissionStatus: "prompt",
  });

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Check initial permission
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoState((prev) => ({
        ...prev,
        permissionStatus: "unsupported",
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((res) => {
          setGeoState((prev) => ({ ...prev, permissionStatus: res.state as any }));
          res.onchange = () => {
            setGeoState((prev) => ({ ...prev, permissionStatus: res.state as any }));
          };
        })
        .catch(() => {});
    }
  }, []);

  const sendLocationUpdate = async (lat: number, lng: number, sharing: boolean) => {
    try {
      await fetch("/api/delivery/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat,
          lng,
          isSharing: sharing,
        }),
      });
      setGeoState((prev) => ({ ...prev, lastUpdated: new Date() }));
    } catch (e) {
      console.warn("[Delivery Geo Sync Error]:", e);
    }
  };

  const startWatchingPosition = () => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (watchPos) => {
        const { latitude, longitude, accuracy } = watchPos.coords;
        latestCoordsRef.current = { lat: latitude, lng: longitude };
        setGeoState((prev) => ({
          ...prev,
          latitude,
          longitude,
          accuracy,
          error: null,
          isSharing: true,
          permissionStatus: "granted",
        }));
      },
      (watchErr) => {
        console.warn("Geolocation watch error (non-fatal):", watchErr);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      }
    );

    // Heartbeat broadcast every 15 seconds
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (latestCoordsRef.current) {
        sendLocationUpdate(latestCoordsRef.current.lat, latestCoordsRef.current.lng, true);
      }
    }, 15000);
  };

  // Toggle Sharing
  const toggleLocationSharing = (enable?: boolean) => {
    const nextState = enable !== undefined ? enable : !geoState.isSharing;

    if (nextState) {
      if (!navigator.geolocation) {
        setGeoState((prev) => ({
          ...prev,
          error: "Geolocation not supported on this device.",
          isSharing: false,
        }));
        return;
      }

      setGeoState((prev) => ({ ...prev, error: null, isSharing: true }));

      // 1. First attempt: Quick progressive fix with generous timeout (25s) and cached fallback
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          latestCoordsRef.current = { lat: latitude, lng: longitude };
          setGeoState({
            isSharing: true,
            latitude,
            longitude,
            accuracy,
            error: null,
            lastUpdated: new Date(),
            permissionStatus: "granted",
          });
          sendLocationUpdate(latitude, longitude, true);
          startWatchingPosition();
        },
        (firstErr) => {
          console.warn("First high-accuracy GPS attempt timed out. Falling back to standard cell/wifi location...", firstErr);

          // 2. Fallback attempt: Standard accuracy (instant cell/wifi triangulation)
          navigator.geolocation.getCurrentPosition(
            (fallbackPos) => {
              const { latitude, longitude, accuracy } = fallbackPos.coords;
              latestCoordsRef.current = { lat: latitude, lng: longitude };
              setGeoState({
                isSharing: true,
                latitude,
                longitude,
                accuracy,
                error: null,
                lastUpdated: new Date(),
                permissionStatus: "granted",
              });
              sendLocationUpdate(latitude, longitude, true);
              startWatchingPosition();
            },
            (finalErr) => {
              let msg = "Could not obtain phone location.";
              if (finalErr.code === 1) {
                msg = "Location permission denied. Please allow GPS location access in your phone/browser settings.";
              } else if (finalErr.code === 2) {
                msg = "GPS position unavailable. Please turn on device Location / GPS in phone settings.";
              } else if (finalErr.code === 3) {
                msg = "Location request timed out. Please check if GPS / Location is turned ON in your phone.";
              }
              setGeoState((prev) => ({
                ...prev,
                isSharing: false,
                error: msg,
                permissionStatus: finalErr.code === 1 ? "denied" : "prompt",
              }));
            },
            { enableHighAccuracy: false, timeout: 25000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }
      );
    } else {
      // Turn off
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setGeoState((prev) => ({ ...prev, isSharing: false }));
      if (geoState.latitude && geoState.longitude) {
        sendLocationUpdate(geoState.latitude, geoState.longitude, false);
      }
    }
  };

  // Auto-stop location sharing if no active deliveries
  useEffect(() => {
    if (activeOrdersCount === 0 && geoState.isSharing) {
      toggleLocationSharing(false);
    }
  }, [activeOrdersCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    ...geoState,
    toggleLocationSharing,
  };
}
