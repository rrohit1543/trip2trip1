'use client';

import React, { useState } from 'react';
import { OperatorKYC, Trip, LiveTelemetry, Booking, User, SecurityEvent, CommissionRule, PaymentSplitLedger, SupportTicket } from '../../types';
import GlobalFleetMap from '../map/GlobalFleetMap';
import { ShieldAlert, Radio, CheckCircle2, XCircle, Users, Bus, FileText, Lock, ShieldCheck, Clock, Percent, DollarSign, LifeBuoy, ArrowRight, Save } from 'lucide-react';

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
  onSelectTripToTrack,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'radar' | 'kyc' | 'commission_engine' | 'split_ledger' | 'security_logs'>('radar');
  const [selectedKYC, setSelectedKYC] = useState<OperatorKYC | null>(operatorKYC[0] || null);

  // Commission Engine UI form state
  const [globalRateInput, setGlobalRateInput] = useState('10');
  const [agencyOverrideInput, setAgencyOverrideInput] = useState('8');
  const [targetOperatorId, setTargetOperatorId] = useState('usr_operator_1');

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

  const handleSaveAgencyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const op = operatorKYC.find((k) => k.operatorId === targetOperatorId);
    onUpdateCommissionRule({
      level: 'agency',
      targetId: targetOperatorId,
      targetName: op ? op.companyName : 'Selected Agency',
      commissionPercentage: Number(agencyOverrideInput),
    });
    alert(`Agency Commission Override for ${op ? op.companyName : 'Agency'} updated to ${agencyOverrideInput}%`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Admin Command Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-100 dark:bg-black border-2 border-red-600/40 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-600 dark:text-red-500 border border-red-600/40 text-xs font-bold px-3 py-1 rounded-full uppercase mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Super Admin B2B2C Marketplace Control
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white">Platform Governance & Commission Engine</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Reconcile automated payment splits, override vendor commission rules, inspect Nodal Escrow logs & OWASP audit history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-neutral-200 dark:bg-neutral-950 p-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-900 text-xs font-bold">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'radar' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Live Fleet Radar
          </button>
          <button
            onClick={() => setActiveTab('commission_engine')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'commission_engine' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Commission Engine
          </button>
          <button
            onClick={() => setActiveTab('split_ledger')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'split_ledger' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Split Ledger
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'kyc' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>KYC Queue</span>
            {pendingKYC.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingKYC.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('security_logs')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'security_logs' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Financial Marketplace Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-5 rounded-3xl shadow-lg">
          <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Gross Merchandise Value (GMV)</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">₹{totalGMV.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-neutral-500 mt-1">{bookings.length} total customer bookings</div>
        </div>

        <div className="bg-neutral-100 dark:bg-black border border-red-600/40 p-5 rounded-3xl shadow-lg">
          <div className="text-[10px] text-red-600 dark:text-red-500 uppercase font-bold tracking-wider">Net Platform Revenue</div>
          <div className="text-2xl font-black text-red-600 dark:text-red-500 mt-1">₹{Math.round(totalPlatformCommission).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Auto-deducted via Split Gateway</div>
        </div>

        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-5 rounded-3xl shadow-lg">
          <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Net Agency Settlements</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">₹{Math.round(totalNetSettledToAgencies).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Routed to Escrow Nodal Account</div>
        </div>

        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-5 rounded-3xl shadow-lg">
          <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Support Desk Tickets</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
            <span>{supportTickets.length}</span>
            <LifeBuoy className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Customer Care Desk</div>
        </div>
      </div>

      {/* TAB 1: FLEET RADAR */}
      {activeTab === 'radar' && (
        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              National Live Fleet Radar
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              Click any active vehicle marker to view telemetry
            </span>
          </div>

          <GlobalFleetMap trips={trips} telemetry={telemetry} height="520px" onSelectTrip={onSelectTripToTrack} />
        </div>
      )}

      {/* TAB 2: DYNAMIC COMMISSION ENGINE */}
      {activeTab === 'commission_engine' && (
        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-red-500" /> Dynamic Commission Rule Engine
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Set global base platform commission rates or configure specific overrides for individual travel agencies/packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Global Rate Form */}
            <form onSubmit={handleSaveGlobalCommission} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-5 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-red-500" /> Global Base Platform Commission Rate
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Applied automatically to all standard agency bookings unless overridden.</p>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Global Base Rate (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={globalRateInput}
                    onChange={(e) => setGlobalRateInput(e.target.value)}
                    className="w-32 bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Global Rate</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Agency Override Form */}
            <form onSubmit={handleSaveAgencyOverride} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-5 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Bus className="w-4 h-4 text-red-500" /> Agency-Specific Commission Override
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure special negotiated rates for high-volume travel partners.</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Target Agency</label>
                  <select
                    value={targetOperatorId}
                    onChange={(e) => setTargetOperatorId(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                  >
                    {operatorKYC.map((k) => (
                      <option key={k.operatorId} value={k.operatorId}>
                        {k.companyName} ({k.ownerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Override Rate (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={agencyOverrideInput}
                      onChange={(e) => setAgencyOverrideInput(e.target.value)}
                      className="w-32 bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Apply Agency Override</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Active Rules List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Active Commission Rules Engine List</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-neutral-800 dark:text-neutral-300">
                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-200 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-900">
                  <tr>
                    <th className="p-3">Rule Level</th>
                    <th className="p-3">Target Partner</th>
                    <th className="p-3">Commission %</th>
                    <th className="p-3">Last Updated</th>
                    <th className="p-3">Updated By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900">
                  {commissionRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-neutral-200 dark:hover:bg-neutral-950">
                      <td className="p-3 font-bold uppercase text-red-600 dark:text-red-500">{rule.level}</td>
                      <td className="p-3 font-bold">{rule.targetName || 'All Agencies (Global)'}</td>
                      <td className="p-3 font-mono font-bold text-neutral-900 dark:text-white">{rule.commissionPercentage}%</td>
                      <td className="p-3 text-neutral-500">{new Date(rule.updatedAt).toLocaleDateString()}</td>
                      <td className="p-3 text-neutral-500">{rule.updatedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED PAYMENT SPLIT LEDGER */}
      {activeTab === 'split_ledger' && (
        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-500" /> Automated Payment Split & Settlement Audit Trail
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Real-time Nodal Escrow ledger showing Gross Revenue, Platform Commission, 18% GST, 1% TDS, and Net Agency Payout.
              </p>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Cashfree / Razorpay Route Compliant</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-neutral-800 dark:text-neutral-300">
              <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-200 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-900">
                <tr>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Agency</th>
                  <th className="p-3">Gross Fare</th>
                  <th className="p-3">Commission</th>
                  <th className="p-3">GST (18%)</th>
                  <th className="p-3">TDS (1%)</th>
                  <th className="p-3">Agency Net Payout</th>
                  <th className="p-3">Escrow Txn ID</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900 font-mono">
                {paymentSplits.map((split) => (
                  <tr key={split.id} className="hover:bg-neutral-200 dark:hover:bg-neutral-950">
                    <td className="p-3 font-bold text-red-600 dark:text-red-500">#{split.bookingId}</td>
                    <td className="p-3 font-sans font-bold text-neutral-900 dark:text-white">{split.operatorName}</td>
                    <td className="p-3 font-bold text-neutral-900 dark:text-white">₹{split.grossAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-red-600 dark:text-red-500 font-bold">
                      ₹{split.platformCommissionAmount.toLocaleString('en-IN')} ({split.platformCommissionPercentage}%)
                    </td>
                    <td className="p-3 text-neutral-500">₹{split.gstOnCommissionAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-neutral-500">₹{split.tdsAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-neutral-900 dark:text-white">₹{split.agencyNetSettlementAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-[10px] text-neutral-500">{split.nodalEscrowTransactionId}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        split.settlementStatus === 'settled'
                          ? 'bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/40'
                          : 'bg-neutral-300 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-400 dark:border-neutral-800'
                      }`}>
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

      {/* TAB 4: KYC QUEUE */}
      {activeTab === 'kyc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" /> Agency Applications ({operatorKYC.length})
            </h3>

            <div className="space-y-3">
              {operatorKYC.map((k) => {
                const isSelected = k.id === selectedKYC?.id;
                return (
                  <div
                    key={k.id}
                    onClick={() => setSelectedKYC(k)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-200 dark:bg-neutral-950 border-red-600 shadow-xl ring-1 ring-red-600/30'
                        : 'bg-neutral-100 dark:bg-black border-neutral-200 dark:border-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{k.companyName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        k.status === 'approved' ? 'bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/40' : 'bg-neutral-300 dark:bg-neutral-900 text-neutral-800 dark:text-white border border-neutral-400 dark:border-neutral-700'
                      }`}>
                        {k.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Owner: {k.ownerName} ({k.phone})</p>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 font-mono">
                      <span>Submitted: {new Date(k.createdAt).toLocaleDateString()}</span>
                      <span className="text-red-500 font-bold">Penny Drop: Verified</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedKYC && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 dark:text-white">{selectedKYC.companyName}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Owner: {selectedKYC.ownerName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedKYC.status === 'approved' ? 'bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/40' : 'bg-neutral-300 dark:bg-neutral-900 text-neutral-800 dark:text-white'
                  }`}>
                    {selectedKYC.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-white dark:bg-neutral-950 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-900">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold block">Aadhaar Card</span>
                    <span className="text-neutral-900 dark:text-white font-mono font-bold">{selectedKYC.aadhaarNumber}</span>
                  </div>

                  <div className="bg-white dark:bg-neutral-950 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-900">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold block">PAN Card</span>
                    <span className="text-neutral-900 dark:text-white font-mono font-bold">{selectedKYC.panNumber}</span>
                  </div>

                  <div className="bg-white dark:bg-neutral-950 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-900">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold block">GST Number</span>
                    <span className="text-red-600 dark:text-red-500 font-mono font-bold">{selectedKYC.gstNumber || 'N/A'}</span>
                  </div>

                  <div className="bg-white dark:bg-neutral-950 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-900">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold block">Penny Drop Verification</span>
                    <span className="text-red-600 dark:text-red-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched ({selectedKYC.ownerName.toUpperCase()})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-900">
                  <button
                    onClick={() => {
                      onUpdateKYCStatus(selectedKYC.id, 'rejected', 'Verification details missing');
                      alert(`KYC for ${selectedKYC.companyName} marked REJECTED.`);
                    }}
                    className="w-1/2 py-3 rounded-2xl bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <XCircle className="w-4 h-4 text-neutral-500" />
                    <span>Reject Application</span>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateKYCStatus(selectedKYC.id, 'approved');
                      alert(`KYC for ${selectedKYC.companyName} APPROVED!`);
                    }}
                    className="w-1/2 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>Approve Operator Profile</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SECURITY AUDIT LOGS */}
      {activeTab === 'security_logs' && (
        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" /> OWASP Security Audit Log History
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Real-time tracking of login events, OTP requests, password resets & 2FA MFA verification.</p>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">No raw passwords stored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-neutral-800 dark:text-neutral-300">
              <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-200 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-900">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Mobile / Email Identifier</th>
                  <th className="p-3">Audit Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900 font-mono">
                {securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-200 dark:hover:bg-neutral-950">
                    <td className="p-3 text-neutral-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-red-500 shrink-0" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        log.eventType.includes('SUCCESS')
                          ? 'bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/40'
                          : 'bg-neutral-300 dark:bg-neutral-900 text-neutral-800 dark:text-white border border-neutral-400 dark:border-neutral-800'
                      }`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-900 dark:text-white font-bold">{log.identifier}</td>
                    <td className="p-3 font-sans text-neutral-600 dark:text-neutral-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
