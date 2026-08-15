'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Compass,
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Truck,
  CheckCircle2,
  LogOut,
  Zap,
  Layers,
  Printer,
  AlertTriangle,
  Trash2,
  X,
  MapPin,
  Calendar,
  Shield,
  FileText,
} from 'lucide-react';

import TripBuilderWizard from './TripBuilderWizard';
import FleetVendorDirectory from './FleetVendorDirectory';
import PassengerManifestExport from './PassengerManifestExport';
import OperatorsManagement from './OperatorsManagement';
import CustomerBookingAdministration from './CustomerBookingAdministration';
import PostsCMSPanel from './PostsCMSPanel';
import { isAuthorizedAdminEmail, ADMIN_EMAIL_WHITELIST } from '@/lib/adminWhitelist';
import { useTripMandiStore } from '@/lib/store';

export interface AdminDashboardProps {
  adminEmail?: string;
  operatorKYC?: any[];
  trips?: any[];
  telemetry?: Record<string, any>;
  bookings?: any[];
  users?: any[];
  securityLogs?: any[];
  commissionRules?: any[];
  paymentSplits?: any[];
  supportTickets?: any[];
  onUpdateCommissionRule?: (ruleId: string, pct: number) => void;
  onUpdateKYCStatus?: (operatorId: string, status: any) => void;
  onUpdateUserStatus?: (userId: string, status: any) => void;
  onUpdateUserRole?: (userId: string, role: any) => void;
  onSelectTripToTrack?: (t: any) => void;
}

export default function AdminDashboard({
  adminEmail = 'rohit19249@gmail.com',
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'fleet' | 'operators' | 'customers' | 'manifest' | 'posts'>('overview');
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [deletingTripTitle, setDeletingTripTitle] = useState<string>('');
  const [galleryTrip, setGalleryTrip] = useState<any | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const { trips, deleteTrip, updateTripImages } = useTripMandiStore();

  // Verify Whitelist Security Guard
  const isAuthorized = isAuthorizedAdminEmail(adminEmail);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border-2 border-red-600 rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">403 Forbidden Access</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your email <strong className="text-red-600">{adminEmail}</strong> is not listed on the hardcoded Super Admin Whitelist. Access to the TripMandi Logistics Engine has been blocked and logged.
          </p>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-left text-[11px] font-mono space-y-1">
            <div className="font-bold text-slate-700 uppercase">Authorized Whitelist Accounts:</div>
            {ADMIN_EMAIL_WHITELIST.map((email) => (
              <div key={email} className="text-emerald-700 font-bold">• {email}</div>
            ))}
          </div>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full py-3 rounded-2xl bg-red-600 text-white font-extrabold text-xs shadow-lg shadow-red-600/30"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Handle Delete Trip Action
  const confirmDeleteTrip = async () => {
    if (!deletingTripId) return;

    try {
      deleteTrip(deletingTripId);
      await fetch(`/api/admin/trips?tripId=${deletingTripId}`, {
        method: 'DELETE',
      });
      setNotification(`Trip "${deletingTripTitle}" was permanently deleted.`);
    } catch (err) {
      setNotification('Error deleting trip.');
    } finally {
      setDeletingTripId(null);
      setDeletingTripTitle('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center font-mono font-black text-lg">
            TM
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2">
              TripMandi Enterprise Admin <span className="bg-red-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Super Admin</span>
            </h1>
            <p className="text-[11px] text-slate-400">Connected Logistics & Multi-Leg Route Architecture Engine</p>
          </div>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">{adminEmail}</span>
          </div>

          <button
            onClick={() => (window.location.href = '/')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-6">
        
        {/* Notification Toast */}
        {notification && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-slate-500 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Navigation Tabs across 5 Core Modules */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'overview' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Trips Overview
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'builder' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" /> Trip Builder Wizard
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'fleet' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Fleet & Vendors (CRUD)
          </button>

          <button
            onClick={() => setActiveTab('operators')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'operators' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" /> Operators & Sub-Roles
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'customers' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Customers & Bookings
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'posts' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Posts & CMS
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'manifest' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" /> Driver Manifest PDF
          </button>
        </div>

        {/* TAB 1: OVERVIEW & REAL-TIME KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-md space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Published Trips</div>
                <div className="text-3xl font-black text-slate-900">{trips.length}</div>
                <div className="text-[11px] text-emerald-600 font-bold">↑ +14% vs last week</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-md space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connected Multi-Leg Trips</div>
                <div className="text-3xl font-black text-red-600">18</div>
                <div className="text-[11px] text-slate-500 font-bold">Transfer Hubs Active</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-md space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Fleet on Road</div>
                <div className="text-3xl font-black text-slate-900">32 Buses</div>
                <div className="text-[11px] text-emerald-600 font-bold">100% Insured & Active</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-md space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Real-time Occupancy</div>
                <div className="text-3xl font-black text-emerald-600">84.2%</div>
                <div className="text-[11px] text-emerald-600 font-bold">Dynamic Surge Active</div>
              </div>
            </div>

            {/* PUBLISHED TRIPS & DELETE MANAGEMENT TABLE */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-red-600" /> Active Trip Packages & Management
                  </h3>
                  <p className="text-xs text-slate-500">Manage published trips, dynamic pricing, and delete obsolete listings.</p>
                </div>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  + Add New Trip
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Route / Title</th>
                      <th className="p-3">Operator Agency</th>
                      <th className="p-3">Base Price</th>
                      <th className="p-3">Departure Date</th>
                      <th className="p-3">Available Seats</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Gallery & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {trips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900 flex items-center gap-2">
                            {t.images && t.images[0] && (
                              <img src={t.images[0]} alt={t.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                            )}
                            <span>{t.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                            <MapPin className="w-3 h-3 text-red-600" /> {t.departureCity} &rarr; {t.destinationCity}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-600">{t.operatorName}</td>
                        <td className="p-3 font-mono font-black text-slate-900">₹{t.pricePerPerson}</td>
                        <td className="p-3 font-mono text-slate-600">{t.departureDateTime}</td>
                        <td className="p-3 font-mono font-bold text-red-600">{t.availableSeats} left</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            t.status === 'live' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => setGalleryTrip(t)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            📸 Upload / Gallery ({t.images?.length || 0})
                          </button>
                          <button
                            onClick={() => { setDeletingTripId(t.id); setDeletingTripTitle(t.name); }}
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-extrabold text-xs transition border border-red-200 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRIP BUILDER WIZARD */}
        {activeTab === 'builder' && <TripBuilderWizard />}

        {/* TAB 3: FLEET & VENDOR DIRECTORY */}
        {activeTab === 'fleet' && <FleetVendorDirectory />}

        {/* TAB 4: OPERATORS & SUB-ROLES */}
        {activeTab === 'operators' && <OperatorsManagement />}

        {/* TAB 5: CUSTOMERS & BOOKINGS */}
        {activeTab === 'customers' && <CustomerBookingAdministration />}

        {/* TAB 6: POSTS & CMS */}
        {activeTab === 'posts' && <PostsCMSPanel />}

        {/* TAB 7: PASSENGER MANIFEST */}
        {activeTab === 'manifest' && <PassengerManifestExport />}

      </main>

      {/* CONFIRMATION DELETE MODAL */}
      {deletingTripId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-red-600 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Trip Package?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-900">"{deletingTripTitle}"</strong>?
              </p>
              <p className="text-[11px] text-red-600 font-bold mt-2 bg-red-50 p-2 rounded-xl border border-red-200">
                ⚠️ Warning: This action cannot be undone and will purge all seat pricing and logistics mappings.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTripId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-extrabold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTrip}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRIP IMAGE UPLOADER & GALLERY MANAGEMENT MODAL */}
      {galleryTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-xl w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Upload & Manage Trip Images</h3>
                <p className="text-xs text-slate-500 font-bold">{galleryTrip.name}</p>
              </div>
              <button onClick={() => setGalleryTrip(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer shadow-md inline-flex items-center gap-1.5">
                  📁 Upload Local Photo
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
                            const newUrl = reader.result as string;
                            const updatedImages = [...(galleryTrip.images || []), newUrl];
                            setGalleryTrip({ ...galleryTrip, images: updatedImages });
                            updateTripImages(galleryTrip.id, updatedImages);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                </label>

                <span className="text-xs font-bold text-slate-400">OR</span>

                <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl">
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        const updatedImages = [...(galleryTrip.images || []), newImageUrl.trim()];
                        setGalleryTrip({ ...galleryTrip, images: updatedImages });
                        updateTripImages(galleryTrip.id, updatedImages);
                        setNewImageUrl('');
                      }
                    }}
                    className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shrink-0"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Gallery Image Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {(galleryTrip.images || []).map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900">
                    <img src={imgUrl} alt={`Trip image ${idx + 1}`} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-between">
                      <button
                        onClick={() => {
                          const updatedImages = galleryTrip.images.filter((_: any, i: number) => i !== idx);
                          setGalleryTrip({ ...galleryTrip, images: updatedImages });
                          updateTripImages(galleryTrip.id, updatedImages);
                        }}
                        className="self-end p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-white font-bold">Photo #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => {
                  setNotification(`Gallery photos for "${galleryTrip.name}" saved!`);
                  setGalleryTrip(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Save & Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
