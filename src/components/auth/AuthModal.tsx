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
      setAlert({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    const res = onRegister(name, identifier, password, role);
    if (res.success) {
      setDemoCode(res.otpCode || null);
      setMode('otp_verify');
      setTimerSeconds(300);
      setAlert({ type: 'info', message: res.message });
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  const handleVerifyOTPSubmit = (e: React.FormEvent) => {
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
    if (res.success) {
      setDemoCode(res.otpCode || null);
      setMode('reset_otp');
      setTimerSeconds(300);
      setAlert({ type: 'info', message: res.message });
    } else {
      setAlert({ type: 'error', message: res.message });
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-600 font-mono font-bold text-lg">
              TM
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {mode === 'login' && 'Sign In to TripMandi'}
                {mode === 'register' && 'Create Account'}
                {mode === 'otp_verify' && 'Verify Mobile / Email OTP'}
                {mode === 'forgot_password' && 'Reset Password (OWASP)'}
                {mode === 'reset_otp' && 'Set New Password'}
              </h3>
              <p className="text-xs text-slate-500">Mobile Phone & Email Verification System</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-full bg-white border border-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector (Login vs Register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex items-center border-b border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => { setMode('login'); setAlert(null); }}
              className={`w-1/2 py-2.5 text-xs font-bold transition rounded-xl ${
                mode === 'login' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setAlert(null); }}
              className={`w-1/2 py-2.5 text-xs font-bold transition rounded-xl ${
                mode === 'register' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register Account
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {alert && (
          <div className={`p-3 text-xs font-bold flex items-start gap-2 border-b ${
            alert.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-800 border-slate-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        {/* FORM MODES */}
        <div className="p-6 space-y-4 bg-white text-slate-900">
          {/* 1. LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-red-600">
                  <Mail className="w-4 h-4 text-red-600 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="user@example.com or +91 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-red-600">
                  <Lock className="w-4 h-4 text-red-600 shrink-0" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => { setMode('forgot_password'); setAlert(null); }}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      role === 'customer' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Customer (Buyer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      role === 'operator' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Vendor Agency (Seller)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number or Email Address</label>
                <input
                  type="text"
                  required
                  placeholder="user@example.com or +91 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Send OTP & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. OTP VERIFICATION MODE (PURE WHITE CARD) */}
          {mode === 'otp_verify' && (
            <form onSubmit={handleVerifyOTPSubmit} className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600 flex items-center justify-center mx-auto text-red-600">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Enter 6-Digit OTP Code</h4>
                <p className="text-xs text-slate-500 mt-1">Sent to <strong className="text-slate-900">{identifier}</strong></p>
                {demoCode && (
                  <span className="inline-block mt-2 bg-slate-100 border border-red-600 text-red-600 px-3 py-1 rounded-full text-xs font-mono font-bold">
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
                  className="w-full bg-slate-50 border-2 border-red-600 text-center tracking-[0.5em] text-xl font-mono font-black text-slate-900 py-3 rounded-2xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Timer: <strong className="text-red-600 font-bold">{formatTimer(timerSeconds)}</strong></span>
                <span>Max 3 Attempts Limit</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition"
              >
                Verify OTP & Activate Account
              </button>
            </form>
          )}

          {/* 4. FORGOT PASSWORD MODE */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-slate-900">Forgot Password</h4>
                <p className="text-xs text-slate-500">Enter your registered email or mobile to receive a single-use OTP.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Registered Email or Mobile
                </label>
                <input
                  type="text"
                  required
                  placeholder="user@example.com or +91 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Request Reset OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET OTP MODE */}
          {mode === 'reset_otp' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-slate-900">Set New Password</h4>
                <p className="text-xs text-slate-500">Enter the 6-digit OTP code sent to {identifier}</p>
                {demoCode && (
                  <span className="inline-block bg-slate-100 border border-red-600 text-red-600 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    DEMO OTP: {demoCode}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 text-center font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition"
              >
                Save New Password & Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
