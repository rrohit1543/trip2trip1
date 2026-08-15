'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Ticket,
} from 'lucide-react';
import {
  customersStore,
  addCustomer,
  editCustomer,
  deleteCustomer,
  CustomerEntity,
} from '@/lib/customersManager';

export default function CustomerBookingAdministration() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'directory' | 'seat_map'>('directory');

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCust, setEditingCust] = useState<CustomerEntity | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    totalBookings: 1,
    lifetimeValue: 1200,
  });

  const [deletingCust, setDeletingCust] = useState<CustomerEntity | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Mock 36 Seats for Visual Seat Map Module
  const [seatMap, setSeatMap] = useState<Record<number, 'AVAILABLE' | 'BOOKED' | 'BLOCKED'>>({
    1: 'BOOKED',
    2: 'BOOKED',
    3: 'BOOKED',
    4: 'AVAILABLE',
    5: 'BOOKED',
    6: 'BLOCKED',
    7: 'AVAILABLE',
    8: 'AVAILABLE',
    9: 'AVAILABLE',
    10: 'BOOKED',
    11: 'AVAILABLE',
    12: 'BLOCKED',
  });

  const customersList = Object.values(customersStore);

  const filteredCustomers = customersList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCust) {
      editCustomer(editingCust.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        totalBookings: Number(formData.totalBookings),
        lifetimeValue: Number(formData.lifetimeValue),
      });
      setToast(`Customer record "${formData.name}" updated.`);
    } else {
      addCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        totalBookings: Number(formData.totalBookings),
        lifetimeValue: Number(formData.lifetimeValue),
        status: 'ACTIVE',
      });
      setToast(`New Customer "${formData.name}" created for offline booking.`);
    }
    setModalOpen(false);
    setEditingCust(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleConfirmDelete = () => {
    if (!deletingCust) return;
    deleteCustomer(deletingCust.id);
    setToast(`Customer record "${deletingCust.name}" deleted.`);
    setDeletingCust(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleToggleSeatState = (seatNum: number) => {
    setSeatMap((prev) => {
      const current = prev[seatNum] || 'AVAILABLE';
      const next = current === 'AVAILABLE' ? 'BOOKED' : current === 'BOOKED' ? 'BLOCKED' : 'AVAILABLE';
      return { ...prev, [seatNum]: next };
    });
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    alert('Passenger Manifest exported as CSV spreadsheet!');
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

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" /> Customer Directory & Real-time Seat Control
          </h2>
          <p className="text-xs text-slate-500">Manage Customer profiles (Add, Edit, Delete), Visual Seat Overrides, and Driver Manifest PDF/CSV exports.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'directory' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Customer Directory ({customersList.length})
          </button>
          <button
            onClick={() => setActiveTab('seat_map')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'seat_map' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Visual Seat Map & Manifest
          </button>
        </div>
      </div>

      {/* TAB 1: CUSTOMER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search customers by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-slate-900 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                setEditingCust(null);
                setFormData({ name: '', email: '', phone: '', totalBookings: 1, lifetimeValue: 1200 });
                setModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> + Add Manual Customer
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Total Bookings</th>
                  <th className="p-3">Lifetime Value</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 font-mono">{c.email}</td>
                    <td className="p-3 font-mono text-slate-700">{c.phone}</td>
                    <td className="p-3 font-mono font-extrabold text-slate-900">{c.totalBookings} trips</td>
                    <td className="p-3 font-mono font-black text-emerald-600">₹{c.lifetimeValue}</td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingCust(c);
                          setFormData({ name: c.name, email: c.email, phone: c.phone, totalBookings: c.totalBookings, lifetimeValue: c.lifetimeValue });
                          setModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingCust(c)}
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

      {/* TAB 2: VISUAL SEAT MAP OVERRIDE & MANIFEST */}
      {activeTab === 'seat_map' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Real-Time Interactive Seat Allocation & Lock Grid</h3>
              <p className="text-xs text-slate-500">Click any seat to toggle status: <strong className="text-emerald-600">Available (Green)</strong> &rarr; <strong className="text-red-600">Booked (Red)</strong> &rarr; <strong className="text-amber-600">Blocked (Yellow)</strong>.</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handlePrintPDF} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1">
                <Printer className="w-4 h-4" /> Print PDF Manifest
              </button>
              <button onClick={handleExportCSV} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                <FileSpreadsheet className="w-4 h-4" /> CSV Export
              </button>
            </div>
          </div>

          {/* Seat Grid Visual Representation */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-200">
              <span>🛞 Driver Compartment</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600"></span> Booked</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500"></span> Blocked</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((seatNum) => {
                const status = seatMap[seatNum] || 'AVAILABLE';
                return (
                  <button
                    key={seatNum}
                    onClick={() => handleToggleSeatState(seatNum)}
                    className={`py-3 rounded-2xl font-mono font-black text-xs border-2 transition shadow-sm cursor-pointer ${
                      status === 'AVAILABLE'
                        ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
                        : status === 'BOOKED'
                        ? 'bg-red-600 border-red-700 text-white hover:bg-red-700'
                        : 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600'
                    }`}
                  >
                    Seat #{seatNum}
                    <span className="block text-[9px] font-sans font-normal uppercase opacity-90">{status}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingCust ? 'Edit Customer Record' : 'Add Offline Customer Profile'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9811223344"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {editingCust ? 'Save Customer Record' : 'Create Customer Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-red-600 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Customer Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete customer <strong className="text-slate-900">"{deletingCust.name}"</strong>? This will purge their profile data.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCust(null)}
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
