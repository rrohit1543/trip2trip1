'use client';

import React from 'react';
import SocialChannelsBar from './SocialChannelsBar';
import { Bus, ShieldAlert, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-white font-sans border-t border-slate-800">
      {/* 24/7 Social Support Bar */}
      <SocialChannelsBar />

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-400">
        {/* Col 1: Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Bus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-white font-mono">
              Trip<span className="text-red-500">Mandi</span>
            </span>
          </div>
          <p className="leading-relaxed">
            India's No. 1 B2B2C Travel Marketplace connecting Travel Agencies with End Customers via Automated Nodal Payment Splits and Real-Time GPS Telemetry.
          </p>
          <div className="pt-2 text-[11px] text-slate-500">
            &copy; 2026 TripMandi Marketplace Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>

        {/* Col 2: Top Group Routes */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Popular Tour Routes</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-red-500 transition">Delhi &rarr; Manali Volvo Group Trek</Link></li>
            <li><Link href="/" className="hover:text-red-500 transition">Indore &rarr; Goa Beach Caravan Express</Link></li>
            <li><Link href="/" className="hover:text-red-500 transition">Mumbai &rarr; Coorg Coffee Estate Tour</Link></li>
            <li><Link href="/" className="hover:text-red-500 transition">Bangalore &rarr; Ooty Heritage Caravan</Link></li>
            <li><Link href="/" className="hover:text-red-500 transition">Chandigarh &rarr; Spiti Valley Expedition</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Support */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Help & Support Desk</h4>
          <ul className="space-y-2">
            <li><Link href="/support" className="hover:text-red-500 transition">Raise Support Ticket</Link></li>
            <li><Link href="/support" className="hover:text-red-500 transition">Track Booking & Refund Status</Link></li>
            <li><Link href="/support" className="hover:text-red-500 transition">Cancellation & GST Invoice Policy</Link></li>
            <li><Link href="/operator/dashboard" className="hover:text-red-500 transition">Vendor Agency Self-Onboarding</Link></li>
            <li><Link href="/admin/login" className="hover:text-red-500 transition">Super Admin Governance Portal</Link></li>
          </ul>
        </div>

        {/* Col 4: Quick Contact Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Contact TripMandi</h4>
          <p><strong>Headquarters:</strong> TripMandi Hub, Sector 62, Noida, NCR Delhi, India</p>
          <p><strong>WhatsApp Support:</strong> +91 98765 43210</p>
          <p><strong>Direct Call Line:</strong> +91 98765 43210</p>
          <p><strong>Official Email:</strong> support@tripmandi.com</p>
          <div className="pt-2 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Made with</span> <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> <span>in India for Travelers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
