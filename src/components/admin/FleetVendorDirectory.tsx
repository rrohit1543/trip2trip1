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
  Trash2,
  Edit3,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  contractorsStore,
  vehiclesStore,
  driversStore,
  getDocumentExpiryAlerts,
  addContractor,
  editContractor,
  deleteContractor,
  addVehicle,
  editVehicle,
  deleteVehicle,
  addDriver,
  editDriver,
  deleteDriver,
  ContractorEntity,
  VehicleEntity,
  DriverEntity,
} from '@/lib/fleetManager';

export default function FleetVendorDirectory() {
  const [activeTab, setActiveTab] = useState<'contractors' | 'vehicles' | 'drivers' | 'alerts'>('vehicles');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ContractorEntity | null>(null);
  const [vendorFormData, setVendorFormData] = useState({
    agencyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstNumber: '',
    baseRatePerKm: 40,
  });

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleEntity | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    vehicleNumber: '',
    contractorId: 'cnt_1',
    vehicleCategory: 'VOLVO_MULTI_AXLE' as VehicleEntity['vehicleCategory'],
    totalSeats: 36,
    insuranceExpiry: '2026-12-31',
    fitnessExpiry: '2026-11-30',
  });

  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverEntity | null>(null);
  const [driverFormData, setDriverFormData] = useState({
    fullName: '',
    primaryPhone: '',
    emergencyPhone: '',
    licenseNumber: '',
    licenseExpiry: '2027-05-20',
    assignedContractorId: 'cnt_1',
  });

  const [deletingItem, setDeletingItem] = useState<{ type: 'contractor' | 'vehicle' | 'driver'; id: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const contractorsList = Object.values(contractorsStore);
  const vehiclesList = Object.values(vehiclesStore);
  const driversList = Object.values(driversStore);

  const { vehiclesExpiring, driversExpiring } = getDocumentExpiryAlerts();
  const totalAlerts = vehiclesExpiring.length + driversExpiring.length;

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // VENDOR CRUD HANDLERS
  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      editContractor(editingVendor.id, {
        agencyName: vendorFormData.agencyName,
        contactPerson: vendorFormData.contactPerson,
        phone: vendorFormData.phone,
        email: vendorFormData.email,
        gstNumber: vendorFormData.gstNumber,
        payoutRateAgreement: { baseRatePerKm: Number(vendorFormData.baseRatePerKm), platformSharePct: 10 },
      });
      setToast(`Vendor "${vendorFormData.agencyName}" updated successfully.`);
    } else {
      addContractor({
        agencyName: vendorFormData.agencyName,
        contactPerson: vendorFormData.contactPerson,
        phone: vendorFormData.phone,
        email: vendorFormData.email,
        gstNumber: vendorFormData.gstNumber,
        payoutRateAgreement: { baseRatePerKm: Number(vendorFormData.baseRatePerKm), platformSharePct: 10 },
      });
      setToast(`New Vendor "${vendorFormData.agencyName}" added.`);
    }
    setVendorModalOpen(false);
    setEditingVendor(null);
    triggerRefresh();
  };

  // VEHICLE CRUD HANDLERS
  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const contractor = contractorsStore[vehicleFormData.contractorId];
    if (editingVehicle) {
      editVehicle(editingVehicle.id, {
        vehicleNumber: vehicleFormData.vehicleNumber,
        contractorId: vehicleFormData.contractorId,
        contractorName: contractor ? contractor.agencyName : 'Partner Agency',
        vehicleCategory: vehicleFormData.vehicleCategory,
        totalSeats: Number(vehicleFormData.totalSeats),
        insuranceExpiry: vehicleFormData.insuranceExpiry,
        fitnessExpiry: vehicleFormData.fitnessExpiry,
      });
      setToast(`Vehicle "${vehicleFormData.vehicleNumber}" updated successfully.`);
    } else {
      addVehicle({
        vehicleNumber: vehicleFormData.vehicleNumber,
        contractorId: vehicleFormData.contractorId,
        contractorName: contractor ? contractor.agencyName : 'Partner Agency',
        vehicleCategory: vehicleFormData.vehicleCategory,
        totalSeats: Number(vehicleFormData.totalSeats),
        insuranceExpiry: vehicleFormData.insuranceExpiry,
        fitnessExpiry: vehicleFormData.fitnessExpiry,
        status: 'ACTIVE',
      });
      setToast(`New Vehicle "${vehicleFormData.vehicleNumber}" registered.`);
    }
    setVehicleModalOpen(false);
    setEditingVehicle(null);
    triggerRefresh();
  };

  // DRIVER CRUD HANDLERS
  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const contractor = contractorsStore[driverFormData.assignedContractorId];
    if (editingDriver) {
      editDriver(editingDriver.id, {
        fullName: driverFormData.fullName,
        primaryPhone: driverFormData.primaryPhone,
        emergencyPhone: driverFormData.emergencyPhone,
        licenseNumber: driverFormData.licenseNumber,
        licenseExpiry: driverFormData.licenseExpiry,
        assignedContractorId: driverFormData.assignedContractorId,
        assignedContractorName: contractor ? contractor.agencyName : 'Unassigned',
      });
      setToast(`Driver "${driverFormData.fullName}" updated successfully.`);
    } else {
      addDriver({
        fullName: driverFormData.fullName,
        primaryPhone: driverFormData.primaryPhone,
        emergencyPhone: driverFormData.emergencyPhone,
        licenseNumber: driverFormData.licenseNumber,
        licenseExpiry: driverFormData.licenseExpiry,
        assignedContractorId: driverFormData.assignedContractorId,
        assignedContractorName: contractor ? contractor.agencyName : 'Unassigned',
        status: 'ACTIVE',
      });
      setToast(`New Driver "${driverFormData.fullName}" enrolled.`);
    }
    setDriverModalOpen(false);
    setEditingDriver(null);
    triggerRefresh();
  };

  // CONFIRM DELETE HANDLER
  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    if (deletingItem.type === 'contractor') {
      deleteContractor(deletingItem.id);
      setToast(`Vendor "${deletingItem.name}" deleted.`);
    } else if (deletingItem.type === 'vehicle') {
      deleteVehicle(deletingItem.id);
      setToast(`Vehicle "${deletingItem.name}" decommissioned.`);
    } else if (deletingItem.type === 'driver') {
      deleteDriver(deletingItem.id);
      setToast(`Driver "${deletingItem.name}" unassigned and removed.`);
    }
    setDeletingItem(null);
    triggerRefresh();
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-slate-900 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:underline">Dismiss</button>
        </div>
      )}

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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vehicles' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" /> Vehicles ({vehiclesList.length})
          </button>

          <button
            onClick={() => setActiveTab('contractors')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'contractors' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Vendors ({contractorsList.length})
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'drivers' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Drivers ({driversList.length})
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
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
            <button
              onClick={() => {
                setEditingVehicle(null);
                setVehicleFormData({ vehicleNumber: '', contractorId: contractorsList[0]?.id || 'cnt_1', vehicleCategory: 'VOLVO_MULTI_AXLE', totalSeats: 36, insuranceExpiry: '2026-12-31', fitnessExpiry: '2026-11-30' });
                setVehicleModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> + Add Bus / Vehicle
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
                  <th className="p-3 text-right">Actions</th>
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
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingVehicle(v);
                          setVehicleFormData({ vehicleNumber: v.vehicleNumber, contractorId: v.contractorId, vehicleCategory: v.vehicleCategory, totalSeats: v.totalSeats, insuranceExpiry: v.insuranceExpiry, fitnessExpiry: v.fitnessExpiry });
                          setVehicleModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingItem({ type: 'vehicle', id: v.id, name: v.vehicleNumber })}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-[11px]"
                      >
                        Delete
                      </button>
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
            <button
              onClick={() => {
                setEditingVendor(null);
                setVendorFormData({ agencyName: '', contactPerson: '', phone: '', email: '', gstNumber: '', baseRatePerKm: 40 });
                setVendorModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> + Add Vendor / Contractor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractorsList.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
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
                  {c.gstNumber && <div className="text-[10px] font-mono text-slate-500">GSTIN: {c.gstNumber}</div>}
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-slate-200 justify-end">
                  <button
                    onClick={() => {
                      setEditingVendor(c);
                      setVendorFormData({ agencyName: c.agencyName, contactPerson: c.contactPerson, phone: c.phone, email: c.email, gstNumber: c.gstNumber || '', baseRatePerKm: c.payoutRateAgreement.baseRatePerKm });
                      setVendorModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                  >
                    Edit Vendor
                  </button>
                  <button
                    onClick={() => setDeletingItem({ type: 'contractor', id: c.id, name: c.agencyName })}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-[11px]"
                  >
                    Delete Vendor
                  </button>
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
            <button
              onClick={() => {
                setEditingDriver(null);
                setDriverFormData({ fullName: '', primaryPhone: '', emergencyPhone: '', licenseNumber: '', licenseExpiry: '2027-05-20', assignedContractorId: contractorsList[0]?.id || 'cnt_1' });
                setDriverModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> + Add Driver
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
                  <th className="p-3 text-right">Actions</th>
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
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingDriver(d);
                          setDriverFormData({ fullName: d.fullName, primaryPhone: d.primaryPhone, emergencyPhone: d.emergencyPhone, licenseNumber: d.licenseNumber, licenseExpiry: d.licenseExpiry, assignedContractorId: d.assignedContractorId || 'cnt_1' });
                          setDriverModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingItem({ type: 'driver', id: d.id, name: d.fullName })}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-[11px]"
                      >
                        Delete
                      </button>
                    </td>
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

      {/* VENDOR ADD / EDIT MODAL */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingVendor ? 'Edit Vendor Agency' : 'Add New Contractor / Vendor'}
              </h3>
              <button onClick={() => setVendorModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agency Name</label>
                <input
                  type="text"
                  required
                  placeholder="Himalayan Yatra Logistics"
                  value={vendorFormData.agencyName}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, agencyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  placeholder="Vikram Singh"
                  value={vendorFormData.contactPerson}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, contactPerson: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9812345678"
                    value={vendorFormData.phone}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="vendor@tripmandi.com"
                    value={vendorFormData.email}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="02AAACH1234F1Z9"
                  value={vendorFormData.gstNumber}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, gstNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {editingVendor ? 'Save Vendor Changes' : 'Create Vendor Entry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VEHICLE ADD / EDIT MODAL */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingVehicle ? 'Edit Vehicle Entry' : 'Register New Bus / Vehicle'}
              </h3>
              <button onClick={() => setVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vehicle Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="HP 01 AB 9988"
                  value={vehicleFormData.vehicleNumber}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Vendor Agency</label>
                <select
                  value={vehicleFormData.contractorId}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, contractorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                >
                  {contractorsList.map((c) => (
                    <option key={c.id} value={c.id}>{c.agencyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={vehicleFormData.vehicleCategory}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleCategory: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                  >
                    <option value="VOLVO_MULTI_AXLE">Volvo Multi-Axle</option>
                    <option value="AC_SLEEPER">AC Sleeper</option>
                    <option value="NON_AC_SEATER">Non-AC Seater</option>
                    <option value="MINI_BUS">Mini Bus</option>
                    <option value="TRAVELLER_16_SEATER">16-Seater Traveller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Seats</label>
                  <input
                    type="number"
                    required
                    value={vehicleFormData.totalSeats}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, totalSeats: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {editingVehicle ? 'Save Vehicle Specs' : 'Register Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER ADD / EDIT MODAL */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingDriver ? 'Edit Driver Profile' : 'Enroll New Driver'}
              </h3>
              <button onClick={() => setDriverModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ramesh Kumar"
                  value={driverFormData.fullName}
                  onChange={(e) => setDriverFormData({ ...driverFormData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Primary Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876501234"
                    value={driverFormData.primaryPhone}
                    onChange={(e) => setDriverFormData({ ...driverFormData, primaryPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Driving License No</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-042011009876"
                    value={driverFormData.licenseNumber}
                    onChange={(e) => setDriverFormData({ ...driverFormData, licenseNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {editingDriver ? 'Save Driver Profile' : 'Enroll Driver'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-red-600 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Entity Entry?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-900">"{deletingItem.name}"</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-extrabold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
