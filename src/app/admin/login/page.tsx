'use client';

import React, { useState } from 'react';
import { useTripMandiStore } from '../../../lib/store';
import Navbar from '../../../components/common/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Mail, Lock, KeyRound, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { currentUser, requestAdminLoginMFA, verifyAdminMFA, logoutUser } = useTripMandiStore();

  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [adminIdentifier, setAdminIdentifier] = useState('admin@TripMandi.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const [alert, setAlert] = useState<{ type: 'error' | 'info'; message: string } | null>(null);
  const [demoMfaCode, setDemoMfaCode] = useState<string | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = requestAdminLoginMFA(adminIdentifier, adminPassword);
    if (res.success && res.mfaRequired) {
      setDemoMfaCode(res.code || null);
      setStep('mfa');
      setAlert({ type: 'info', message: res.message });
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  const handleMFASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = verifyAdminMFA(adminIdentifier, mfaCode);
    if (res.success) {
      router.push('/admin/dashboard');
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white flex flex-col">
      <Navbar
        currentUser={currentUser}
        onOpenAuthModal={() => router.push('/login')}
        onOpenAdminAuthModal={() => {}}
        onLogout={logoutUser}
        activeTab="explore"
        setActiveTab={() => router.push('/')}
      />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black border-2 border-red-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
          <div className="p-6 bg-neutral-950 border-b border-red-900/60 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600 flex items-center justify-center mx-auto text-red-500">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white">Super Admin Portal</h1>
            <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Separate Restricted Authentication</p>
          </div>

          <div className="p-3 bg-red-950/80 border-b border-red-800 text-[11px] text-red-300 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>Restricted Admin Portal. Customer and Operator accounts are strictly forbidden.</span>
          </div>

          {alert && (
            <div className={`p-3 text-xs font-bold flex items-start gap-2 border-b ${
              alert.type === 'error' ? 'bg-red-950 text-red-400 border-red-700' : 'bg-neutral-950 text-red-300 border-red-900'
            }`}>
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{alert.message}</span>
            </div>
          )}

          <div className="p-6 space-y-4">
            {step === 'credentials' ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Administrator Identifier
                  </label>
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-3 focus-within:border-red-600">
                    <Mail className="w-4 h-4 text-red-500 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="admin@TripMandi.com"
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white focus:outline-none placeholder-neutral-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Administrator Password
                  </label>
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-3 focus-within:border-red-600">
                    <Lock className="w-4 h-4 text-red-500 shrink-0" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white focus:outline-none placeholder-neutral-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
                >
                  <span>Authenticate & Request 2FA MFA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleMFASubmit} className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600 flex items-center justify-center mx-auto text-red-500">
                  <KeyRound className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">Mandatory Admin 2FA MFA OTP</h4>
                  <p className="text-xs text-neutral-400 mt-1">Sent to <strong className="text-white">{adminIdentifier}</strong></p>
                  {demoMfaCode && (
                    <span className="inline-block mt-2 bg-neutral-950 border border-red-600 text-red-400 px-3 py-1 rounded-full text-xs font-mono font-bold">
                      DEMO MFA CODE: {demoMfaCode}
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="0 0 0 0 0 0"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="w-full bg-neutral-950 border-2 border-red-600 text-center tracking-[0.5em] text-xl font-mono font-black text-white py-3 rounded-2xl focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition"
                >
                  Verify 2FA MFA & Grant Admin Access
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
