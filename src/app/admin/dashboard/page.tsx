'use client';

import React, { useState } from 'react';
import { useTrip2TripStore } from '../../../lib/store';
import Navbar from '../../../components/common/Navbar';
import AdminDashboard from '../../../components/admin/AdminDashboard';
import TripDetailModal from '../../../components/customer/TripDetailModal';
import { Trip } from '../../../types';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    users,
    operatorKYC,
    trips,
    telemetry,
    bookings,
    securityLogs,
    commissionRules,
    paymentSplits,
    supportTickets,
    updateCommissionRule,
    updateKYCStatus,
    logoutUser,
  } = useTrip2TripStore();

  const [detailTrip, setDetailTrip] = useState<Trip | null>(null);

  // RBAC protection check
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white flex flex-col items-center justify-center p-4 space-y-4">
        <h2 className="text-xl font-bold text-red-500">Access Denied &mdash; Restricted Administrator Area</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">You must authenticate via the Super Admin Portal to access this dashboard.</p>
        <button
          onClick={() => router.push('/admin/login')}
          className="px-6 py-2.5 rounded-xl bg-red-600 font-bold text-white text-xs"
        >
          Go to Admin Portal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white font-sans selection:bg-red-600 selection:text-white flex flex-col transition-colors duration-200">
      <Navbar
        currentUser={currentUser}
        onOpenAuthModal={() => router.push('/login')}
        onOpenAdminAuthModal={() => {}}
        onLogout={logoutUser}
        activeTab="admin-dash"
        setActiveTab={(tab) => {
          if (tab === 'explore') router.push('/');
        }}
      />

      <main className="flex-1 pb-20">
        <AdminDashboard
          operatorKYC={operatorKYC}
          trips={trips}
          telemetry={telemetry}
          bookings={bookings}
          users={users}
          securityLogs={securityLogs}
          commissionRules={commissionRules}
          paymentSplits={paymentSplits}
          supportTickets={supportTickets}
          onUpdateCommissionRule={updateCommissionRule}
          onUpdateKYCStatus={updateKYCStatus}
          onSelectTripToTrack={(t) => setDetailTrip(t)}
        />
      </main>

      <TripDetailModal
        trip={detailTrip}
        onClose={() => setDetailTrip(null)}
        onBookSeats={() => {}}
      />
    </div>
  );
}
