'use client';

import React from 'react';
import { PhoneCall, Mail, MessageSquare } from 'lucide-react';

export default function SocialChannelsBar() {
  return (
    <div className="w-full bg-slate-900 text-white py-6 px-4 font-sans border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">24/7 SUPPORT HUB</span>
            <h4 className="text-base font-black text-white">Need Help With Your Booking?</h4>
          </div>
          <p className="text-xs text-slate-400">Connect with TripMandi customer desk via WhatsApp, Phone Call, Gmail, or Instagram (@TRIPMANDI_OFFICIAL).</p>
        </div>

        {/* Channels Grid with Icons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* WhatsApp */}
          <a
            href="https://wa.me/919876543210?text=Hi%20TripMandi%20Support,%20I%20need%20help%20with%20my%20booking"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>WhatsApp</span>
          </a>

          {/* Direct Call */}
          <a
            href="tel:+919876543210"
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Support</span>
          </a>

          {/* Gmail */}
          <a
            href="mailto:support@tripmandi.com?subject=Booking%20Inquiry%20-%20TripMandi"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition"
          >
            <Mail className="w-4 h-4 text-red-500" />
            <span>Gmail</span>
          </a>

          {/* Official Instagram Handle: @TRIPMANDI_OFFICIAL */}
          <a
            href="https://www.instagram.com/tripmandi_official/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 transition active:scale-95"
            title="Follow @TRIPMANDI_OFFICIAL on Instagram"
          >
            <svg className="w-4 h-4 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>Instagram (@TRIPMANDI_OFFICIAL)</span>
          </a>

          {/* Twitter / X SVG */}
          <a
            href="https://twitter.com/tripmandi"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition"
            title="Twitter / X"
          >
            <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
            </svg>
            <span className="hidden sm:inline">Twitter / X</span>
          </a>
        </div>
      </div>
    </div>
  );
}
