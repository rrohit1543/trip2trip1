'use client';

import React from 'react';
import { Trip, LiveTelemetry } from '../../types';
import { Star, Bus, MapPin, Users, ShieldAlert, ArrowRight, Radio, Gauge, Calendar, ChevronRight } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  telemetry?: LiveTelemetry;
  onTrackLive: (trip: Trip) => void;
  onViewDetails: (trip: Trip) => void;
  onBookSeats: (trip: Trip) => void;
}

export default function TripCard({ trip, telemetry, onTrackLive, onViewDetails, onBookSeats }: TripCardProps) {
  const isLive = trip.status === 'live';

  return (
    <div className="relative group bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-red-600 dark:hover:border-red-600 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Banner */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={trip.images[0] || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full backdrop-blur shadow-lg shadow-red-600/30">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>LIVE ON ROAD</span>
              {telemetry && <span className="ml-1 text-white font-mono">({telemetry.speedKmH} km/h)</span>}
            </div>
          ) : (
            <div className="bg-black/80 border border-neutral-700 text-white font-bold text-xs px-3 py-1 rounded-full backdrop-blur">
              UPCOMING DEPARTURE
            </div>
          )}

          <div className="bg-black/80 border border-neutral-700 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur">
            {trip.category}
          </div>
        </div>

        {/* Price & Rating Badge */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
          <div className="bg-white/95 text-slate-900 font-black text-lg px-3 py-1 rounded-xl shadow-lg border border-neutral-200">
            ₹{trip.pricePerPerson.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500 font-medium">/ person</span>
          </div>
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur px-2.5 py-0.5 rounded-lg border border-neutral-800 text-white text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            <span>{trip.operatorRating}</span>
            <span className="text-neutral-400 text-[10px]">({trip.operatorReviewsCount})</span>
          </div>
        </div>

        {/* Route Header */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold bg-black/70 px-3 py-1 rounded-xl backdrop-blur">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>{trip.departureCity} &rarr; {trip.destinationCity}</span>
          </div>
          <span className="text-xs font-bold bg-red-600/80 px-2.5 py-1 rounded-xl">
            {trip.durationDays}D / {trip.durationNights}N
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] text-red-600 dark:text-red-500 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{trip.operatorName}</span>
            <span className="text-slate-500 dark:text-neutral-400 font-normal">{trip.difficultyLevel} Tour</span>
          </div>

          <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-1">
            {trip.name}
          </h3>

          <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1 line-clamp-2">
            Inclusions: {trip.inclusions.slice(0, 3).join(', ')}...
          </p>
        </div>

        {/* Live Telemetry Info Box if Live */}
        {isLive && telemetry ? (
          <div className="bg-red-50 dark:bg-neutral-900 border border-red-200 dark:border-red-900/50 p-3 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Next: {telemetry.nextCheckpointName}
              </span>
              <span className="text-slate-700 dark:text-neutral-300 font-mono text-[11px]">{telemetry.speedKmH} km/h</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-neutral-400 flex items-center justify-between font-mono">
              <span>ETA: {telemetry.etaNextCheckpoint}</span>
              <span className="text-red-600 dark:text-red-500 font-bold">Live GPS Active</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-bold uppercase block">Vehicle</span>
              <span className="text-slate-900 dark:text-neutral-200 font-bold truncate block">{trip.vehicle.type}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-bold uppercase block">Departure</span>
              <span className="text-slate-900 dark:text-neutral-200 font-bold truncate block">
                {new Date(trip.departureDateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        )}

        {/* Seat Availability Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-neutral-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-red-500" /> Seats Left:
            </span>
            <span className="text-red-600 dark:text-red-500 font-mono font-black">
              {trip.availableSeats} / {trip.totalSeats}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-200 dark:bg-neutral-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-500"
              style={{ width: `${((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-900">
          <button
            onClick={() => onViewDetails(trip)}
            className="w-1/2 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 font-bold text-xs transition"
          >
            View Details
          </button>

          <button
            onClick={() => onBookSeats(trip)}
            className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5"
          >
            <span>Book Seats</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
