'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Key,
} from 'lucide-react';
import {
  operatorsStore,
  addOperator,
  editOperator,
  deleteOperator,
  OperatorEntity,
  OperatorSubRole,
} from '@/lib/operatorsManager';

export default function OperatorsManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<OperatorEntity | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: 'Himalayan Yatra Logistics',
    subRole: 'TRIP_MANAGER' as OperatorSubRole,
    permissions: ['create_trip', 'edit_trip', 'view_manifest'],
  });

  const [deletingOp, setDeletingOp] = useState<OperatorEntity | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const operatorsList = Object.values(operatorsStore);

  const availablePermissions = [
    { key: 'create_trip', label: 'Create Trips' },
    { key: 'edit_trip', label: 'Edit Trip Details' },
    { key: 'delete_trip', label: 'Delete Trip Listings' },
    { key: 'assign_driver', label: 'Assign Fleet & Drivers' },
    { key: 'view_manifest', label: 'View Passenger Manifests' },
    { key: 'process_refunds', label: 'Issue Ticket Refunds' },
  ];

  const handleTogglePermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      setFormData({ ...formData, permissions: formData.permissions.filter((p) => p !== perm) });
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, perm] });
    }
  };

  const handleSaveOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOperator) {
      editOperator(editingOperator.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        subRole: formData.subRole,
        permissions: formData.permissions,
      });
      setToast(`Operator account "${formData.name}" updated.`);
    } else {
      addOperator({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        subRole: formData.subRole,
        permissions: formData.permissions,
        status: 'ACTIVE',
      });
      setToast(`New Operator account "${formData.name}" created.`);
    }
    setModalOpen(false);
    setEditingOperator(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleConfirmDelete = () => {
    if (!deletingOp) return;
    deleteOperator(deletingOp.id);
    setToast(`Operator profile "${deletingOp.name}" revoked and deleted.`);
    setDeletingOp(null);
    setRefreshKey((prev) => prev + 1);
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" /> Operators & Admin Sub-Roles Management
          </h2>
          <p className="text-xs text-slate-500">Configure Operator staff accounts, assign granular role permissions (Dispatchers, Support, Managers).</p>
        </div>

        <button
          onClick={() => {
            setEditingOperator(null);
            setFormData({ name: '', email: '', phone: '', companyName: 'Himalayan Yatra Logistics', subRole: 'TRIP_MANAGER', permissions: ['create_trip', 'edit_trip', 'view_manifest'] });
            setModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Add Operator Profile
        </button>
      </div>

      {/* Operators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {operatorsList.map((op) => (
          <div key={op.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 text-sm">{op.name}</h4>
                <p className="text-[11px] text-slate-500 font-mono">{op.email}</p>
              </div>
              <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-red-200">
                {op.subRole}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-red-600" /> Agency: {op.companyName}</div>
              <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-red-600" /> Phone: {op.phone}</div>
            </div>

            {/* Granular Permissions Badges */}
            <div className="pt-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Permissions:</div>
              <div className="flex flex-wrap gap-1">
                {op.permissions.map((p) => (
                  <span key={p} className="bg-white border border-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setEditingOperator(op);
                  setFormData({ name: op.name, email: op.email, phone: op.phone, companyName: op.companyName, subRole: op.subRole, permissions: op.permissions });
                  setModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
              >
                Edit Permissions
              </button>
              <button
                onClick={() => setDeletingOp(op)}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-[11px]"
              >
                Revoke & Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* OPERATOR ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingOperator ? 'Edit Operator Scope' : 'Add Operator Account'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOperator} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operator Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Vikram Singh"
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
                    placeholder="vikram@himalayanyatra.com"
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
                    placeholder="+91 9812345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sub-Role Assignment</label>
                <select
                  value={formData.subRole}
                  onChange={(e) => setFormData({ ...formData, subRole: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                >
                  <option value="TRIP_MANAGER">Trip Manager (Full Trip Builder)</option>
                  <option value="DISPATCHER">Fleet Dispatcher (Bus & Driver Assign)</option>
                  <option value="SUPPORT">Support Agent (Manifest & Passenger Check-in)</option>
                  <option value="FINANCE_AUDITOR">Finance Auditor (Ledger & Payouts)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Granular Scope Permissions</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {availablePermissions.map((p) => (
                    <label key={p.key} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(p.key)}
                        onChange={() => handleTogglePermission(p.key)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {editingOperator ? 'Save Operator Profile' : 'Create Operator Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-red-600 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Revoke Operator Profile?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-900">"{deletingOp.name}"</strong>? This will immediately revoke their dashboard access.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingOp(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-extrabold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Revoke & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
