'use client';

import React, { useState, useEffect } from 'react';
import { useTripMandiStore } from '../../lib/store';
import Navbar from '../../components/common/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { currentUser, requestPasswordReset, resetPasswordWithOTP, logoutUser } = useTripMandiStore();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [alert, setAlert] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300);

  useEffect(() => {
    let interval: any;
    if (step === 'reset' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = requestPasswordReset(identifier);
    setDemoCode(res.otpCode || null);
    setTimerSeconds(300);
    setStep('reset');
    setAlert({ type: 'info', message: res.message });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (newPassword !== confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    const res = resetPasswordWithOTP(identifier, otpCode, newPassword);
    if (res.success) {
      setAlert({ type: 'success', message: res.message });
      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white flex flex-col">
      <Navbar
        currentUser={currentUser}
        onOpenAuthModal={() => {}}
        onOpenAdminAuthModal={() => router.push('/admin/login')}
        onLogout={logoutUser}
        activeTab="explore"
        setActiveTab={() => router.push('/')}
      />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black border-2 border-neutral-900 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600 flex items-center justify-center mx-auto text-red-500 font-mono font-bold text-xl">
              2
            </div>
            <h1 className="text-2xl font-black text-white">
              {step === 'request' ? 'Password Reset (OWASP)' : 'Set New Password'}
            </h1>
            <p className="text-xs text-neutral-400">Single-Use OTP & Session Invalidation Controls</p>
          </div>

          {alert && (
            <div className={`p-3 text-xs font-bold rounded-xl flex items-start gap-2 border ${
              alert.type === 'error' ? 'bg-red-950/90 text-red-400 border-red-700' : alert.type === 'success' ? 'bg-neutral-900 text-white border-neutral-700' : 'bg-neutral-950 text-red-300 border-red-900'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{alert.message}</span>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Registered Mobile Number or Email Address
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-3 focus-within:border-red-600">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210 or user@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none placeholder-neutral-600"
                  />
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Following OWASP security recommendations, a single-use 5-minute OTP code will be dispatched to your registered contact.
              </p>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition"
              >
                Send Reset OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {demoCode && (
                <div className="text-center">
                  <span className="bg-neutral-900 border border-red-600 text-red-400 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    DEMO RESET OTP: {demoCode}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">6-Digit Reset OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="0 0 0 0 0 0"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-neutral-950 border-2 border-red-600 text-center tracking-[0.5em] text-lg font-mono font-black text-white py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Timer: <strong className="text-red-500 font-mono">{formatTimer(timerSeconds)}</strong></span>
                <span className="text-[11px]">Max 3 Verification Attempts</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="text-[10px] text-neutral-500">
                Successful reset immediately invalidates all active user sessions per OWASP guidelines.
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition"
              >
                Reset Password & Require Re-login
              </button>
            </form>
          )}

          <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-900">
            Remember your password?{' '}
            <Link href="/login" className="text-red-500 font-bold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
