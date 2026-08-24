"use client";

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
      setGeoState((prev) => ({ ...prev, permissionStatus: "unsupported", error: "Geolocation is not supported by your browser" }));
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" as PermissionName }).then((res) => {
        setGeoState((prev) => ({ ...prev, permissionStatus: res.state as any }));
        res.onchange = () => {
          setGeoState((prev) => ({ ...prev, permissionStatus: res.state as any }));
        };
      }).catch(() => {});
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

  // Toggle Sharing
  const toggleLocationSharing = (enable?: boolean) => {
    const nextState = enable !== undefined ? enable : !geoState.isSharing;

    if (nextState) {
      if (!navigator.geolocation) {
        setGeoState((prev) => ({ ...prev, error: "Geolocation not supported", isSharing: false }));
        return;
      }

      // Request current location first
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

          // Start continuous watching
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }
          watchIdRef.current = navigator.geolocation.watchPosition(
            (watchPos) => {
              latestCoordsRef.current = {
                lat: watchPos.coords.latitude,
                lng: watchPos.coords.longitude,
              };
              setGeoState((prev) => ({
                ...prev,
                latitude: watchPos.coords.latitude,
                longitude: watchPos.coords.longitude,
                accuracy: watchPos.coords.accuracy,
                error: null,
              }));
            },
            (err) => {
              console.warn("Geolocation watch error:", err);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000,
            }
          );

          // Heartbeat broadcast every 15 seconds
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            if (latestCoordsRef.current) {
              sendLocationUpdate(
                latestCoordsRef.current.lat,
                latestCoordsRef.current.lng,
                true
              );
            }
          }, 15000);
        },
        (err) => {
          let msg = "Could not obtain location.";
          if (err.code === 1) msg = "Location permission was denied. Please allow GPS access in browser settings.";
          if (err.code === 2) msg = "GPS position unavailable. Please enable device location.";
          if (err.code === 3) msg = "Location request timed out.";
          setGeoState((prev) => ({
            ...prev,
            isSharing: false,
            error: msg,
            permissionStatus: "denied",
          }));
        },
        { enableHighAccuracy: true, timeout: 10000 }
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
