'use client';

import React, { useState } from 'react';
import { useTripMandiStore } from '../../lib/store';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Bus, Users, Shield, Building2 } from 'lucide-react';
import { UserRole } from '../../types';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loginUser, logoutUser } = useTripMandiStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [identifier, setIdentifier] = useState('rahul.sharma@example.com');
  const [password, setPassword] = useState('password123');
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAlert(null);
    if (role === 'customer') {
      setIdentifier('rahul.sharma@example.com');
      setPassword('password123');
    } else if (role === 'operator') {
      setIdentifier('vikram@himalayanyatra.com');
      setPassword('operator123');
    } else if (role === 'admin') {
      router.push('/admin/login');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = loginUser(identifier, password);
    if (res.success) {
      setAlert({ type: 'success', message: res.message });
      setTimeout(() => {
        if (res.user?.role === 'operator') {
          router.push('/operator/dashboard');
        } else if (res.user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/passenger/dashboard');
        }
      }, 800);
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-red-600 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar
          currentUser={currentUser}
          onOpenAuthModal={() => {}}
          onOpenAdminAuthModal={() => router.push('/admin/login')}
          onLogout={logoutUser}
          activeTab="explore"
          setActiveTab={() => router.push('/')}
        />

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-900">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600 flex items-center justify-center mx-auto text-red-600 font-mono font-bold text-xl">
                TM
              </div>
              <h1 className="text-2xl font-black text-slate-900">Sign In to TripMandi</h1>
              <p className="text-xs text-slate-500">Select your account role to log in</p>
            </div>

            {/* 3-Way Role Selector (Customer vs Vendor Agency vs Admin) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Login Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('customer')}
                  className={`p-2.5 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1 transition ${
                    selectedRole === 'customer'
                      ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('operator')}
                  className={`p-2.5 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1 transition ${
                    selectedRole === 'operator'
                      ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Operator</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`p-2.5 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1 transition ${
                    selectedRole === 'admin'
                      ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {alert && (
              <div className={`p-3 text-xs font-bold rounded-xl flex items-start gap-2 border ${
                alert.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{alert.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {selectedRole === 'customer' && 'Customer Email or Mobile'}
                  {selectedRole === 'operator' && 'Vendor Agency Email or Phone'}
                  {selectedRole === 'admin' && 'Admin Identifier'}
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 focus-within:border-red-600">
                  <Mail className="w-4 h-4 text-red-600 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210 or user@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-[10px] text-red-600 font-bold hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 focus-within:border-red-600">
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
                <span>Sign In as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
              Don't have an account?{' '}
              <Link href="/register" className="text-red-600 font-bold hover:underline">
                Register Account via OTP
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
