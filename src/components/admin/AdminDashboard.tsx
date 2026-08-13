'use client';

import React, { useState } from 'react';
import { OperatorKYC, Trip, LiveTelemetry, Booking, User, SecurityEvent, CommissionRule, PaymentSplitLedger, SupportTicket, AccountStatus, UserRole } from '../../types';
import GlobalFleetMap from '../map/GlobalFleetMap';
import SeatLayoutEditor from './SeatLayoutEditor';
import { ShieldAlert, Radio, CheckCircle2, XCircle, Users, Bus, FileText, Lock, ShieldCheck, Clock, Percent, DollarSign, LifeBuoy, ArrowRight, Save, UserCheck, UserX, Key, Shield, Zap } from 'lucide-react';

interface AdminDashboardProps {
  operatorKYC: OperatorKYC[];
  trips: Trip[];
  telemetry: Record<string, LiveTelemetry>;
  bookings: Booking[];
  users: User[];
  securityLogs: SecurityEvent[];
  commissionRules: CommissionRule[];
  paymentSplits: PaymentSplitLedger[];
  supportTickets: SupportTicket[];
  onUpdateCommissionRule: (rule: any) => void;
  onUpdateKYCStatus: (kycId: string, status: 'approved' | 'rejected', reason?: string) => void;
  onUpdateUserStatus?: (userId: string, status: AccountStatus) => void;
  onUpdateUserRole?: (userId: string, role: UserRole) => void;
  onSelectTripToTrack: (trip: Trip) => void;
}

export default function AdminDashboard({
  operatorKYC,
  trips,
  telemetry,
  bookings,
  users,
  securityLogs,
  commissionRules,
  paymentSplits,
  supportTickets,
  onUpdateCommissionRule,
  onUpdateKYCStatus,
  onUpdateUserStatus,
  onUpdateUserRole,
  onSelectTripToTrack,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'radar' | 'seat_layout' | 'user_management' | 'kyc' | 'commission_engine' | 'split_ledger' | 'security_logs'>('seat_layout');
  const [selectedKYC, setSelectedKYC] = useState<OperatorKYC | null>(operatorKYC[0] || null);

  // User Search & Role Filters
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Commission Engine UI form state
  const [globalRateInput, setGlobalRateInput] = useState('10');

  const pendingKYC = operatorKYC.filter((k) => k.status === 'pending');

  const totalGMV = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPlatformCommission = paymentSplits.reduce((sum, s) => sum + s.platformCommissionAmount, 0);
  const totalNetSettledToAgencies = paymentSplits.reduce((sum, s) => sum + s.agencyNetSettlementAmount, 0);
  const activeLiveTripsCount = trips.filter((t) => t.status === 'live').length;

  const handleSaveGlobalCommission = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCommissionRule({
      level: 'global',
      commissionPercentage: Number(globalRateInput),
    });
    alert(`Global base platform commission updated to ${globalRateInput}%`);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 font-sans bg-white">
      {/* Header Banner */}
      <div className="bg-white border-2 border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-600 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Google OAuth Authenticated Super Admin Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">Platform Owner Control & RBAC Center</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            RedBus visual seat pricing matrix editor, Google OAuth admin session validation, dynamic surge pricing rules, and nodal escrow split ledgers.
          </p>
        </div>

        {/* Global Performance Cards */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Total Platform GMV</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">₹{totalGMV.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-center">
            <div className="text-[10px] text-red-600 uppercase font-bold">Net Commission Earned</div>
            <div className="text-xl font-black text-red-600 mt-0.5">₹{totalPlatformCommission.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('seat_layout')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'seat_layout' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Dynamic Seat Pricing Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('user_management')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'user_management' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'radar' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Fleet Radar ({activeLiveTripsCount} Live)</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'kyc' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Vendor KYC Applications ({pendingKYC.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('commission_engine')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'commission_engine' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Commission Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('split_ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'split_ledger' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Payment Split Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('security_logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'security_logs' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>OWASP Audit Trail</span>
        </button>
      </div>

      {/* TAB 0: REDBUS DYNAMIC SEAT LAYOUT EDITOR */}
      {activeTab === 'seat_layout' && (
        <SeatLayoutEditor tripId={trips[0]?.id || 'trip_demo_1'} />
      )}

      {/* TAB 1: ADMIN USER MANAGEMENT TABULAR DASHBOARD */}
      {activeTab === 'user_management' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" /> Registered User Accounts Table (RBAC Management)
              </h3>
              <p className="text-xs text-slate-500">Monitor all registered buyers, sellers, customer agents, and admins across TripMandi.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search name, email, or ID..."
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600 w-48"
              />

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer (Buyer)</option>
                <option value="operator">Vendor Agency (Seller)</option>
                <option value="support_agent">Support Agent</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>
          </div>

          {/* User Management Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-800">
              <thead className="text-[10px] text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Full Name & Contact</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Marketplace Role</th>
                  <th className="p-3">Registration Date</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">RBAC Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-red-600">{user.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-slate-300" />
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-800">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        user.role === 'admin'
                          ? 'bg-rose-100 text-red-700 border-rose-300'
                          : user.role === 'operator'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : user.role === 'support_agent'
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : '2026-08-01'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.status === 'disabled'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {user.status === 'disabled' ? (
                          <button
                            onClick={() => onUpdateUserStatus && onUpdateUserStatus(user.id, 'active')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <UserCheck className="w-3 h-3" /> Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateUserStatus && onUpdateUserStatus(user.id, 'disabled')}
                            className="bg-slate-200 hover:bg-red-600 hover:text-white text-slate-800 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <UserX className="w-3 h-3" /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NATIONAL FLEET RADAR */}
      {activeTab === 'radar' && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-600 animate-pulse" /> Live Telemetry Fleet Radar
            </h3>
            <span className="text-xs text-slate-500 font-mono">{activeLiveTripsCount} Active Live Tour Buses</span>
          </div>
          <GlobalFleetMap trips={trips} telemetry={telemetry} height="520px" onSelectTrip={onSelectTripToTrack} />
        </div>
      )}

      {/* TAB 3: VENDOR KYC APPLICATIONS */}
      {activeTab === 'kyc' && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-lg font-black text-slate-900">Vendor KYC Applications & Penny Drop Verification</h3>
            <span className="text-xs bg-red-600/10 text-red-600 px-3 py-1 rounded-full font-bold">
              {pendingKYC.length} Pending Approvals
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              {operatorKYC.map((kyc) => (
                <div
                  key={kyc.id}
                  onClick={() => setSelectedKYC(kyc)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedKYC?.id === kyc.id ? 'border-red-600 bg-rose-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{kyc.companyName}</h4>
                    <span className="text-[10px] uppercase font-bold text-red-600">{kyc.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">Owner: {kyc.ownerName} ({kyc.phone})</p>
                </div>
              ))}
            </div>

            {selectedKYC && (
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4">
                <h4 className="text-base font-black text-slate-900">{selectedKYC.companyName} Details</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><strong className="text-slate-500 block text-[10px] uppercase">GST Number</strong> {selectedKYC.gstNumber}</div>
                  <div><strong className="text-slate-500 block text-[10px] uppercase">Bank Account</strong> {selectedKYC.bankAccount} ({selectedKYC.ifscCode})</div>
                  <div><strong className="text-slate-500 block text-[10px] uppercase">Penny Drop Status</strong> VERIFIED ({selectedKYC.pennyDropRecipientName})</div>
                  <div><strong className="text-slate-500 block text-[10px] uppercase">UPI ID</strong> {selectedKYC.upiId}</div>
                </div>

                {selectedKYC.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => onUpdateKYCStatus(selectedKYC.id, 'approved')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Vendor KYC
                    </button>
                    <button
                      onClick={() => onUpdateKYCStatus(selectedKYC.id, 'rejected', 'Incomplete documents')}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject Application
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: COMMISSION ENGINE */}
      {activeTab === 'commission_engine' && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-xl">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Percent className="w-5 h-5 text-red-600" /> Platform Commission Rule Engine
          </h3>
          <form onSubmit={handleSaveGlobalCommission} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Global Platform Commission Rate (%)</label>
              <input
                type="number"
                value={globalRateInput}
                onChange={(e) => setGlobalRateInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Global Commission Rate
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: PAYMENT SPLIT LEDGER */}
      {activeTab === 'split_ledger' && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-600" /> Automated Nodal Payment Split Audit Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-800 font-mono">
              <thead className="text-[10px] text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="p-3">Escrow Txn ID</th>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Vendor Agency</th>
                  <th className="p-3">Gross Amount</th>
                  <th className="p-3">Commission Amount</th>
                  <th className="p-3">GST (18%) + TDS (1%)</th>
                  <th className="p-3">Net Settlement</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paymentSplits.map((split) => (
                  <tr key={split.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{split.nodalEscrowTransactionId}</td>
                    <td className="p-3 text-red-600">#{split.bookingId}</td>
                    <td className="p-3 font-sans font-bold">{split.operatorName}</td>
                    <td className="p-3 font-bold">₹{split.grossAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-red-600 font-bold">₹{split.platformCommissionAmount.toLocaleString('en-IN')} ({split.platformCommissionPercentage}%)</td>
                    <td className="p-3 text-slate-500">₹{(split.gstOnCommissionAmount + split.tdsAmount).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-slate-900">₹{split.agencyNetSettlementAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className="bg-red-600/10 text-red-600 border border-red-600/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {split.settlementStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: OWASP SECURITY LOGS */}
      {activeTab === 'security_logs' && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" /> OWASP Real-Time Audit Trail
          </h3>
          <div className="space-y-2">
            {securityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="text-red-600 font-bold">[{log.eventType}]</span> {log.details}
                </div>
                <span className="text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
