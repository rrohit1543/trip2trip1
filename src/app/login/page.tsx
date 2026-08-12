'use client';

import React, { useState } from 'react';
import { useTripMandiStore } from '../../lib/store';
import Navbar from '../../components/common/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Bus } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loginUser, logoutUser, requestAdminLoginMFA, verifyAdminMFA } = useTripMandiStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const res = loginUser(identifier, password);
    if (res.success) {
      setAlert({ type: 'success', message: res.message });
      setTimeout(() => {
        if (res.user?.role === 'operator') {
          router.push('/operator/dashboard');
        } else {
          router.push('/passenger/dashboard');
        }
      }, 1000);
    } else {
      setAlert({ type: 'error', message: res.message });
    }
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
            <h1 className="text-2xl font-black text-white">Sign In to TripMandi</h1>
            <p className="text-xs text-neutral-400">Customer & Tour Operator Portal</p>
          </div>

          {alert && (
            <div className={`p-3 text-xs font-bold rounded-xl flex items-start gap-2 border ${
              alert.type === 'error' ? 'bg-red-950/90 text-red-400 border-red-700' : 'bg-neutral-900 text-white border-neutral-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-red-500 font-bold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-3 focus-within:border-red-600">
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
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-900">
            Don't have an account?{' '}
            <Link href="/register" className="text-red-500 font-bold hover:underline">
              Register via Mobile or Gmail
            </Link>
          </div>

          <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-xl text-[11px] text-center text-neutral-400">
            Are you a Super Admin?{' '}
            <Link href="/admin/login" className="text-white font-bold hover:underline">
              Access Admin Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
