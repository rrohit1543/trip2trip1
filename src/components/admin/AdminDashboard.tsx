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
} from 'lucide-react';

import TripBuilderWizard from './TripBuilderWizard';
import FleetVendorDirectory from './FleetVendorDirectory';
import PassengerManifestExport from './PassengerManifestExport';
import { isAuthorizedAdminEmail, ADMIN_EMAIL_WHITELIST } from '@/lib/adminWhitelist';

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
  onSelectTripToTrack,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'fleet' | 'manifest'>('overview');

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
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Dashboard & KPIs
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'builder' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" /> 6-Step Trip Builder
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'fleet' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Fleet & Vendors
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'manifest' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" /> Driver Passenger Manifest
          </button>
        </div>

        {/* TAB 1: OVERVIEW & REAL-TIME KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-md space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Published Trips</div>
                <div className="text-3xl font-black text-slate-900">48</div>
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

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" /> Create Connected Multi-Leg Route
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Set up a Master Connected Trip (e.g. Delhi &rarr; Manali) with automated sub-legs via Chandigarh Transfer Hub.
                </p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Launch 6-Step Wizard &rarr;
                </button>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-red-600" /> Fleet Compliance & Expiry Alerts
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Monitor partner vendor contracts, bus fitness certificates, and driver license expiry dates.
                </p>
                <button
                  onClick={() => setActiveTab('fleet')}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  View Directory & Expiry Alerts &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRIP BUILDER WIZARD */}
        {activeTab === 'builder' && <TripBuilderWizard />}

        {/* TAB 3: FLEET & VENDOR DIRECTORY */}
        {activeTab === 'fleet' && <FleetVendorDirectory />}

        {/* TAB 4: PASSENGER MANIFEST */}
        {activeTab === 'manifest' && <PassengerManifestExport />}

      </main>
    </div>
  );
}
