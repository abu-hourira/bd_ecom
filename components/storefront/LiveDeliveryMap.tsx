"use client";

import { useEffect, useRef, useState } from "react";
import { Bike, MapPin, Phone, Radio, Navigation, Clock, ShieldCheck, Home } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveDeliveryMapProps {
  riderName: string;
  riderPhone: string;
  vehicleType: string;
  currentLat: number;
  currentLng: number;
  lastUpdated?: string | null;
  destinationAddress?: string;
}

export default function LiveDeliveryMap({
  riderName,
  riderPhone,
  vehicleType,
  currentLat,
  currentLng,
  lastUpdated,
  destinationAddress,
}: LiveDeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(null);
  const [distanceKm, setDistanceKm] = useState<string | null>(null);

  // 1. Geocode destination address or fallback to near rider coordinates
  useEffect(() => {
    let isMounted = true;

    async function geocodeDestination() {
      if (!destinationAddress) return;

      try {
        const query = encodeURIComponent(`${destinationAddress}, Bangladesh`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
        );
        const data = await res.json();

        if (isMounted && data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCustomerCoords([lat, lon]);
          return;
        }
      } catch (e) {
        console.warn("Destination geocoding fallback:", e);
      }

      // Sensible default offset near rider/Dhaka if geocoding returns nothing
      if (isMounted) {
        const fallbackLat = currentLat ? currentLat + 0.012 : 23.8203;
        const fallbackLng = currentLng ? currentLng + 0.015 : 90.4225;
        setCustomerCoords([fallbackLat, fallbackLng]);
      }
    }

    geocodeDestination();

    return () => {
      isMounted = false;
    };
  }, [destinationAddress, currentLat, currentLng]);

  // 2. Initialize and Update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const riderLat = currentLat || 23.8103;
    const riderLng = currentLng || 90.4125;

    // Initialize Map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [riderLat, riderLng],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Fix gray tiles by invalidating size immediately and after layout render
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 800);
    }

    const map = mapInstanceRef.current;
    map.invalidateSize();

    // 3. Custom Rider Icon (Pulsing Green Bike)
    const riderIcon = L.divIcon({
      className: "custom-rider-icon",
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #14421a; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <span style="font-size: 18px;">🛵</span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([riderLat, riderLng]);
    } else {
      const riderMarker = L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map);
      riderMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; text-align: center;">
          <strong style="color: #14421a; font-size: 13px;">🛵 ${riderName}</strong>
          <div style="font-size: 11px; color: #555; margin-top: 2px;">${vehicleType} • লাইভ ডেলিভারি রুট</div>
        </div>
      `);
      riderMarkerRef.current = riderMarker;
    }

    // 4. Custom Customer Destination Icon (Red Home Pin)
    if (customerCoords) {
      const customerIcon = L.divIcon({
        className: "custom-customer-icon",
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #dc2626; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
              <span style="font-size: 18px;">🏠</span>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (customerMarkerRef.current) {
        customerMarkerRef.current.setLatLng(customerCoords);
      } else {
        const custMarker = L.marker(customerCoords, { icon: customerIcon }).addTo(map);
        custMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; text-align: center;">
            <strong style="color: #dc2626; font-size: 13px;">📍 আপনার ডেলিভারি ঠিকানা</strong>
            <div style="font-size: 11px; color: #444; margin-top: 2px;">${destinationAddress || "Customer Destination"}</div>
          </div>
        `);
        customerMarkerRef.current = custMarker;
      }

      // 5. Draw dashed polyline connecting Rider to Customer
      const routePoints: [number, number][] = [
        [riderLat, riderLng],
        customerCoords,
      ];

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(routePoints);
      } else {
        routeLineRef.current = L.polyline(routePoints, {
          color: "#16a34a",
          weight: 4,
          dashArray: "8, 8",
          opacity: 0.85,
        }).addTo(map);
      }

      // Calculate approximate Haversine distance
      const rad = Math.PI / 180;
      const dLat = (customerCoords[0] - riderLat) * rad;
      const dLon = (customerCoords[1] - riderLng) * rad;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(riderLat * rad) *
          Math.cos(customerCoords[0] * rad) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = 6371 * c; // Earth radius in KM
      setDistanceKm(d.toFixed(1));

      // Auto-fit bounds to show both Rider and Customer in view!
      const bounds = L.latLngBounds([
        [riderLat, riderLng],
        customerCoords,
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else {
      map.panTo([riderLat, riderLng], { animate: true });
    }
  }, [currentLat, currentLng, riderName, vehicleType, customerCoords, destinationAddress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-paper rounded-3xl border border-emerald-300 shadow-premium overflow-hidden text-ink">
      {/* Live Map Header */}
      <div className="p-4 sm:p-5 bg-emerald-50/90 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Live Delivery Route
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-base font-bold text-forest-deep mt-0.5 flex items-center gap-2">
              <span>{riderName}</span>
              <span className="text-xs font-normal text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                {vehicleType}
              </span>
              {distanceKm && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                  ~{distanceKm} কি.মি. দূরত্বে
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <a
            href={`tel:${riderPhone}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Rider</span>
          </a>
        </div>
      </div>

      {/* Interactive Leaflet Map Viewport */}
      <div className="relative w-full h-80 sm:h-96 bg-stone-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Route Legend & Coordinates */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200 shadow-md text-[11px] font-medium text-stone-800 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>রাইডার (🛵)</span>
          </div>
          <span className="text-stone-300">|</span>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>আপনার ঠিকানা (🏠)</span>
          </div>
          {lastUpdated && (
            <span className="text-stone-400 text-[10px] hidden sm:inline">
              ({new Date(lastUpdated).toLocaleTimeString()})
            </span>
          )}
        </div>
      </div>

      {/* Destination Footer */}
      {destinationAddress && (
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 text-xs flex items-center justify-between text-stone-700">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span className="truncate">
              ডেলিভারি গন্তব্য: <strong className="text-stone-900">{destinationAddress}</strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold shrink-0 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            রুট একটিভ
          </span>
        </div>
      )}
    </div>
  );
}
