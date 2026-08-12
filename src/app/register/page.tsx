'use client';

import React, { useState, useEffect } from 'react';
import { useTripMandiStore } from '../../lib/store';
import { UserRole } from '../../types';
import Navbar from '../../components/common/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { currentUser, registerUser, verifyRegistrationOTP, logoutUser } = useTripMandiStore();

  const [mode, setMode] = useState<'form' | 'otp'>('form');
  const [role, setRole] = useState<UserRole>('customer');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Mobile or Email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [alert, setAlert] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300);

  useEffect(() => {
    let interval: any;
    if (mode === 'otp' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timerSeconds]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    const res = registerUser(name, identifier, password, role);
    if (res.success) {
      setDemoCode(res.otpCode || null);
      setTimerSeconds(300);
      setMode('otp');
      setAlert({ type: 'info', message: res.message });
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = verifyRegistrationOTP(identifier, otpCode);
    if (res.success) {
      setAlert({ type: 'success', message: res.message });
      setTimeout(() => {
        if (role === 'operator') {
          router.push('/operator/dashboard');
        } else {
          router.push('/passenger/dashboard');
        }
      }, 1200);
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
              {mode === 'form' ? 'Create Your Account' : 'Verify Mobile / Email OTP'}
            </h1>
            <p className="text-xs text-neutral-400">Mobile Phone & Gmail Verification System</p>
          </div>

          {alert && (
            <div className={`p-3 text-xs font-bold rounded-xl flex items-start gap-2 border ${
              alert.type === 'error' ? 'bg-red-950/90 text-red-400 border-red-700' : alert.type === 'success' ? 'bg-neutral-900 text-white border-neutral-700' : 'bg-neutral-950 text-red-300 border-red-900'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{alert.message}</span>
            </div>
          )}

          {mode === 'form' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Select Role</label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 border border-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      role === 'customer' ? 'bg-red-600 text-white border-red-500' : 'text-neutral-400 border-transparent'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      role === 'operator' ? 'bg-red-600 text-white border-red-500' : 'text-neutral-400 border-transparent'
                    }`}
                  >
                    Tour Operator
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Full Name</label>
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-red-600">
                  <User className="w-4 h-4 text-red-500 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none placeholder-neutral-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Mobile Number or Gmail/Email Address
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-red-600">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210 or user@gmail.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none placeholder-neutral-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition mt-2"
              >
                Send OTP & Verify Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600 flex items-center justify-center mx-auto text-red-500">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">Enter 6-Digit OTP Code</h4>
                <p className="text-xs text-neutral-400 mt-1">Sent to <strong className="text-white">{identifier}</strong></p>
                {demoCode && (
                  <span className="inline-block mt-2 bg-neutral-900 border border-red-600 text-red-400 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    DEMO OTP: {demoCode}
                  </span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="0 0 0 0 0 0"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-neutral-950 border-2 border-red-600 text-center tracking-[0.5em] text-xl font-mono font-black text-white py-3 rounded-2xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Timer: <strong className="text-red-500 font-mono">{formatTimer(timerSeconds)}</strong></span>
                <span className="text-[11px]">Max 3 Attempts Limit</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition"
              >
                Verify OTP & Activate Account
              </button>
            </form>
          )}

          <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-900">
            Already registered?{' '}
            <Link href="/login" className="text-red-500 font-bold hover:underline">
              Sign In to Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
