'use client';

import React from 'react';
import { PhoneCall, MessageSquare } from 'lucide-react';

export default function SocialChannelsBar() {
  const handleGmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Open Gmail web compose directly in a new tab
    const gmailWebUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=tripmandi.official@gmail.com&su=Booking%20Inquiry%20-%20TripMandi';
    window.open(gmailWebUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full bg-slate-900 text-white py-5 px-4 font-sans border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">24/7 SUPPORT DESK</span>
            <h4 className="text-base font-black text-white">Need Help With Your Booking?</h4>
          </div>
          <p className="text-xs text-slate-400">Connect instantly via WhatsApp, Phone Call, Gmail, Instagram, or Twitter / X.</p>
        </div>

        {/* Clean Compact Icon Buttons Row */}
        <div className="flex items-center justify-center gap-3">
          
          {/* 1. WhatsApp */}
          <a
            href="https://wa.me/918168561817?text=Hi%20TripMandi%20Support,%20I%20need%20help%20with%20my%20booking"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 transition hover:scale-105 active:scale-95 group relative"
            title="WhatsApp (+91 8168561817)"
          >
            <MessageSquare className="w-5 h-5 fill-white" />
            <span className="sr-only">WhatsApp</span>
          </a>

          {/* 2. Direct Call */}
          <a
            href="tel:+918168561817"
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 transition hover:scale-105 active:scale-95 group relative"
            title="Call Support (+91 8168561817)"
          >
            <PhoneCall className="w-5 h-5" />
            <span className="sr-only">Call Support</span>
          </a>

          {/* 3. Gmail (Direct Web Mail Compose + Mailto fallback) */}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=tripmandi.official@gmail.com&su=Booking%20Inquiry%20-%20TripMandi"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleGmailClick}
            className="bg-slate-800 hover:bg-slate-700 border-2 border-red-600/60 hover:border-red-500 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20 transition hover:scale-105 active:scale-95 group relative cursor-pointer"
            title="Send Email via Gmail (tripmandi.official@gmail.com)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z" className="text-red-500" />
            </svg>
            <span className="sr-only">Gmail</span>
          </a>

          {/* 4. Instagram */}
          <a
            href="https://www.instagram.com/tripmandi_official/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-600/30 transition hover:scale-105 active:scale-95 group relative"
            title="Instagram (@TRIPMANDI_OFFICIAL)"
          >
            <svg className="w-5 h-5 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span className="sr-only">Instagram</span>
          </a>

          {/* 5. Twitter / X */}
          <a
            href="https://twitter.com/tripmandi"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-3 rounded-2xl flex items-center justify-center transition hover:scale-105 active:scale-95 group relative"
            title="Twitter / X (@tripmandi)"
          >
            <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
            </svg>
            <span className="sr-only">Twitter / X</span>
          </a>

        </div>
      </div>
    </div>
  );
}
