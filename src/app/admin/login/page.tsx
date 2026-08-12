'use client';

import React, { useState } from 'react';
import { useTripMandiStore } from '../../../lib/store';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Mail, Lock, KeyRound, AlertTriangle, ArrowRight, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { currentUser, loginAdminWithGoogleOAuth, requestAdminLoginMFA, verifyAdminMFA, logoutUser } = useTripMandiStore();

  const [step, setStep] = useState<'google_oauth' | 'credentials' | 'mfa'>('google_oauth');
  const [googleEmailInput, setGoogleEmailInput] = useState('admin@tripmandi.com');
  const [adminIdentifier, setAdminIdentifier] = useState('admin@tripmandi.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const [alert, setAlert] = useState<{ type: 'error' | 'info'; message: string } | null>(null);
  const [demoMfaCode, setDemoMfaCode] = useState<string | null>(null);

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = loginAdminWithGoogleOAuth(googleEmailInput, 'Super Admin', `google_sub_${Date.now()}`);
    if (res.success) {
      router.push('/admin/dashboard');
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

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
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-red-600 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar
          currentUser={currentUser}
          onOpenAuthModal={() => router.push('/login')}
          onOpenAdminAuthModal={() => {}}
          onLogout={logoutUser}
          activeTab="explore"
          setActiveTab={() => router.push('/')}
        />

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-6 bg-slate-50 border-b border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600 flex items-center justify-center mx-auto text-red-600">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Super Admin Portal</h1>
              <p className="text-xs text-red-600 font-extrabold uppercase tracking-wider">Google OAuth Restricted Login</p>
            </div>

            <div className="p-3 bg-rose-50 border-b border-rose-200 text-[11px] text-red-800 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>Restricted Admin Portal. Customer and Operator accounts are strictly forbidden.</span>
            </div>

            {alert && (
              <div className={`p-3 text-xs font-bold flex items-start gap-2 border-b ${
                alert.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}>
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{alert.message}</span>
              </div>
            )}

            <div className="p-6 space-y-4 bg-white text-slate-900">
              {step === 'google_oauth' && (
                <form onSubmit={handleGoogleSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-black text-slate-900">Sign In with Google Admin (Gmail)</h4>
                    <p className="text-xs text-slate-500">Authenticate using an authorized Super Admin Gmail address.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Authorized Admin Gmail Address
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-red-600">
                      <Mail className="w-4 h-4 text-red-600 shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="admin@tripmandi.com or admin@gmail.com"
                        value={googleEmailInput}
                        onChange={(e) => setGoogleEmailInput(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Authenticate via Google OAuth</span>
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
                    >
                      Use Legacy Admin MFA Credentials
                    </button>
                  </div>
                </form>
              )}

              {step === 'credentials' && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Administrator Identifier
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 focus-within:border-red-600">
                      <Mail className="w-4 h-4 text-red-600 shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="admin@tripmandi.com"
                        value={adminIdentifier}
                        onChange={(e) => setAdminIdentifier(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Administrator Password
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 focus-within:border-red-600">
                      <Lock className="w-4 h-4 text-red-600 shrink-0" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
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

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setStep('google_oauth')}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
                    >
                      &larr; Return to Google OAuth Admin Login
                    </button>
                  </div>
                </form>
              )}

              {step === 'mfa' && (
                <form onSubmit={handleMFASubmit} className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600 flex items-center justify-center mx-auto text-red-600">
                    <KeyRound className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Mandatory Admin 2FA MFA OTP</h4>
                    <p className="text-xs text-slate-500 mt-1">Sent to <strong className="text-slate-900">{adminIdentifier}</strong></p>
                    {demoMfaCode && (
                      <span className="inline-block mt-2 bg-slate-100 border border-red-600 text-red-600 px-3 py-1 rounded-full text-xs font-mono font-bold">
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
                      className="w-full bg-slate-50 border-2 border-red-600 text-center tracking-[0.5em] text-xl font-mono font-black text-slate-900 py-3 rounded-2xl focus:outline-none"
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

      <Footer />
    </div>
  );
}
