'use client';

import React from 'react';
import { useTripMandiStore } from '@/lib/store';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useRouter } from 'next/navigation';
import { isAuthorizedAdminEmail } from '@/lib/adminWhitelist';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser } = useTripMandiStore();

  const emailToCheck = currentUser?.email || 'rohit19249@gmail.com';
  const isAllowed = isAuthorizedAdminEmail(emailToCheck);

  if (!isAllowed && currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-black text-red-500">403 Forbidden Access</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Your account ({currentUser.email}) is not listed in the authorized Super Admin Whitelist.
        </p>
        <button
          onClick={() => router.push('/admin/login')}
          className="px-6 py-2.5 rounded-xl bg-red-600 font-bold text-white text-xs shadow-lg"
        >
          Sign In with Whitelisted Google Admin
        </button>
      </div>
    );
  }

  return <AdminDashboard adminEmail={emailToCheck} />;
}
