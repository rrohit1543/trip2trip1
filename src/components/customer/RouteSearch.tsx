'use client';

import React, { useState } from 'react';
import { Search, MapPin, Radio, Clock, ShieldAlert, Flame, Filter, Calendar, Users, Heart } from 'lucide-react';
import { RouteSearchResult } from '../../types';

interface RouteSearchProps {
  onSearch: (departure: string, destination: string, category?: string) => void;
  searchResult: RouteSearchResult;
}

export default function RouteSearch({ onSearch, searchResult }: RouteSearchProps) {
  const [departure, setDeparture] = useState('Delhi');
  const [destination, setDestination] = useState('Manali');
  const [category, setCategory] = useState('All');
  const [journeyDate, setJourneyDate] = useState('2026-08-15');
  const [isWomenOnly, setIsWomenOnly] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(departure, destination, category);
  };

  const setPreset = (dep: string, dest: string) => {
    setDeparture(dep);
    setDestination(dest);
    onSearch(dep, dest, category);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 font-sans mb-16">
      {/* Hero Panoramic Image Banner (redBus Style) */}
      <div className="relative w-full h-[360px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950">
        <img
          src="/images/hero_red_bus_banner.jpg"
          alt="India's No. 1 online group trip booking site"
          className="w-full h-full object-cover opacity-75 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent"></div>

        <div className="absolute top-12 left-6 md:left-12 right-6 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/20 border border-red-600/40 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Live GPS Telemetry & B2B2C Marketplace
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            India's No. 1 online group trip booking site
          </h1>
          <p className="text-slate-200 text-sm md:text-base font-semibold max-w-xl drop-shadow">
            Discover verified tour agency packages, track live buses moving on your route in real-time, and get instant seat confirmation.
          </p>
        </div>
      </div>

      {/* Floating White Search Widget Card (Overlapping Hero Banner) */}
      <div className="relative z-30 max-w-5xl mx-auto -mt-24 md:-mt-28">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl p-5 md:p-7 shadow-2xl text-slate-900 dark:text-white transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-neutral-800">
            {/* From Input */}
            <div className="md:col-span-3 pb-3 md:pb-0 md:pr-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-neutral-900 border border-rose-200 dark:border-neutral-800 flex items-center justify-center text-red-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="w-full text-left">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">From</label>
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder="e.g. Delhi"
                  className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-black focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* To Input */}
            <div className="md:col-span-3 py-3 md:py-0 md:px-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-neutral-900 border border-rose-200 dark:border-neutral-800 flex items-center justify-center text-red-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="w-full text-left">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">To</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Manali"
                  className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-black focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* Date of Journey */}
            <div className="md:col-span-3 py-3 md:py-0 md:px-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-neutral-900 border border-rose-200 dark:border-neutral-800 flex items-center justify-center text-red-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="w-full text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Date of Journey</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setJourneyDate('2026-08-15')}
                      className="text-[9px] font-bold bg-rose-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setJourneyDate('2026-08-16')}
                      className="text-[9px] font-bold bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 px-1.5 py-0.5 rounded"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-black focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Category / Group Filter Pill */}
            <div className="md:col-span-3 pt-3 md:pt-0 md:pl-3 flex items-center justify-between gap-2">
              <div className="w-full text-left">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tour Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    onSearch(departure, destination, e.target.value);
                  }}
                  className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-black focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Trekking">Trekking</option>
                  <option value="Beach Caravan">Beach Caravan</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Heritage">Heritage</option>
                  <option value="Leisure & Luxury">Leisure & Luxury</option>
                </select>
              </div>

              {/* Booking for Women Toggle (redBus Style) */}
              <div className="bg-rose-50 dark:bg-neutral-900 border border-rose-200 dark:border-neutral-800 p-2 rounded-2xl flex items-center gap-1.5 shrink-0">
                <Heart className="w-4 h-4 text-red-600 fill-red-600" />
                <div className="text-[10px] font-bold text-slate-800 dark:text-neutral-200">
                  <span>Solo Women</span>
                </div>
                <input
                  type="checkbox"
                  checked={isWomenOnly}
                  onChange={(e) => setIsWomenOnly(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Centered Red Pill Search Button (Identical to redBus) */}
          <div className="flex justify-center -mb-12 pt-4">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-base px-10 py-3.5 rounded-full shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer border-2 border-white dark:border-black"
            >
              <Search className="w-5 h-5 stroke-[3]" />
              <span>Search Group Trips</span>
            </button>
          </div>
        </form>

        {/* Popular Live Routes Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-14">
          <span className="text-xs text-slate-500 font-bold mr-1">Popular Live Routes:</span>
          <button
            onClick={() => setPreset('Delhi', 'Manali')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
              departure === 'Delhi' && destination === 'Manali'
                ? 'bg-red-600 text-white border-red-600 shadow-sm font-black'
                : 'bg-white dark:bg-black border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:border-red-400'
            }`}
          >
            Delhi &rarr; Manali
          </button>

          <button
            onClick={() => setPreset('Indore', 'Goa')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
              departure === 'Indore' && destination === 'Goa'
                ? 'bg-red-600 text-white border-red-600 shadow-sm font-black'
                : 'bg-white dark:bg-black border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:border-red-400'
            }`}
          >
            Indore &rarr; Goa
          </button>

          <button
            onClick={() => setPreset('Mumbai', 'Goa')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
              departure === 'Mumbai' && destination === 'Goa'
                ? 'bg-red-600 text-white border-red-600 shadow-sm font-black'
                : 'bg-white dark:bg-black border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:border-red-400'
            }`}
          >
            Mumbai &rarr; Goa
          </button>
        </div>
      </div>
    </div>
  );
}
