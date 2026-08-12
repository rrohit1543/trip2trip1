'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trip, LiveTelemetry } from '../../types';
import { loadGoogleMapsApi, createGoogleBusMarkerIcon } from '../../lib/googleMaps';
import { MapPin, Radio, Bus, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const LiveTripMapInner = dynamic(() => import('./LiveTripMapInner'), { ssr: false });
const GlobalFleetMapInner = dynamic(() => import('./GlobalFleetMapInner'), { ssr: false });

interface GoogleMapComponentProps {
  trips?: Trip[];
  selectedTrip?: Trip;
  telemetry?: LiveTelemetry;
  allTelemetry?: Record<string, LiveTelemetry>;
  height?: string;
  onSelectTrip?: (trip: Trip) => void;
}

export default function GoogleMapComponent({
  trips,
  selectedTrip,
  telemetry,
  allTelemetry,
  height = '480px',
  onSelectTrip,
}: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const googleMapObj = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Listen for Google Maps auth error event (gm_authFailure)
    const handleAuthFailure = () => {
      console.warn('Google Maps API auth notice. Switching to Interactive OSM/Leaflet Telemetry.');
      if (isMounted) setUseFallbackMap(true);
    };

    (window as any).gm_authFailure = handleAuthFailure;

    loadGoogleMapsApi()
      .then((maps) => {
        if (!isMounted || !mapRef.current) return;

        const defaultCenter = selectedTrip
          ? { lat: selectedTrip.pickupLocation.lat, lng: selectedTrip.pickupLocation.lng }
          : { lat: 28.6139, lng: 77.209 }; // Default Delhi

        const mapOptions = {
          center: defaultCenter,
          zoom: selectedTrip ? 8 : 6,
          mapTypeId: maps.MapTypeId.ROADMAP,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit.station.bus',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'on' }, { color: '#ef4444' }],
            },
          ],
        };

        const map = new maps.Map(mapRef.current, mapOptions);
        googleMapObj.current = map;
        setMapLoaded(true);
      })
      .catch((err) => {
        console.warn('Google Maps API fallback triggered:', err);
        if (isMounted) setUseFallbackMap(true);
      });

    return () => {
      isMounted = false;
      delete (window as any).gm_authFailure;
    };
  }, []);

  // If Google Maps API fails or requires custom Key, render Leaflet Telemetry Map
  if (useFallbackMap) {
    if (selectedTrip) {
      return <LiveTripMapInner trip={selectedTrip} telemetry={telemetry} height={height} />;
    }
    return (
      <GlobalFleetMapInner
        trips={trips || []}
        telemetry={allTelemetry || {}}
        height={height}
        onSelectTrip={onSelectTrip}
      />
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xl bg-white" style={{ height }}>
      {/* Map Header Status Indicator */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold text-slate-800">
        <Radio className="w-4 h-4 text-red-600 animate-pulse" />
        <span>Live Telemetry & GPS Route Map</span>
      </div>

      {/* Map Canvas Element */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
