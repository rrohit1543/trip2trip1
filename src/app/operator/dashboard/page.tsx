'use client';

import React, { useState } from 'react';
import { useTripMandiStore } from '../../../lib/store';
import Navbar from '../../../components/common/Navbar';
import OperatorDashboard from '../../../components/operator/OperatorDashboard';
import OperatorRegistration from '../../../components/operator/OperatorRegistration';
import TripCreationWizard from '../../../components/operator/TripCreationWizard';
import { useRouter } from 'next/navigation';

export default function OperatorDashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    trips,
    telemetry,
    bookings,
    operatorKYC,
    paymentSplits,
    submitKYC,
    createTrip,
    toggleLiveTrip,
    logoutUser,
  } = useTripMandiStore();

  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white font-sans selection:bg-red-600 selection:text-white flex flex-col transition-colors duration-200">
      <Navbar
        currentUser={currentUser}
        onOpenAuthModal={() => router.push('/login')}
        onOpenAdminAuthModal={() => router.push('/admin/login')}
        onLogout={logoutUser}
        activeTab="operator-dash"
        setActiveTab={(tab) => {
          if (tab === 'explore') router.push('/');
        }}
      />

      <main className="flex-1 pb-20">
        <OperatorDashboard
          currentUser={currentUser}
          trips={trips}
          telemetry={telemetry}
          bookings={bookings}
          operatorKYC={operatorKYC}
          paymentSplits={paymentSplits}
          onOpenCreateTrip={() => setIsCreateTripOpen(true)}
          onOpenKYC={() => setIsKYCOpen(true)}
          onToggleLiveTrip={toggleLiveTrip}
        />
      </main>

      {isKYCOpen && (
        <OperatorRegistration
          operatorId={currentUser ? currentUser.id : 'usr_operator_1'}
          onClose={() => setIsKYCOpen(false)}
          onSubmitKYC={submitKYC}
        />
      )}

      {isCreateTripOpen && (
        <TripCreationWizard
          onClose={() => setIsCreateTripOpen(false)}
          onCreateTrip={createTrip}
        />
      )}
    </div>
  );
}
