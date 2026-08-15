'use client';

import React, { useState } from 'react';
import {
  Truck,
  Building2,
  Users,
  AlertTriangle,
  FileCheck,
  Plus,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { contractorsStore, vehiclesStore, driversStore, getDocumentExpiryAlerts } from '@/lib/fleetManager';

export default function FleetVendorDirectory() {
  const [activeTab, setActiveTab] = useState<'contractors' | 'vehicles' | 'drivers' | 'alerts'>('vehicles');

  const contractorsList = Object.values(contractorsStore);
  const vehiclesList = Object.values(vehiclesStore);
  const driversList = Object.values(driversStore);

  const { vehiclesExpiring, driversExpiring } = getDocumentExpiryAlerts();
  const totalAlerts = vehiclesExpiring.length + driversExpiring.length;

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-slate-900 font-sans">
      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" /> Fleet, Contractor & Crew Directory
          </h2>
          <p className="text-xs text-slate-500">Manage Vendor Agencies, Bus Fleet, Drivers, and Document Compliance Expiry Alerts.</p>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'vehicles' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" /> Vehicles ({vehiclesList.length})
          </button>

          <button
            onClick={() => setActiveTab('contractors')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'contractors' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Vendors ({contractorsList.length})
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'drivers' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Drivers ({driversList.length})
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'alerts' ? 'bg-amber-600 text-white shadow-md' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Expiry Alerts ({totalAlerts})
          </button>
        </div>
      </div>

      {/* 1. VEHICLES TABLE */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Active Bus Fleet & Seating Capacity</h3>
            <button className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Vehicle No</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Contractor Agency</th>
                  <th className="p-3">Total Seats</th>
                  <th className="p-3">Insurance Expiry</th>
                  <th className="p-3">Fitness Expiry</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {vehiclesList.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-black text-slate-900">{v.vehicleNumber}</td>
                    <td className="p-3 font-bold text-slate-700">{v.vehicleCategory}</td>
                    <td className="p-3 font-medium text-slate-600">{v.contractorName}</td>
                    <td className="p-3 font-mono font-extrabold text-red-600">{v.totalSeats} seats</td>
                    <td className="p-3 font-mono">{v.insuranceExpiry}</td>
                    <td className="p-3 font-mono">{v.fitnessExpiry}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CONTRACTORS TABLE */}
      {activeTab === 'contractors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Contractor & Partner Vendor Directory</h3>
            <button className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Vendor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractorsList.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">{c.agencyName}</h4>
                  <span className="text-[10px] font-mono font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Base: ₹{c.payoutRateAgreement.baseRatePerKm}/km
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-red-600" /> Contact: {c.contactPerson}</div>
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-red-600" /> Phone: {c.phone}</div>
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-red-600" /> Email: {c.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DRIVERS TABLE */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Driver & Crew Roster</h3>
            <button className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">License No</th>
                  <th className="p-3">License Expiry</th>
                  <th className="p-3">Assigned Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {driversList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">{d.fullName}</td>
                    <td className="p-3 font-mono">{d.primaryPhone}</td>
                    <td className="p-3 font-mono">{d.licenseNumber}</td>
                    <td className="p-3 font-mono">{d.licenseExpiry}</td>
                    <td className="p-3 font-medium text-slate-600">{d.assignedContractorName || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. EXPIRY ALERTS MONITOR */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Compliance Alert Center: Showing vehicles and driver licenses expiring within 30 days.</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase">Vehicle Insurance & Fitness Alerts</h4>
            {vehiclesExpiring.map((alert, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-amber-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 font-mono">{alert.vehicleNumber}</strong> &mdash; {alert.docType}
                  <span className="text-slate-500 block text-[10px]">Expiry Date: {alert.expiryDate}</span>
                </div>
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-lg text-xs">
                  {alert.daysLeft} Days Remaining
                </span>
              </div>
            ))}

            <h4 className="text-xs font-black text-slate-900 uppercase pt-2">Driver License Expiry Alerts</h4>
            {driversExpiring.map((alert, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-rose-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900">{alert.driverName}</strong> &mdash; License #{alert.licenseNumber}
                  <span className="text-slate-500 block text-[10px]">Expiry Date: {alert.expiryDate}</span>
                </div>
                <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-lg text-xs">
                  {alert.daysLeft} Days Remaining
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
