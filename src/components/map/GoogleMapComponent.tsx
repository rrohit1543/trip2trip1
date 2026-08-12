'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trip, LiveTelemetry } from '../../types';
import { loadGoogleMapsApi, createGoogleBusMarkerIcon } from '../../lib/googleMaps';
import { MapPin, Radio, Bus, AlertCircle } from 'lucide-react';

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const googleMapObj = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

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
        console.warn('Google Maps API load notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Markers & Polyline on Google Map
  useEffect(() => {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (!mapLoaded || !googleMapObj.current || !win || !win.google || !win.google.maps) return;

    const maps = win.google.maps;
    const map = googleMapObj.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const bounds = new maps.LatLngBounds();

    // Single Trip Mode
    if (selectedTrip) {
      // 1. Departure Marker
      const depMarker = new maps.Marker({
        position: { lat: selectedTrip.pickupLocation.lat, lng: selectedTrip.pickupLocation.lng },
        map,
        title: selectedTrip.departureCity,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });
      markersRef.current.push(depMarker);
      bounds.extend(depMarker.getPosition());

      // 2. Destination Marker
      const destPoint = selectedTrip.dropPoints[selectedTrip.dropPoints.length - 1] || selectedTrip.pickupLocation;
      const destMarker = new maps.Marker({
        position: { lat: destPoint.lat, lng: destPoint.lng },
        map,
        title: selectedTrip.destinationCity,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
      });
      markersRef.current.push(destMarker);
      bounds.extend(destMarker.getPosition());

      // 3. Route Polyline
      const pathCoordinates = selectedTrip.routePath.map(([lat, lng]) => ({ lat, lng }));
      const polyline = new maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#ef4444',
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });
      polyline.setMap(map);
      polylineRef.current = polyline;

      // 4. Live Bus Telemetry Marker
      if (telemetry && selectedTrip.status === 'live') {
        const livePos = { lat: telemetry.currentLat, lng: telemetry.currentLng };
        const busMarker = new maps.Marker({
          position: livePos,
          map,
          title: `LIVE: ${selectedTrip.name}`,
          icon: {
            url: createGoogleBusMarkerIcon('#ef4444'),
            scaledSize: new maps.Size(40, 40),
          },
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: sans-serif;">
              <strong style="color: #ef4444; font-size: 13px;">🚌 ${selectedTrip.name}</strong><br/>
              <span style="font-size: 11px; color: #333;">Speed: <b>${telemetry.speedKmH} km/h</b></span><br/>
              <span style="font-size: 11px; color: #666;">Next Stop: ${telemetry.nextCheckpointName}</span>
            </div>
          `,
        });

        busMarker.addListener('click', () => {
          infoWindow.open(map, busMarker);
        });

        markersRef.current.push(busMarker);
        bounds.extend(busMarker.getPosition());
      }

      map.fitBounds(bounds);
    } else if (trips && trips.length > 0) {
      // Multi-Trip Fleet Radar Mode
      trips.forEach((t) => {
        const telem = allTelemetry ? allTelemetry[t.id] : undefined;
        const pos = telem
          ? { lat: telem.currentLat, lng: telem.currentLng }
          : { lat: t.pickupLocation.lat, lng: t.pickupLocation.lng };

        const marker = new maps.Marker({
          position: pos,
          map,
          title: t.name,
          icon: {
            url: createGoogleBusMarkerIcon(t.status === 'live' ? '#ef4444' : '#0f172a'),
            scaledSize: new maps.Size(36, 36),
          },
        });

        marker.addListener('click', () => {
          if (onSelectTrip) onSelectTrip(t);
        });

        markersRef.current.push(marker);
        bounds.extend(marker.getPosition());
      });

      map.fitBounds(bounds);
    }
  }, [mapLoaded, selectedTrip, telemetry, trips, allTelemetry]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xl bg-white" style={{ height }}>
      {/* Map Header Status Indicator */}
      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold text-slate-800">
        <Radio className="w-4 h-4 text-red-600 animate-pulse" />
        <span>Google Maps API Live Telemetry Enabled</span>
      </div>

      {/* Map Canvas Element */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
