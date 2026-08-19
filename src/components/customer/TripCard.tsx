'use client';

import React from 'react';
import { Trip, LiveTelemetry } from '../../types';
import {
  Star,
  Bus,
  MapPin,
  Users,
  ShieldAlert,
  ArrowRight,
  Radio,
  Gauge,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Hotel,
  UserCheck,
  Clock,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  telemetry?: LiveTelemetry;
  onTrackLive: (trip: Trip) => void;
  onViewDetails: (trip: Trip) => void;
  onBookSeats: (trip: Trip) => void;
}

export default function TripCard({ trip, telemetry, onTrackLive, onViewDetails, onBookSeats }: TripCardProps) {
  const isLive = trip.status === 'live';
  const isAdminPackage = trip.operatorId === 'usr_operator_1' || trip.operatorName?.toLowerCase().includes('admin') || trip.operatorName?.toLowerCase().includes('expeditions');

  // Format departure datetime cleanly
  const formatDeparture = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="relative group bg-white border-2 border-slate-200 hover:border-red-600 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-slate-900 font-sans">
      {/* Top Image Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
        <img
          src={trip.images[0] || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-red-600 text-white font-black text-[11px] px-3 py-1 rounded-full shadow-lg shadow-red-600/30">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>LIVE ON ROAD</span>
              {telemetry && <span className="ml-1 text-white font-mono">({telemetry.speedKmH} km/h)</span>}
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-700 text-white font-extrabold text-[11px] px-3 py-1 rounded-full backdrop-blur">
              UPCOMING DEPARTURE
            </div>
          )}

          <div className="bg-slate-900/90 border border-slate-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur">
            {trip.category}
          </div>

          {isAdminPackage && (
            <div className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 fill-slate-950 text-amber-500" /> Admin Verified
            </div>
          )}
        </div>

        {/* Price & Rating Badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          <div className="bg-white text-slate-900 font-black text-lg px-3 py-1 rounded-xl shadow-xl border border-slate-200">
            ₹{trip.pricePerPerson.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500 font-medium">/ person</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur px-2.5 py-0.5 rounded-lg border border-slate-800 text-white text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            <span>{trip.operatorRating || 4.9}</span>
            <span className="text-neutral-400 text-[10px]">({trip.operatorReviewsCount || 120})</span>
          </div>
        </div>

        {/* Route & Duration Overlay Footer */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-1.5 text-xs font-black bg-slate-900/80 px-3 py-1 rounded-xl backdrop-blur border border-white/20">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>{trip.departureCity} &rarr; {trip.destinationCity}</span>
          </div>
          <span className="text-xs font-extrabold bg-red-600/90 px-3 py-1 rounded-xl shadow">
            {trip.durationDays} Days / {trip.durationNights} Nights
          </span>
        </div>
      </div>

      {/* Card Content Body - RICH TRIP DETAILS */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-white text-slate-900">
        <div className="space-y-3">
          {/* Operator Agency & Level */}
          <div className="text-[11px] text-red-600 font-bold uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Bus className="w-3.5 h-3.5" /> {trip.operatorName}
            </span>
            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
              {trip.difficultyLevel || 'Easy'} Tour
            </span>
          </div>

          {/* Trip Title */}
          <h3 className="text-base font-black text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
            {trip.name}
          </h3>

          {/* Departure Schedule & Pickup Landmark */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-red-600" /> Departure:
              </span>
              <span className="font-mono text-red-600">{formatDeparture(trip.departureDateTime)}</span>
            </div>
            {trip.pickupLocation?.name && (
              <div className="flex items-start gap-1 text-[11px] text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span className="truncate">Boarding: <strong>{trip.pickupLocation.name}</strong></span>
              </div>
            )}
          </div>

          {/* Vehicle & Hotel Specs Box */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <Bus className="w-3 h-3 text-red-600" /> Vehicle Fleet
              </span>
              <span className="text-slate-900 font-bold text-[11px] truncate block mt-0.5">
                {trip.vehicle?.type || 'Volvo AC Sleeper'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <Hotel className="w-3 h-3 text-red-600" /> Hotel Stay
              </span>
              <span className="text-slate-900 font-bold text-[11px] truncate block mt-0.5">
                {trip.hotel?.name || '4-Star Resort Stay'} ({trip.hotel?.stars || 4}★)
              </span>
            </div>
          </div>

          {/* Tour Guide & Driver Info */}
          {(trip.tourGuide?.name || trip.vehicle?.driverName) && (
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium bg-slate-100/70 p-2 rounded-xl border border-slate-200/80">
              {trip.tourGuide?.name && (
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-red-600" /> Guide: <strong>{trip.tourGuide.name}</strong>
                </span>
              )}
              {trip.vehicle?.driverName && (
                <span className="text-[10px] font-mono text-slate-500">Driver: {trip.vehicle.driverName}</span>
              )}
            </div>
          )}

          {/* Inclusions Highlights */}
          {trip.inclusions && trip.inclusions.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Package Inclusions:</span>
              <div className="flex flex-wrap gap-1">
                {trip.inclusions.slice(0, 3).map((inc, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {inc}
                  </span>
                ))}
                {trip.inclusions.length > 3 && (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    +{trip.inclusions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Live Telemetry Info Box if Live */}
          {isLive && telemetry && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-red-600 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> Next Stop: {telemetry.nextCheckpointName}
                </span>
                <span className="text-slate-700 font-mono text-[11px]">{telemetry.speedKmH} km/h</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between font-mono">
                <span>ETA: {telemetry.etaNextCheckpoint}</span>
                <span className="text-red-600 font-bold">Live GPS Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Seat Availability Bar */}
        <div className="space-y-1 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-red-500" /> Seats Left:
            </span>
            <span className="text-red-600 font-mono font-black">
              {trip.availableSeats} / {trip.totalSeats} Available
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, ((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onViewDetails(trip)}
            className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Full Details
          </button>

          <button
            onClick={() => onBookSeats(trip)}
            className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Book Seats</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
