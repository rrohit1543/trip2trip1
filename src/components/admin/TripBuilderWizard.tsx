'use client';

import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  Layers,
  Truck,
  Users,
  DollarSign,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
  Shield,
  Clock,
  Zap,
} from 'lucide-react';
import { contractorsStore, vehiclesStore, driversStore } from '@/lib/fleetManager';
import { useTripMandiStore } from '@/lib/store';

export default function TripBuilderWizard({ onTripCreated }: { onTripCreated?: (trip: any) => void }) {
  const { createTrip } = useTripMandiStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State across 6 steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Info & Route
    title: 'Delhi to Manali Volvo Multi-Leg Caravan',
    slug: 'delhi-manali-volvo-caravan-2026',
    description: 'Premier group tour with automated layover transfer and real-time telemetry.',
    sourceCity: 'Delhi',
    destinationCity: 'Manali',
    startDatetime: '2026-08-20T21:00',
    endDatetime: '2026-08-21T09:00',
    durationHours: 12,

    // Step 2: Route Type (DIRECT vs CONNECTED_MASTER)
    tripType: 'CONNECTED_MASTER' as 'DIRECT' | 'CONNECTED_MASTER',
    transferHubName: 'Chandigarh Junction Hub',
    layoverDurationMinutes: 45,
    subLegs: [
      { legSequence: 1, sourceCity: 'Delhi', destinationCity: 'Chandigarh', departureTime: '2026-08-20T21:00', arrivalTime: '2026-08-21T02:00', contractorId: 'cnt_1', vehicleId: 'veh_1', driverId: 'drv_1' },
      { legSequence: 2, sourceCity: 'Chandigarh', destinationCity: 'Manali', departureTime: '2026-08-21T02:45', arrivalTime: '2026-08-21T09:00', contractorId: 'cnt_1', vehicleId: 'veh_1', driverId: 'drv_1' },
    ],

    // Step 3: Fleet & Logistics Mapping
    contractorId: 'cnt_1',
    vehicleId: 'veh_1',
    driverId: 'drv_1',
    operatorNotes: 'Primary Volvo 9600 Multi-Axle with driver replacement at Chandigarh transfer hub.',

    // Step 4: Pricing & Seating Matrix
    basePrice: 1200,
    sleeperPremium: 250,
    dynamicSurgeEnabled: true,
    surgeThresholdPct: 75,
    surgeIncreasePct: 15,

    // Step 5: Media Gallery
    mediaGallery: [
      { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80', isFeatured: true, sortOrder: 1, altText: 'Luxury Volvo Multi-Axle Bus' },
      { url: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1200&q=80', isFeatured: false, sortOrder: 2, altText: 'Scenic Manali Mountain Pass' },
    ],

    // Step 6: Itinerary & Policies
    itinerary: [
      { dayNumber: 1, title: 'Overnight Boarding from Delhi NCR', description: 'Board from Kashmere Gate ISBT & Sector 62 Noida.', highlights: ['GPS Live Link', 'Water Bottle & Blanket'] },
      { dayNumber: 2, title: 'Chandigarh Hub Transfer & Arrival in Manali', description: 'Brief 45-min refreshment stop at Chandigarh Hub before scenic climb to Manali.', highlights: ['Breakfast Stop', 'Hotel Check-in'] },
    ],
    inclusions: ['AC Volvo Bus Tickets', 'Live Telemetry Link', 'Personal Blanket', 'GST Invoice'],
    exclusions: ['Hotel Stay', 'Personal Expenses', 'Adventure Sports'],
    cancellationPolicy: '100% refund if cancelled 48h prior to departure. 50% refund within 24h.',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
  });

  const contractorsList = Object.values(contractorsStore);
  const vehiclesList = Object.values(vehiclesStore);
  const driversList = Object.values(driversStore);

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveTrip = async () => {
    setSaving(true);
    setNotification(null);

    try {
      // 1. Create in store state so it immediately displays on customer home page & operator/admin views
      const storeTrip = {
        name: formData.title,
        category: 'Leisure & Luxury' as const,
        operatorId: 'usr_operator_1',
        operatorName: 'Himalayan Yatra Expeditions',
        operatorLogo: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=200&q=80',
        operatorRating: 4.9,
        operatorReviewsCount: 50,
        departureCity: formData.sourceCity,
        destinationCity: formData.destinationCity,
        pickupLocation: { name: `${formData.sourceCity} Central Stop`, lat: 28.6667, lng: 77.2333 },
        dropPoints: [
          { name: `${formData.destinationCity} Terminus`, lat: 32.2432, lng: 77.1892 },
        ],
        durationDays: 3,
        durationNights: 2,
        departureDateTime: formData.startDatetime || new Date().toISOString(),
        returnDateTime: formData.endDatetime || new Date(Date.now() + 86400000).toISOString(),
        pricePerPerson: formData.basePrice,
        totalSeats: 36,
        availableSeats: 36,
        bookedSeatNumbers: [],
        bookingDeadline: new Date(Date.now() + 43200000).toISOString(),
        itinerary: [
          { dayNumber: 1, title: 'Day 1 Journey Start', activities: ['Board bus', 'Highway Travel'], meals: 'Dinner Included', stayDetails: 'Hotel/Bus' },
        ],
        inclusions: formData.inclusions,
        exclusions: formData.exclusions,
        cancellationPolicy: formData.cancellationPolicy,
        requiredDocuments: ['Aadhaar Card'],
        images: formData.mediaGallery.map((m) => m.url),
        tourGuide: { name: 'Ramesh Sharma', phone: '+91 9876543210', rating: 4.9, languages: ['English', 'Hindi'], photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
        vehicle: { type: 'Volvo B11R Multi-Axle', regNumber: 'HP 01 EXP 9999', amenities: ['Pushback Seats', 'Charging Ports', 'Live GPS Tracker'], driverName: 'Suresh Kumar', driverPhone: '+91 98160 55443' },
        hotel: { name: 'Resort Grand Stay', stars: 4, location: formData.destinationCity, images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'] },
        status: 'live' as const,
        difficultyLevel: 'Easy' as const,
        tags: [formData.sourceCity, formData.destinationCity, 'Group Tour', 'Volvo'],
        routePath: [[28.6667, 77.2333], [32.2432, 77.1892]] as [number, number][],
        intermediateCities: [formData.sourceCity, formData.destinationCity],
      };

      createTrip(storeTrip);

      // 2. Call API endpoint
      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setNotification(`Trip Package "${formData.title}" published! It is now live on the homepage.`);
      if (onTripCreated) onTripCreated(data.trip || storeTrip);
    } catch (err) {
      setNotification('Network error saving trip package.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 border border-red-600/30 text-xs font-bold px-3 py-1 rounded-full uppercase mb-1">
            <Zap className="w-3.5 h-3.5" /> 6-Step Enterprise Trip Builder
          </div>
          <h2 className="text-2xl font-black text-slate-900">Trip & Connected Logistics Wizard</h2>
          <p className="text-xs text-slate-500">Configure Direct & Multi-Leg Connected Trips, Contractor assignments, fleet mapping, and media galleries.</p>
        </div>

        {/* Wizard Step Indicator Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center transition ${
                currentStep === step
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : currentStep > step
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {currentStep > step ? '✓' : step}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-500 hover:underline">Dismiss</button>
        </div>
      )}

      {/* STEP 1: BASIC INFO & ROUTE */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-red-600" /> Step 1: Basic Trip Information & Route
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trip Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Source City</label>
              <input
                type="text"
                value={formData.sourceCity}
                onChange={(e) => setFormData({ ...formData, sourceCity: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Destination City</label>
              <input
                type="text"
                value={formData.destinationCity}
                onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.startDatetime}
                onChange={(e) => setFormData({ ...formData, startDatetime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endDatetime}
                onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ROUTE TYPE (DIRECT vs CONNECTED TRIP) */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-600" /> Step 2: Route Architecture (Direct vs Multi-Leg Connected Trip)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tripType: 'DIRECT' })}
              className={`p-4 rounded-2xl border-2 text-left space-y-1 transition ${
                formData.tripType === 'DIRECT' ? 'border-red-600 bg-rose-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-extrabold text-sm text-slate-900">Direct Single Bus Route</div>
              <p className="text-xs text-slate-500">Single bus & driver handles entire journey from Origin to Destination.</p>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, tripType: 'CONNECTED_MASTER' })}
              className={`p-4 rounded-2xl border-2 text-left space-y-1 transition ${
                formData.tripType === 'CONNECTED_MASTER' ? 'border-red-600 bg-rose-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                Connected Multi-Leg Trip <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded uppercase">Master</span>
              </div>
              <p className="text-xs text-slate-500">Links sub-legs via Transfer Hubs with layover buffer times and separate buses/drivers.</p>
            </button>
          </div>

          {formData.tripType === 'CONNECTED_MASTER' && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Transfer Hub & Sub-Leg Configurations</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transfer Hub Name</label>
                  <input
                    type="text"
                    value={formData.transferHubName}
                    onChange={(e) => setFormData({ ...formData, transferHubName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Layover Buffer (Minutes)</label>
                  <input
                    type="number"
                    value={formData.layoverDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, layoverDurationMinutes: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Sub-Legs List */}
              <div className="space-y-2">
                {formData.subLegs.map((leg, idx) => (
                  <div key={idx} className="bg-white border border-slate-300 p-3 rounded-xl text-xs flex items-center justify-between font-mono">
                    <div>
                      <strong className="text-red-600">Leg #{leg.legSequence}:</strong> {leg.sourceCity} &rarr; {leg.destinationCity}
                      <span className="text-slate-400 block text-[10px]">{leg.departureTime} - {leg.arrivalTime}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold">Assigned: Contractor #{leg.contractorId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: LOGISTICS MAPPING */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" /> Step 3: Fleet Logistics & Contractor Mapping
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Contractor Agency</label>
              <select
                value={formData.contractorId}
                onChange={(e) => setFormData({ ...formData, contractorId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 cursor-pointer"
              >
                {contractorsList.map((c) => (
                  <option key={c.id} value={c.id}>{c.agencyName} ({c.contactPerson})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Vehicle / Bus</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 cursor-pointer"
              >
                {vehiclesList.map((v) => (
                  <option key={v.id} value={v.id}>{v.vehicleNumber} - {v.vehicleCategory} ({v.totalSeats} seats)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Driver</label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 cursor-pointer"
              >
                {driversList.map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName} ({d.primaryPhone})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: PRICING & SEATING MATRIX */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-600" /> Step 4: Pricing Rules & Dynamic Surge Matrix
          </h3>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base Seat Fare (₹)</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sleeper Berth Premium (+₹)</label>
              <input
                type="number"
                value={formData.sleeperPremium}
                onChange={(e) => setFormData({ ...formData, sleeperPremium: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Occupancy Surge Trigger (%)</label>
              <input
                type="number"
                value={formData.surgeThresholdPct}
                onChange={(e) => setFormData({ ...formData, surgeThresholdPct: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold font-mono text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: MEDIA GALLERY & IMAGE UPLOAD */}
      {currentStep === 5 && (
        <div className="space-y-4 font-sans">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-red-600" /> Step 5: Upload & Manage High-Res Trip Photos
            </h3>
            <label className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer shadow-md flex items-center gap-1">
              <Plus className="w-4 h-4" /> Upload Local Photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (reader.result) {
                        setFormData((prev) => ({
                          ...prev,
                          mediaGallery: [
                            ...prev.mediaGallery,
                            { url: reader.result as string, altText: file.name, isFeatured: prev.mediaGallery.length === 0, sortOrder: prev.mediaGallery.length + 1 },
                          ],
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
            </label>
          </div>

          {/* Direct URL Input */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 p-2 rounded-2xl">
            <input
              type="text"
              placeholder="Paste Image URL (e.g., https://images.unsplash.com/...)"
              id="newMediaUrlInput"
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('newMediaUrlInput') as HTMLInputElement;
                if (el && el.value.trim()) {
                  setFormData((prev) => ({
                    ...prev,
                    mediaGallery: [
                      ...prev.mediaGallery,
                      { url: el.value.trim(), altText: 'Uploaded Trip Image', isFeatured: prev.mediaGallery.length === 0, sortOrder: prev.mediaGallery.length + 1 },
                    ],
                  }));
                  el.value = '';
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Add URL
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.mediaGallery.map((media, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900">
                <img src={media.url} alt={media.altText} className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        mediaGallery: prev.mediaGallery.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="self-end p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-[10px] text-white font-bold flex items-center justify-between">
                    <span>{media.isFeatured ? '★ Featured Cover' : 'Gallery Image'}</span>
                    {!media.isFeatured && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            mediaGallery: prev.mediaGallery.map((m, i) => ({ ...m, isFeatured: i === idx })),
                          }));
                        }}
                        className="underline"
                      >
                        Set Cover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6: ITINERARY & POLICIES */}
      {currentStep === 6 && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" /> Step 6: Detailed Itinerary & Cancellation Policy
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cancellation & Refund Policy</label>
              <textarea
                rows={3}
                value={formData.cancellationPolicy}
                onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Wizard Footer Navigation Controls */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-2 disabled:opacity-40 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Previous Step
        </button>

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSaveTrip}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Package...' : 'Publish Trip Package'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
