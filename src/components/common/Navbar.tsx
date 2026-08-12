'use client';

import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { Compass, ShieldAlert, Bus, UserCheck, Radio, LogIn, LogOut, Lock, LifeBuoy, X, Hotel, Calendar, HelpCircle, List, PhoneCall } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onOpenAdminAuthModal: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  currentUser,
  onOpenAuthModal,
  onOpenAdminAuthModal,
  onLogout,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const [showDiscountBar, setShowDiscountBar] = useState(true);

  return (
    <div className="w-full sticky top-0 z-50 font-sans">
      {/* Top redBus-Style Discount Announcement Bar */}
      {showDiscountBar && (
        <div className="bg-gradient-to-r from-yellow-50 via-rose-100 to-rose-200 text-slate-800 text-xs py-2 px-4 flex items-center justify-between border-b border-rose-200 shadow-inner">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                APP SPECIAL
              </span>
              <span className="font-bold text-slate-900">
                Get 10% Discount &mdash; <span className="text-slate-600">Use code <strong className="text-red-600">APP10</strong> on app</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('Trip2Trip Mobile App PWA installer ready!')}
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold px-3.5 py-1 rounded-full text-[11px] shadow-sm transition"
              >
                Install trip2trip App
              </button>
              <button
                onClick={() => setShowDiscountBar(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main RedBus-Identical Header Navbar */}
      <header className="bg-white dark:bg-black border-b border-slate-200 dark:border-neutral-900 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo (redBus Style Badge) */}
          <Link
            href="/"
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white dark:bg-black border-2 border-red-600 shadow-md group-hover:scale-105 transition-transform duration-300">
              <Bus className="w-6 h-6 text-red-600 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  trip<span className="text-red-600">2</span>trip
                </span>
                <span className="bg-rose-100 dark:bg-red-600/20 text-red-600 dark:text-red-500 border border-rose-300 dark:border-red-600/40 text-[9px] uppercase font-black px-1.5 py-0.5 rounded tracking-wide">
                  INDIA NO. 1
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold hidden sm:block">Group Trips & Live Telemetry</p>
            </div>
          </Link>

          {/* Navigation Category Tabs with Underline Indicator */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold">
            <Link
              href="/"
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 py-6 border-b-2 transition-all ${
                activeTab === 'explore'
                  ? 'border-red-600 text-red-600 font-black'
                  : 'border-transparent text-slate-700 dark:text-neutral-300 hover:text-red-600'
              }`}
            >
              <Bus className={`w-4 h-4 ${activeTab === 'explore' ? 'text-red-600' : 'text-slate-500'}`} />
              <span>Group Trips</span>
            </Link>

            <Link
              href="/"
              onClick={() => setActiveTab('live-radar')}
              className={`flex items-center gap-2 py-6 border-b-2 transition-all ${
                activeTab === 'live-radar'
                  ? 'border-red-600 text-red-600 font-black'
                  : 'border-transparent text-slate-700 dark:text-neutral-300 hover:text-red-600'
              }`}
            >
              <Radio className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Fleet Radar</span>
            </Link>

            <Link
              href="/support"
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 py-6 border-b-2 transition-all ${
                activeTab === 'support'
                  ? 'border-red-600 text-red-600 font-black'
                  : 'border-transparent text-slate-700 dark:text-neutral-300 hover:text-red-600'
              }`}
            >
              <LifeBuoy className={`w-4 h-4 ${activeTab === 'support' ? 'text-red-600' : 'text-slate-500'}`} />
              <span>Help & Support</span>
            </Link>

            {currentUser?.role === 'customer' && (
              <Link
                href="/passenger/dashboard"
                onClick={() => setActiveTab('passenger-dash')}
                className={`flex items-center gap-2 py-6 border-b-2 transition-all ${
                  activeTab === 'passenger-dash'
                    ? 'border-red-600 text-red-600 font-black'
                    : 'border-transparent text-slate-700 dark:text-neutral-300 hover:text-red-600'
                }`}
              >
                <List className="w-4 h-4 text-slate-500" />
                <span>My Bookings</span>
              </Link>
            )}

            {currentUser?.role === 'operator' && (
              <Link
                href="/operator/dashboard"
                onClick={() => setActiveTab('operator-dash')}
                className={`flex items-center gap-2 py-6 border-b-2 transition-all ${
                  activeTab === 'operator-dash'
                    ? 'border-red-600 text-red-600 font-black'
                    : 'border-transparent text-slate-700 dark:text-neutral-300 hover:text-red-600'
                }`}
              >
                <Bus className="w-4 h-4 text-red-600" />
                <span>Agency Panel</span>
              </Link>
            )}

            {currentUser?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                onClick={() => setActiveTab('admin-dash')}
                className={`flex items-center gap-2 py-6 border-b-2 transition-all ${
                  activeTab === 'admin-dash'
                    ? 'border-red-600 text-red-600 font-black'
                    : 'border-transparent text-slate-700 dark:text-neutral-300 hover:text-red-600'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Super Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Header Menu Items */}
          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 px-3 py-1.5 rounded-2xl">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-red-600"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-red-600 dark:text-red-500 font-bold capitalize">
                      {currentUser.operatorCompany || currentUser.role}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-red-600 text-slate-600 dark:text-neutral-400 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Account / Sign In</span>
              </button>
            )}

            {/* Dedicated Administrator Portal Link */}
            <button
              onClick={onOpenAdminAuthModal}
              className="p-2 rounded-full bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-red-600 text-red-600 transition flex items-center gap-1.5 text-xs font-bold"
              title="Restricted Admin Portal"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden lg:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
