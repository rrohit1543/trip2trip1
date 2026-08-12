'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { X, Lock, Mail, Phone, ShieldCheck, KeyRound, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (identifier: string, pass: string) => { success: boolean; message: string };
  onRegister: (name: string, identifier: string, pass: string, role: UserRole) => { success: boolean; message: string; otpCode?: string };
  onVerifyOTP: (identifier: string, code: string) => { success: boolean; message: string };
  onRequestReset: (identifier: string) => { success: boolean; message: string; otpCode?: string };
  onResetPassword: (identifier: string, code: string, newPass: string) => { success: boolean; message: string };
}

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onVerifyOTP,
  onRequestReset,
  onResetPassword,
}: AuthModalProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'otp_verify' | 'forgot_password' | 'reset_otp'>('login');
  const [role, setRole] = useState<UserRole>('customer');

  // Form Fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Mobile or Email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Status Alerts & Timers
  const [alert, setAlert] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min countdown
  const [demoCode, setDemoCode] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if ((mode === 'otp_verify' || mode === 'reset_otp') && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timerSeconds]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    const res = onLogin(identifier, password);
    if (res.success) {
      onClose();
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

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

    const res = onRegister(name, identifier, password, role);
    if (res.success) {
      setDemoCode(res.otpCode || null);
      setTimerSeconds(300);
      setMode('otp_verify');
      setAlert({ type: 'info', message: res.message });
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = onVerifyOTP(identifier, otpCode);
    if (res.success) {
      setAlert({ type: 'success', message: res.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = onRequestReset(identifier);
    setDemoCode(res.otpCode || null);
    setTimerSeconds(300);
    setMode('reset_otp');
    setAlert({ type: 'info', message: res.message });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    const res = onResetPassword(identifier, otpCode, password);
    if (res.success) {
      setAlert({ type: 'success', message: res.message });
      setTimeout(() => {
        setMode('login');
      }, 1500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-black border-2 border-red-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-5 bg-neutral-950 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600 flex items-center justify-center text-red-500 font-mono font-bold text-lg">
              2
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {mode === 'login' && 'Sign In to TripMandi'}
                {mode === 'register' && 'Create Account'}
                {mode === 'otp_verify' && 'Verify Mobile / Email OTP'}
                {mode === 'forgot_password' && 'Reset Password (OWASP)'}
                {mode === 'reset_otp' && 'Set New Password'}
              </h3>
              <p className="text-xs text-neutral-400">Mobile & Email Verification Portal</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900 border border-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector (Login vs Register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex items-center border-b border-neutral-900 bg-neutral-950/60 p-1">
            <button
              onClick={() => { setMode('login'); setAlert(null); }}
              className={`w-1/2 py-2.5 text-xs font-bold transition rounded-xl ${
                mode === 'login' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setAlert(null); }}
              className={`w-1/2 py-2.5 text-xs font-bold transition rounded-xl ${
                mode === 'register' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {alert && (
          <div className={`p-3 text-xs font-bold flex items-start gap-2 border-b ${
            alert.type === 'error' ? 'bg-red-950/90 text-red-400 border-red-700' : alert.type === 'success' ? 'bg-neutral-900 text-white border-neutral-700' : 'bg-neutral-950 text-red-300 border-red-900'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        {/* FORM MODES */}
        <div className="p-6 space-y-4">
          {/* 1. LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Mobile Number or Email Address
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-red-600">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210 or user@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none placeholder-neutral-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setAlert(null); }}
                    className="text-[10px] text-red-500 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-red-600">
                  <Lock className="w-4 h-4 text-red-500 shrink-0" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none placeholder-neutral-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Account Role Selector */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 border border-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      role === 'customer' ? 'bg-red-600 text-white border-red-500' : 'text-neutral-400 border-transparent'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      role === 'operator' ? 'bg-red-600 text-white border-red-500' : 'text-neutral-400 border-transparent'
                    }`}
                  >
                    Tour Operator
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Mobile Number or Gmail/Email Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210 or user@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                />
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
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition mt-2"
              >
                Send OTP & Verify Account
              </button>
            </form>
          )}

          {/* 3. OTP VERIFICATION MODE */}
          {mode === 'otp_verify' && (
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
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition"
              >
                Verify OTP & Activate Account
              </button>
            </form>
          )}

          {/* 4. FORGOT PASSWORD MODE (OWASP) */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Registered Mobile Number or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210 or user@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Following OWASP security recommendations, a single-use 5-minute OTP code will be dispatched to your registered contact.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-1/3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition"
                >
                  Send Reset OTP
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET OTP & SET NEW PASSWORD MODE */}
          {mode === 'reset_otp' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              {demoCode && (
                <div className="text-center">
                  <span className="bg-neutral-900 border border-red-600 text-red-400 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    DEMO RESET OTP: {demoCode}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">6-Digit Reset OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="0 0 0 0 0 0"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-neutral-950 border border-red-600 text-center tracking-widest text-lg font-mono font-bold text-white py-2 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">New Password</label>
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
                Resets immediately invalidate all active user sessions per OWASP guidelines.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition"
              >
                Reset Password & Require Re-login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
