'use client';

import React, { useState } from 'react';
import { Trip } from '../../types';
import { generatePdfBrochure } from '../../lib/pdfBrochure';
import { X, Calendar, CheckCircle2, XCircle, MapPin, Bus, Hotel, UserCheck, ShieldAlert, FileText, Star, Phone, Download } from 'lucide-react';

interface TripDetailModalProps {
  trip: Trip | null;
  onClose: () => void;
  onBookSeats: (trip: Trip) => void;
}

export default function TripDetailModal({ trip, onClose, onBookSeats }: TripDetailModalProps) {
  if (!trip) return null;

  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'stay_vehicle' | 'policy'>('itinerary');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-200">
        {/* Header Image Banner */}
        <div className="relative h-64 w-full bg-black shrink-0">
          <img
            src={trip.images[0] || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'}
            alt={trip.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/80 hover:bg-black text-neutral-300 hover:text-white p-2.5 rounded-full border border-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-600/20 text-red-500 border border-red-600/40 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {trip.category}
                </span>
                <span className="bg-black/80 text-neutral-300 border border-neutral-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {trip.difficultyLevel} Trek/Tour
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">{trip.name}</h2>
              <p className="text-xs text-neutral-300 flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{trip.departureCity} &rarr; {trip.destinationCity}</span>
                <span>•</span>
                <span>{trip.durationDays} Days / {trip.durationNights} Nights</span>
              </p>
            </div>

            <div className="bg-black/90 border border-red-600 p-3 rounded-2xl text-right">
              <div className="text-2xl font-black text-white">
                ₹{trip.pricePerPerson.toLocaleString('en-IN')}
                <span className="text-xs text-neutral-400 font-normal"> / person</span>
              </div>
              <div className="text-[11px] text-red-500 font-bold">{trip.availableSeats} seats remaining</div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-950 px-6 py-3 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'itinerary' ? 'bg-red-600 text-white' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Day-wise Itinerary
          </button>
          <button
            onClick={() => setActiveTab('inclusions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'inclusions' ? 'bg-red-600 text-white' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Inclusions & Exclusions
          </button>
          <button
            onClick={() => setActiveTab('stay_vehicle')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'stay_vehicle' ? 'bg-red-600 text-white' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Vehicle, Hotel & Guide
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'policy' ? 'bg-red-600 text-white' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Policies & Documents
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-black text-neutral-900 dark:text-white">
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                Day-by-Day Tour Itinerary
              </h3>
              <div className="space-y-3">
                {trip.itinerary.map((day) => (
                  <div key={day.dayNumber} className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-red-600/20 text-red-600 dark:text-red-500 border border-red-600/40 text-xs font-bold px-3 py-1 rounded-lg">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Meals: {day.meals}</span>
                    </div>
                    <h4 className="text-base font-bold text-neutral-900 dark:text-white">{day.title}</h4>
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-neutral-700 dark:text-neutral-300">
                      {day.activities.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-900 pt-2 mt-2">
                      Stay: <strong className="text-neutral-900 dark:text-white">{day.stayDetails}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inclusions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl space-y-3">
                <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-500" /> What's Included
                </h4>
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {trip.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 border border-red-600/30 p-5 rounded-2xl space-y-3">
                <h4 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" /> What's Excluded
                </h4>
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {trip.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'stay_vehicle' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                  <Bus className="w-5 h-5" /> Vehicle Specs
                </div>
                <h5 className="text-sm font-bold text-neutral-900 dark:text-white">{trip.vehicle.type}</h5>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Reg: {trip.vehicle.regNumber}</p>
                <div className="text-xs text-neutral-700 dark:text-neutral-300 pt-2 border-t border-neutral-200 dark:border-neutral-900">
                  <strong className="text-neutral-500 block text-[10px] uppercase">Amenities:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {trip.vehicle.amenities.map((am, i) => (
                      <span key={i} className="bg-white dark:bg-black px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300">
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 pt-2">
                  Driver: <strong className="text-neutral-900 dark:text-white">{trip.vehicle.driverName}</strong> ({trip.vehicle.driverPhone})
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm">
                  <Hotel className="w-5 h-5 text-red-500" /> Accommodations
                </div>
                <h5 className="text-sm font-bold text-neutral-900 dark:text-white">{trip.hotel.name}</h5>
                <div className="flex items-center gap-1 text-xs text-neutral-900 dark:text-white">
                  {Array.from({ length: trip.hotel.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                  ))}
                  <span className="text-neutral-500 text-[11px] ml-1">{trip.hotel.stars}-Star Hotel</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{trip.hotel.location}</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                  <UserCheck className="w-5 h-5" /> Certified Tour Guide
                </div>
                <div className="flex items-center gap-3">
                  <img src={trip.tourGuide.photo} alt={trip.tourGuide.name} className="w-10 h-10 rounded-full object-cover border border-red-600" />
                  <div>
                    <h5 className="text-sm font-bold text-neutral-900 dark:text-white">{trip.tourGuide.name}</h5>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{trip.tourGuide.languages.join(', ')}</p>
                  </div>
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300 pt-2 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-900">
                  <span>Rating: <strong className="text-neutral-900 dark:text-white">{trip.tourGuide.rating} ★</strong></span>
                  <span className="flex items-center gap-1 text-neutral-500"><Phone className="w-3 h-3 text-red-500" /> {trip.tourGuide.phone}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-4 rounded-2xl space-y-2">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" /> Cancellation Policy
                </h4>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{trip.cancellationPolicy}</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-4 rounded-2xl space-y-2">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" /> Mandatory Documents Required
                </h4>
                <ul className="list-disc pl-4 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                  {trip.requiredDocuments.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-100 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={() => generatePdfBrochure(trip)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-red-500 font-bold text-xs flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-red-500" />
            <span>Download Package Brochure (PDF)</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-900 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookSeats(trip);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-red-600/30 transition"
            >
              Select Seats & Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
