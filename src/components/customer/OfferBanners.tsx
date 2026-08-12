'use client';

import React from 'react';
import { Tag, Sparkles, Calendar, ChevronRight, Gift, Percent } from 'lucide-react';

export default function OfferBanners() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Festival Special Promo Banner (redBus Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-50 via-slate-50 to-rose-100 border border-rose-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-600 shrink-0">
            <Gift className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                FESTIVAL SPECIAL
              </span>
              <span className="text-xs font-bold text-red-600 font-mono">Get ₹60 off using code SUPERB60</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Book Group Trips for Upcoming Festivals</h3>
            <p className="text-xs text-slate-600">Reserve early to guarantee seat availability and live GPS route tracking.</p>
          </div>
        </div>

        {/* Seasonal Month Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white border border-rose-300 px-4 py-2 rounded-2xl text-center shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-500">Aug</div>
            <div className="text-xs font-black text-red-600">Independence Drive</div>
          </div>

          <div className="bg-white border border-rose-300 px-4 py-2 rounded-2xl text-center shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-500">Sep</div>
            <div className="text-xs font-black text-red-600">Janmashtami Treks</div>
          </div>

          <div className="bg-white border border-rose-300 px-4 py-2 rounded-2xl text-center shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-500">Oct</div>
            <div className="text-xs font-black text-red-600">Maha Ashtami Expeditions</div>
          </div>

          <button className="bg-rose-100 hover:bg-rose-200 text-red-700 font-black px-5 py-3 rounded-full text-xs transition shadow-sm">
            Book Trips Now &rarr;
          </button>
        </div>
      </div>

      {/* Offers for You Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" /> Offers For You
          </h3>
          <button className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
            <span>View All Offers</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Offer Card 1 */}
          <div className="bg-white border border-slate-200 hover:border-red-500 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-red-600/10 text-red-600 border border-red-600/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                BUS & TOUR
              </span>
              <h4 className="text-sm font-black text-slate-900">Save up to ₹250 on Volvo Group Trips</h4>
              <p className="text-[11px] text-slate-500 font-mono">Valid on Manali & Goa routes</p>
              <div className="pt-2">
                <span className="bg-slate-100 border border-dashed border-red-400 text-slate-800 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                  Use Code: <strong className="text-red-600">TRIP250</strong>
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-red-600 font-black text-lg shrink-0">
              %
            </div>
          </div>

          {/* Offer Card 2 */}
          <div className="bg-white border border-slate-200 hover:border-red-500 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-red-600/10 text-red-600 border border-red-600/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                FIRST BOOKING
              </span>
              <h4 className="text-sm font-black text-slate-900">Flat 15% Cashback on First Booking</h4>
              <p className="text-[11px] text-slate-500 font-mono">Instant wallet credit at checkout</p>
              <div className="pt-2">
                <span className="bg-slate-100 border border-dashed border-red-400 text-slate-800 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                  Use Code: <strong className="text-red-600">FIRSTTRIP</strong>
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-red-600 font-black text-lg shrink-0">
              🎁
            </div>
          </div>

          {/* Offer Card 3 */}
          <div className="bg-white border border-slate-200 hover:border-red-500 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-red-600/10 text-red-600 border border-red-600/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                GROUP BOOKING
              </span>
              <h4 className="text-sm font-black text-slate-900">Book 4+ Seats & Get Free PDF Brochure</h4>
              <p className="text-[11px] text-slate-500 font-mono">Includes Live Operator GPS Support</p>
              <div className="pt-2">
                <span className="bg-slate-100 border border-dashed border-red-400 text-slate-800 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                  Use Code: <strong className="text-red-600">GROUPSAVER</strong>
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-red-600 font-black text-lg shrink-0">
              🚌
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
