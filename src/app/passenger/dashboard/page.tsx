'use client';

import React, { useState } from 'react';
import { useTripMandiStore } from '../../../lib/store';
import Navbar from '../../../components/common/Navbar';
import PassengerDashboard from '../../../components/customer/PassengerDashboard';
import ChatWidget from '../../../components/common/ChatWidget';
import ReviewModal from '../../../components/common/ReviewModal';
import { useRouter } from 'next/navigation';

export default function PassengerDashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    trips,
    telemetry,
    bookings,
    chatMessages,
    addChatMessage,
    addReview,
    logoutUser,
  } = useTripMandiStore();

  const [activeChatTripId, setActiveChatTripId] = useState<string | null>(null);
  const [reviewTrip, setReviewTrip] = useState<{ tripId: string; operatorId: string } | null>(null);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white flex flex-col">
      <Navbar
        currentUser={currentUser}
        onOpenAuthModal={() => router.push('/login')}
        onOpenAdminAuthModal={() => router.push('/admin/login')}
        onLogout={logoutUser}
        activeTab="passenger-dash"
        setActiveTab={(tab) => {
          if (tab === 'explore') router.push('/');
        }}
      />

      <main className="flex-1 pb-20">
        <PassengerDashboard
          bookings={bookings}
          trips={trips}
          telemetry={telemetry}
          onOpenChat={(tripId) => setActiveChatTripId(tripId)}
          onOpenReview={(tripId, operatorId) => setReviewTrip({ tripId, operatorId })}
        />
      </main>

      <ChatWidget
        tripId={activeChatTripId}
        currentUser={currentUser}
        messages={chatMessages}
        onClose={() => setActiveChatTripId(null)}
        onSendMessage={addChatMessage}
      />

      {reviewTrip && (
        <ReviewModal
          tripId={reviewTrip.tripId}
          operatorId={reviewTrip.operatorId}
          customerId={currentUser ? currentUser.id : 'usr_customer_1'}
          customerName={currentUser ? currentUser.name : 'Rahul Sharma'}
          onClose={() => setReviewTrip(null)}
          onSubmitReview={addReview}
        />
      )}
    </div>
  );
}
