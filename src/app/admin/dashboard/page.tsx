'use client';

import React, { useState } from 'react';
import { useTripMandiStore } from '../../../lib/store';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';
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
    updateUserStatus,
    updateUserRole,
    logoutUser,
  } = useTripMandiStore();

  const [detailTrip, setDetailTrip] = useState<Trip | null>(null);

  // RBAC protection check
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-4 space-y-4">
        <h2 className="text-xl font-bold text-red-600">Access Denied &mdash; Restricted Administrator Area</h2>
        <p className="text-xs text-slate-500">You must authenticate via the Google OAuth Admin Portal to access this dashboard.</p>
        <button
          onClick={() => router.push('/admin/login')}
          className="px-6 py-2.5 rounded-xl bg-red-600 font-bold text-white text-xs shadow-lg shadow-red-600/30"
        >
          Go to Google OAuth Admin Portal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-600 selection:text-white flex flex-col justify-between">
      <div>
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
            onUpdateUserStatus={updateUserStatus}
            onUpdateUserRole={updateUserRole}
            onSelectTripToTrack={(t) => setDetailTrip(t)}
          />
        </main>

        <TripDetailModal
          trip={detailTrip}
          onClose={() => setDetailTrip(null)}
          onBookSeats={() => {}}
        />
      </div>

      <Footer />
    </div>
  );
}
