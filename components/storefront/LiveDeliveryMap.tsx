"use client";

import { useEffect, useRef, useState } from "react";
import { Bike, MapPin, Phone, Radio, Navigation, Clock, ShieldCheck } from "lucide-react";
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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default or Rider Coordinates
    const initialLat = currentLat || 23.8103;
    const initialLng = currentLng || 90.4125;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Create Custom Animated Rider Icon using DivIcon
    const riderIcon = L.divIcon({
      className: "custom-rider-icon",
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #14421a; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([initialLat, initialLng]);
      riderMarkerRef.current.setIcon(riderIcon);
    } else {
      const marker = L.marker([initialLat, initialLng], { icon: riderIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 2px;">
          <strong style="color: #14421a; font-size: 13px;">🛵 ${riderName}</strong>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">${vehicleType} • Live Delivery</div>
        </div>
      `);
      riderMarkerRef.current = marker;
    }

    // Pan map smoothly to rider
    map.panTo([initialLat, initialLng], { animate: true, duration: 1 });
  }, [currentLat, currentLng, riderName, vehicleType]);

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
                Live Rider Tracking
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
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <a
            href={`tel:${riderPhone}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-paper text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Rider</span>
          </a>
        </div>
      </div>

      {/* Interactive Leaflet Map Viewport */}
      <div className="relative w-full h-72 sm:h-80 bg-stone-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Coordinates Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-line shadow-sm text-[11px] font-medium text-ink flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-forest animate-bounce" />
          <span>Rider GPS: {currentLat?.toFixed(4)}, {currentLng?.toFixed(4)}</span>
          {lastUpdated && (
            <span className="text-ink-muted text-[10px] hidden sm:inline">
              ({new Date(lastUpdated).toLocaleTimeString()})
            </span>
          )}
        </div>
      </div>

      {/* Destination Footer */}
      {destinationAddress && (
        <div className="p-3.5 bg-bg border-t border-line text-xs flex items-center gap-2 text-ink-soft">
          <MapPin className="w-4 h-4 text-earth shrink-0" />
          <span className="truncate">
            Delivering to: <strong className="text-ink">{destinationAddress}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
