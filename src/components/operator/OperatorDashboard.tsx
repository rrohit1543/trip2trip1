'use client';

import React, { useState } from 'react';
import { User, Trip, LiveTelemetry, Booking, OperatorKYC, PaymentSplitLedger } from '../../types';
import LiveTripMap from '../map/LiveTripMap';
import { Bus, Radio, Plus, Users, ShieldAlert, Play, Square, AlertCircle, FileText, CheckCircle2, DollarSign, Calendar } from 'lucide-react';

interface OperatorDashboardProps {
  currentUser: User | null;
  trips: Trip[];
  telemetry: Record<string, LiveTelemetry>;
  bookings: Booking[];
  operatorKYC: OperatorKYC[];
  paymentSplits: PaymentSplitLedger[];
  onOpenCreateTrip: () => void;
  onOpenKYC: () => void;
  onToggleLiveTrip: (tripId: string) => void;
}

export default function OperatorDashboard({
  currentUser,
  trips,
  telemetry,
  bookings,
  operatorKYC,
  paymentSplits,
  onOpenCreateTrip,
  onOpenKYC,
  onToggleLiveTrip,
}: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'fleet' | 'payouts' | 'manifest'>('fleet');

  const operatorTrips = trips.filter((t) => (currentUser ? t.operatorId === currentUser.id : true));
  const [activeTripId, setActiveTripId] = useState<string>(operatorTrips[0]?.id || 'trip_1');

  const selectedTrip = operatorTrips.find((t) => t.id === activeTripId) || operatorTrips[0];
  const selectedTelem = selectedTrip ? telemetry[selectedTrip.id] : undefined;
  const tripBookings = selectedTrip ? bookings.filter((b) => b.tripId === selectedTrip.id) : [];

  const myKYC = currentUser ? operatorKYC.find((k) => k.operatorId === currentUser.id) || operatorKYC[0] : operatorKYC[0];
  const mySplits = paymentSplits.filter((s) => (currentUser ? s.operatorId === currentUser.id : true));

  const totalGrossRevenue = mySplits.reduce((sum, s) => sum + s.grossAmount, 0);
  const totalCommissionDeducted = mySplits.reduce((sum, s) => sum + s.platformCommissionAmount + s.gstOnCommissionAmount + s.tdsAmount, 0);
  const totalNetSettled = mySplits.reduce((sum, s) => sum + s.agencyNetSettlementAmount, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white">{currentUser?.operatorCompany || 'Tour Operator Agency Panel'}</h1>
            {myKYC?.status === 'approved' ? (
              <span className="bg-neutral-200 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-red-500" /> VERIFIED VENDOR (PENNY DROP PASSED)
              </span>
            ) : (
              <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> KYC APPROVAL PENDING
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage tour packages, trigger live GPS broadcasts, view split payout ledger & passenger manifest.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-200 dark:bg-neutral-950 p-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-900 text-xs font-bold">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'fleet' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Fleet & Live GPS
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'payouts' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Payout Ledger
            </button>
          </div>

          {myKYC?.status !== 'approved' && (
            <button
              onClick={onOpenKYC}
              className="bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 border border-neutral-300 dark:border-red-900 font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4 text-red-500" />
              <span>Submit KYC</span>
            </button>
          )}

          <button
            onClick={onOpenCreateTrip}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Group Package</span>
          </button>
        </div>
      </div>

      {/* Financial Marketplace Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-5 rounded-3xl shadow-lg">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wider">Gross Booking Sales</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">₹{totalGrossRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-neutral-500 mt-1">{mySplits.length} confirmed bookings</div>
        </div>

        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-5 rounded-3xl shadow-lg">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wider">Platform Commission + GST/TDS</div>
          <div className="text-2xl font-black text-red-600 dark:text-red-500 mt-1">₹{Math.round(totalCommissionDeducted).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Auto-deducted at checkout</div>
        </div>

        <div className="bg-neutral-100 dark:bg-black border-2 border-red-600/40 p-5 rounded-3xl shadow-lg">
          <div className="text-xs text-red-600 dark:text-red-500 uppercase font-bold tracking-wider">Net Bank Settlement (T+1)</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">₹{Math.round(totalNetSettled).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Routed to Verified Bank ({myKYC?.bankAccount || 'HDFC Bank'})</div>
        </div>
      </div>

      {activeTab === 'payouts' && (
        <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-500" /> Agency Settlement & Payout Breakdown
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Granular booking-by-booking breakdown of platform commission, GST/TDS, and net payout status.</p>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Penny Drop Status: VERIFIED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-neutral-800 dark:text-neutral-300">
              <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-200 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-900">
                <tr>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Gross Fare</th>
                  <th className="p-3">Commission Deducted</th>
                  <th className="p-3">GST (18%) + TDS (1%)</th>
                  <th className="p-3">Net Agency Settlement</th>
                  <th className="p-3">Settlement Schedule</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900 font-mono">
                {mySplits.map((split) => (
                  <tr key={split.id} className="hover:bg-neutral-200 dark:hover:bg-neutral-950">
                    <td className="p-3 font-bold text-red-600 dark:text-red-500">#{split.bookingId}</td>
                    <td className="p-3 font-sans font-bold text-neutral-900 dark:text-white">{split.customerName}</td>
                    <td className="p-3 font-bold text-neutral-900 dark:text-white">₹{split.grossAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-red-600 dark:text-red-500 font-bold">₹{split.platformCommissionAmount.toLocaleString('en-IN')} ({split.platformCommissionPercentage}%)</td>
                    <td className="p-3 text-neutral-500">₹{(split.gstOnCommissionAmount + split.tdsAmount).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-neutral-900 dark:text-white">₹{split.agencyNetSettlementAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-neutral-500">{split.settlementSchedule}</td>
                    <td className="p-3">
                      <span className="bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
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

      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Bus className="w-4 h-4 text-red-500" /> My Published Tour Packages ({operatorTrips.length})
            </h3>

            <div className="space-y-3">
              {operatorTrips.map((t) => {
                const isSelected = t.id === selectedTrip?.id;
                const isLive = t.status === 'live';

                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTripId(t.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-200 dark:bg-neutral-950 border-red-600 shadow-xl ring-1 ring-red-600/30'
                        : 'bg-neutral-100 dark:bg-black border-neutral-200 dark:border-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{t.name}</h4>
                      {isLive ? (
                        <span className="flex items-center gap-1 text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          LIVE ON ROAD
                        </span>
                      ) : (
                        <span className="text-[10px] bg-neutral-300 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                          UPCOMING
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.departureCity} &rarr; {t.destinationCity}</p>
                    <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-900 font-mono">
                      <span>Seats: <strong className="text-red-600 dark:text-red-500">{t.totalSeats - t.availableSeats} / {t.totalSeats} Booked</strong></span>
                      <span>Bus: <strong>{t.vehicle.regNumber}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedTrip && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 dark:text-white">{selectedTrip.name}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Bus Reg: <span className="font-mono text-neutral-900 dark:text-white font-bold">{selectedTrip.vehicle.regNumber}</span></p>
                  </div>

                  <button
                    onClick={() => onToggleLiveTrip(selectedTrip.id)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-2xl transition-all ${
                      selectedTrip.status === 'live'
                        ? 'bg-neutral-200 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-800'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                    }`}
                  >
                    {selectedTrip.status === 'live' ? (
                      <>
                        <Square className="w-4 h-4 fill-red-500 text-red-500" />
                        <span>End Live GPS Broadcast</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>START LIVE GPS BROADCAST</span>
                      </>
                    )}
                  </button>
                </div>

                <LiveTripMap trip={selectedTrip} telemetry={selectedTelem} height="360px" />
              </div>

              {/* Passenger Manifest */}
              <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-500" /> Passenger Manifest ({tripBookings.length})
                  </h4>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Real-Time Boarding Tracker</span>
                </div>

                {tripBookings.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">No passenger bookings recorded for this trip yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-neutral-800 dark:text-neutral-300">
                      <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-200 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-900">
                        <tr>
                          <th className="p-3">Passenger</th>
                          <th className="p-3">Seats</th>
                          <th className="p-3">Boarding Point</th>
                          <th className="p-3">Fare Paid</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900 font-mono">
                        {tripBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-neutral-200 dark:hover:bg-neutral-950">
                            <td className="p-3 font-sans font-bold text-neutral-900 dark:text-white">
                              {b.customerName}
                              <div className="text-[10px] text-neutral-500 font-normal">{b.customerPhone}</div>
                            </td>
                            <td className="p-3 font-bold text-red-600 dark:text-red-500">S{b.selectedSeats.join(', S')}</td>
                            <td className="p-3 font-sans">{b.pickupPoint}</td>
                            <td className="p-3 font-bold text-neutral-900 dark:text-white">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                            <td className="p-3">
                              <span className="bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                BOARDED
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
