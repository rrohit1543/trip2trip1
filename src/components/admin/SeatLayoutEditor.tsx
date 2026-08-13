'use client';

import React, { useState, useEffect } from 'react';
import {
  Bus,
  Car,
  Truck,
  DollarSign,
  Lock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Settings2,
  Layers,
  Save,
  Users,
  Shield,
  Zap,
} from 'lucide-react';

export interface SeatItem {
  seatNumber: number;
  label: string;
  deck: 'LOWER' | 'UPPER';
  row: number;
  col: number;
  type: 'SEATER' | 'SLEEPER_UPPER' | 'SLEEPER_LOWER';
  priceOverride?: number | null;
  baseSeatPrice?: number;
  finalPrice?: number;
  surgeApplied?: boolean;
  status: 'AVAILABLE' | 'FEMALE_ONLY' | 'BLOCKED' | 'BOOKED';
}

interface SeatLayoutEditorProps {
  tripId?: string;
  onSaveLayout?: (updatedSeats: SeatItem[]) => void;
}

export default function SeatLayoutEditor({ tripId = 'trip_demo_1', onSaveLayout }: SeatLayoutEditorProps) {
  const [vehicleType, setVehicleType] = useState<'BUS' | 'CAR' | 'TRAVELLER'>('BUS');
  const [activeDeck, setActiveDeck] = useState<'LOWER' | 'UPPER'>('LOWER');
  
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Bulk Edit Form Controls
  const [newPriceInput, setNewPriceInput] = useState<string>('');
  const [newStatusInput, setNewStatusInput] = useState<SeatItem['status']>('AVAILABLE');
  const [newTypeInput, setNewTypeInput] = useState<SeatItem['type']>('SEATER');

  // Dynamic Surge Settings
  const [dynamicSurgeEnabled, setDynamicSurgeEnabled] = useState(true);
  const [surgeThresholdPct, setSurgeThresholdPct] = useState(75);
  const [surgeIncreasePct, setSurgeIncreasePct] = useState(15);
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch Live Seat Layout & Pricing Matrix from API
  useEffect(() => {
    fetchLayout();
  }, [tripId]);

  const fetchLayout = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trips/${tripId}/layout`);
      const data = await res.json();
      if (data.success) {
        setSeats(data.seats);
        if (data.trip) {
          setVehicleType(data.trip.vehicleType || 'BUS');
          setDynamicSurgeEnabled(data.trip.dynamicSurgeEnabled ?? true);
          setSurgeThresholdPct(data.trip.surgeThresholdPct ?? 75);
          setSurgeIncreasePct(data.trip.surgeIncreasePct ?? 15);
        }
      }
    } catch (err) {
      console.error('Failed to fetch seat layout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle seat selection (Single or Multi-select)
  const handleSeatClick = (seatNumber: number) => {
    if (selectedSeatNumbers.includes(seatNumber)) {
      setSelectedSeatNumbers(selectedSeatNumbers.filter((num) => num !== seatNumber));
    } else {
      setSelectedSeatNumbers([...selectedSeatNumbers, seatNumber]);
    }
  };

  // Select all seats on current active deck
  const handleSelectAllCurrentDeck = () => {
    const currentDeckSeats = seats.filter((s) => s.deck === activeDeck).map((s) => s.seatNumber);
    setSelectedSeatNumbers(currentDeckSeats);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedSeatNumbers([]);
  };

  // Apply Bulk Edits to Selected Seats
  const handleApplyBulkEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeatNumbers.length === 0) {
      setNotification({ type: 'error', message: 'Please select at least one seat to edit.' });
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        seatNumbers: selectedSeatNumbers,
        status: newStatusInput,
        seatType: newTypeInput,
        dynamicSurgeEnabled,
        surgeThresholdPct,
        surgeIncreasePct,
      };

      if (newPriceInput.trim() !== '') {
        payload.priceOverride = Number(newPriceInput);
      }

      const res = await fetch(`/api/admin/trips/${tripId}/seat-pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: `Updated ${selectedSeatNumbers.length} seats successfully!` });
        fetchLayout();
        setSelectedSeatNumbers([]);
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to update seat pricing.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Error saving seat pricing updates.' });
    } finally {
      setSaving(false);
    }
  };

  // Filter seats by active deck
  const currentDeckSeats = seats.filter((s) => s.deck === activeDeck);
  const totalBooked = seats.filter((s) => s.status === 'BOOKED').length;
  const occupancyPct = seats.length > 0 ? Math.round((totalBooked / seats.length) * 100) : 0;

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-slate-900 font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 border border-red-600/30 text-xs font-bold px-3 py-1 rounded-full uppercase mb-1">
            <Zap className="w-3.5 h-3.5" /> Interactive Seat Pricing & Layout Matrix
          </div>
          <h2 className="text-2xl font-black text-slate-900">Vehicle Seat Pricing Editor</h2>
          <p className="text-xs text-slate-500">Configure visual seat maps, individual price overrides, female-only seats, and dynamic occupancy surge rules.</p>
        </div>

        {/* Vehicle Type Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => { setVehicleType('BUS'); setActiveDeck('LOWER'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              vehicleType === 'BUS' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Bus className="w-4 h-4" /> 2x1 Sleeper Bus
          </button>
          <button
            type="button"
            onClick={() => { setVehicleType('TRAVELLER'); setActiveDeck('LOWER'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              vehicleType === 'TRAVELLER' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" /> Traveller (16)
          </button>
          <button
            type="button"
            onClick={() => { setVehicleType('CAR'); setActiveDeck('LOWER'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              vehicleType === 'CAR' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" /> SUV (7)
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between border ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-700 border-red-300'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-xs text-slate-500 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Main 2-Column Editor Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (7 Cols): Visual Seat Layout Matrix Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">Seat Map Grid ({activeDeck} Deck)</h3>
              <span className="text-xs text-slate-500 font-mono font-bold">
                {selectedSeatNumbers.length} Selected
              </span>
            </div>

            {/* Deck Selector for Buses */}
            {vehicleType === 'BUS' && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveDeck('LOWER')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeDeck === 'LOWER' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'
                  }`}
                >
                  Lower Deck (Seater)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeck('UPPER')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeDeck === 'UPPER' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'
                  }`}
                >
                  Upper Deck (Sleeper)
                </button>
              </div>
            )}
          </div>

          {/* Interactive Bus Visual Blueprint Card */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 relative shadow-inner space-y-6">
            {/* Steering Wheel Indicator */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">⎈</div>
                <span>Driver Cabin</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                <button onClick={handleSelectAllCurrentDeck} className="text-red-600 hover:underline">Select All Deck Seats</button>
                <button onClick={handleClearSelection} className="text-slate-500 hover:underline">Clear</button>
              </div>
            </div>

            {/* Grid Layout Container */}
            <div className="space-y-3 py-2 overflow-x-auto">
              {currentDeckSeats.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 font-bold">No seats configured on this deck.</div>
              ) : (
                <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
                  {currentDeckSeats.map((seat) => {
                    const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
                    const isBooked = seat.status === 'BOOKED';
                    const isBlocked = seat.status === 'BLOCKED';
                    const isFemale = seat.status === 'FEMALE_ONLY';
                    const isSleeper = seat.type === 'SLEEPER_UPPER' || seat.type === 'SLEEPER_LOWER';

                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        onClick={() => handleSeatClick(seat.seatNumber)}
                        className={`p-2.5 rounded-2xl border-2 font-mono text-xs flex flex-col items-center justify-between transition-all duration-150 cursor-pointer ${
                          isSleeper ? 'h-20' : 'h-14'
                        } ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/40 scale-105 ring-2 ring-red-400'
                            : isBooked
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                            : isBlocked
                            ? 'bg-slate-800 text-slate-300 border-slate-900'
                            : isFemale
                            ? 'bg-pink-100 text-pink-700 border-pink-400'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-red-500 hover:shadow-md'
                        }`}
                      >
                        <span className="font-bold text-[11px]">{seat.label}</span>
                        <span className="text-[10px] font-black">₹{seat.finalPrice || seat.priceOverride || 1200}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seat Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-slate-600 border-t border-slate-200 pt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-white border border-slate-400"></div> Available
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-pink-100 border border-pink-400"></div> Female Only
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-slate-800"></div> Blocked
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-slate-200 border border-slate-300"></div> Booked
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-red-600"></div> Selected ({selectedSeatNumbers.length})
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Bulk Pricing & Dynamic Surge Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Action Card 1: Bulk Seat Pricing & Status Form */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-600" /> Multi-Seat Pricing & Status Tool
              </h3>
              <span className="text-xs font-mono font-bold text-red-600">{selectedSeatNumbers.length} Seats Selected</span>
            </div>

            <form onSubmit={handleApplyBulkEdits} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Custom Base Price Override (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1400 (+₹200 for lower berth)"
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seat Status</label>
                <select
                  value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="AVAILABLE">AVAILABLE (Open to all)</option>
                  <option value="FEMALE_ONLY">FEMALE_ONLY (Reserved for women)</option>
                  <option value="BLOCKED">BLOCKED (Maintenance/VIP Lock)</option>
                  <option value="BOOKED">BOOKED (Reserved)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seat Berth Type</label>
                <select
                  value={newTypeInput}
                  onChange={(e) => setNewTypeInput(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="SEATER">SEATER (Reclining Chair)</option>
                  <option value="SLEEPER_LOWER">SLEEPER_LOWER (Lower Berth Bed)</option>
                  <option value="SLEEPER_UPPER">SLEEPER_UPPER (Upper Berth Bed)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving || selectedSeatNumbers.length === 0}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Applying Updates...' : `Apply Updates to ${selectedSeatNumbers.length} Selected Seats`}</span>
              </button>
            </form>
          </div>

          {/* Action Card 2: Dynamic Occupancy Surge Rule Engine */}
          <div className="bg-rose-50/50 border border-rose-200 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-200 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider block">Rule-Based Dynamic Pricing</span>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600" /> Occupancy Surge Engine
                </h4>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dynamicSurgeEnabled}
                  onChange={(e) => setDynamicSurgeEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trigger Threshold (%)</label>
                <input
                  type="number"
                  value={surgeThresholdPct}
                  onChange={(e) => setSurgeThresholdPct(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price Surge (+%)</label>
                <input
                  type="number"
                  value={surgeIncreasePct}
                  onChange={(e) => setSurgeIncreasePct(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              When bus occupancy exceeds <strong>{surgeThresholdPct}%</strong>, remaining seats will automatically surge by <strong>+{surgeIncreasePct}%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
