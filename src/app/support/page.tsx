'use client';

import React from 'react';
import { useTrip2TripStore } from '../../lib/store';
import Navbar from '../../components/common/Navbar';
import SupportDesk from '../../components/support/SupportDesk';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const router = useRouter();
  const {
    currentUser,
    supportTickets,
    createSupportTicket,
    addTicketMessage,
    updateTicketStatus,
    processTicketRefund,
    logoutUser,
  } = useTrip2TripStore();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white font-sans selection:bg-red-600 selection:text-white flex flex-col transition-colors duration-200">
      <Navbar
        currentUser={currentUser}
        onOpenAuthModal={() => router.push('/login')}
        onOpenAdminAuthModal={() => router.push('/admin/login')}
        onLogout={logoutUser}
        activeTab="support"
        setActiveTab={(tab) => {
          if (tab === 'explore') router.push('/');
        }}
      />

      <main className="flex-1 pb-20">
        <SupportDesk
          currentUser={currentUser}
          tickets={supportTickets}
          onCreateTicket={createSupportTicket}
          onAddTicketMessage={addTicketMessage}
          onUpdateTicketStatus={updateTicketStatus}
          onProcessRefund={processTicketRefund}
        />
      </main>
    </div>
  );
}
