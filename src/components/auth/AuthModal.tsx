'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../../types';
import { X, Lock, Mail, Phone, KeyRound, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Users, Building2, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (identifier: string, pass: string) => { success: boolean; message: string };
  onRegister: (name: string, identifier: string, pass: string, role: UserRole) => { success: boolean; message: string };
  onVerifyOTP?: (identifier: string, code: string) => { success: boolean; message: string };
  onRequestReset?: (identifier: string) => { success: boolean; message: string };
  onResetPassword?: (identifier: string, code: string, newPass: string) => { success: boolean; message: string };
}

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}: AuthModalProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'otp_verify' | 'forgot_password' | 'reset_otp'>('login');
  const [role, setRole] = useState<UserRole>('customer');

  // Form Fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('rrohit1543@gmail.com'); // Mobile or Email
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 6 Individual OTP Digit Inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Status Alerts, Timers, and Resend Cooldown
  const [alert, setAlert] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5-minute (300s) expiry countdown
  const [resendCooldownSec, setResendCooldownSec] = useState(0); // 60s resend cooldown
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [loading, setLoading] = useState(false);

  // 1. 5-Minute OTP Expiry & 60s Resend Cooldown Timers
  useEffect(() => {
    let interval: any;
    if ((mode === 'otp_verify' || mode === 'reset_otp') && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timerSeconds]);

  useEffect(() => {
    let cooldownInterval: any;
    if (resendCooldownSec > 0) {
      cooldownInterval = setInterval(() => {
        setResendCooldownSec((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(cooldownInterval);
  }, [resendCooldownSec]);

  // Handle 6-Digit OTP Box Focus & Typing
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    // Handle pasted 6-digit code
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      inputRefs[5].current?.focus();
      return;
    }

    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-advance to next input box
    if (value !== '' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const combinedOTP = otpDigits.join('');

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setAlert(null);
    if (selectedRole === 'customer') {
      setIdentifier('rrohit1543@gmail.com');
      setPassword('password123');
    } else if (selectedRole === 'operator') {
      setIdentifier('vikram@himalayanyatra.com');
      setPassword('operator123');
    } else if (selectedRole === 'admin') {
      setIdentifier('admin@tripmandi.com');
      setPassword('AdminPass2026!');
    }
  };

  // 1. LOGIN SUBMIT
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

  // 2. REGISTER / REQUEST OTP SUBMIT (Calls Backend POST /api/auth/send-otp)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, identifier }),
      });

      const data = await res.json();
      if (data.success) {
        setMode('otp_verify');
        setOtpDigits(['', '', '', '', '', '']);
        setTimerSeconds(300); // 5-minute countdown
        setResendCooldownSec(60); // 60s cooldown
        setAttemptsRemaining(3);
        setAlert({ type: 'info', message: data.message || `A 6-digit OTP code has been sent to ${identifier}.` });
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to send OTP.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Network error sending OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFY OTP SUBMIT (Calls Backend POST /api/auth/verify-otp)
  const handleVerifyOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (combinedOTP.length < 6) {
      setAlert({ type: 'error', message: 'Please enter all 6 digits of the OTP code.' });
      return;
    }

    if (timerSeconds <= 0) {
      setAlert({ type: 'error', message: 'This OTP has expired. Please request a new OTP.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, identifier, otp: combinedOTP, name, role }),
      });

      const data = await res.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'OTP verified successfully! Redirecting to dashboard...' });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      } else {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setAlert({ type: 'error', message: data.error || 'Invalid OTP. Please try again.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Network error verifying OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // 4. RESEND OTP ACTION (Calls Backend POST /api/auth/resend-otp)
  const handleResendOTP = async () => {
    if (resendCooldownSec > 0) return;
    setAlert(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, identifier }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpDigits(['', '', '', '', '', '']);
        setTimerSeconds(300); // Start new 5-minute countdown
        setResendCooldownSec(60); // Reset 60s resend cooldown
        setAttemptsRemaining(3);
        setAlert({ type: 'info', message: 'A new OTP has been sent to your email.' });
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to resend OTP.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Error resending OTP code.' });
    } finally {
      setLoading(false);
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
                {mode === 'forgot_password' && 'Reset Password'}
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
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Account Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('customer')}
                    className={`p-2 rounded-xl border text-[11px] font-extrabold flex flex-col items-center gap-1 transition ${
                      role === 'customer'
                        ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('operator')}
                    className={`p-2 rounded-xl border text-[11px] font-extrabold flex flex-col items-center gap-1 transition ${
                      role === 'operator'
                        ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Operator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`p-2 rounded-xl border text-[11px] font-extrabold flex flex-col items-center gap-1 transition ${
                      role === 'admin'
                        ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-red-600">
                  <Mail className="w-4 h-4 text-red-600 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="user@gmail.com or +91 9876543210"
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

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Sign In as {role.toUpperCase()}</span>
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="text"
                  required
                  placeholder="rrohit1543@gmail.com"
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
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Sending OTP...' : 'Send OTP & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. OTP VERIFICATION MODE (NO DEMO OTP BADGE - 100% PRODUCTION) */}
          {mode === 'otp_verify' && (
            <form onSubmit={handleVerifyOTPSubmit} className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center mx-auto text-red-600">
                <KeyRound className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">Enter 6-Digit OTP Code</h4>
                <p className="text-xs text-slate-500">Sent to <strong className="text-slate-900">{identifier}</strong></p>
              </div>

              {/* 6 Individual Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className="w-12 h-14 bg-slate-50 border-2 border-red-600 text-center text-xl font-mono font-black text-slate-900 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-400 shadow-sm"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono border-t border-b border-slate-100 py-2">
                <span>Timer: <strong className="text-red-600 font-bold">{formatTimer(timerSeconds)}</strong></span>
                <span>Attempts remaining: <strong className="text-slate-900 font-bold">{attemptsRemaining}</strong></span>
              </div>

              <button
                type="submit"
                disabled={loading || combinedOTP.length < 6 || timerSeconds <= 0}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Validating OTP...' : 'Verify OTP & Activate Account'}
              </button>

              {/* Resend OTP Option with 60s Cooldown */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldownSec > 0 || loading}
                  className="text-xs font-bold text-red-600 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldownSec > 0
                      ? `Resend OTP available in ${resendCooldownSec}s`
                      : 'Resend OTP'}
                  </span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
