'use client';

import React, { useState } from 'react';
import { Trip, Booking } from '../../types';
import { X, ShieldAlert, QrCode, CreditCard, Landmark, Wallet, CheckCircle2, Download, Radio, Lock, Mail, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import GoogleOAuthButton from '../auth/GoogleOAuthButton';
import DynamicUPIPaymentModal from '../payments/DynamicUPIPaymentModal';

interface CheckoutModalProps {
  trip: Trip | null;
  selectedSeats: number[];
  pickupPoint: string;
  dropPoint: string;
  onClose: () => void;
  onConfirmBooking: (bookingData: any) => Booking;
  onViewBookingInDashboard: () => void;
}

export default function CheckoutModal({
  trip,
  selectedSeats,
  pickupPoint,
  dropPoint,
  onClose,
  onConfirmBooking,
  onViewBookingInDashboard,
}: CheckoutModalProps) {
  if (!trip) return null;

  const [travellerName, setTravellerName] = useState('Rahul Sharma');
  const [travellerPhone, setTravellerPhone] = useState('+91 98765 43210');
  const [travellerEmail, setTravellerEmail] = useState('rahul.sharma@gmail.com');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'Wallet'>('UPI');
  const [promoCode, setPromoCode] = useState('TRIPMANDI2026');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Dynamic UPI QR Modal state
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);

  const basePrice = selectedSeats.length * trip.pricePerPerson;
  const gstAmount = Math.round(basePrice * 0.05);
  const grandTotal = basePrice + gstAmount;

  // Split calculation preview
  const estimatedCommission = Math.round(grandTotal * 0.1);
  const estimatedAgencyNet = grandTotal - estimatedCommission;

  const handleGoogleSSOSuccess = (user: any) => {
    setTravellerName(user.name || 'Google Verified Traveler');
    setTravellerEmail(user.email);
    if (user.phone) setTravellerPhone(user.phone);
  };

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'UPI') {
      setIsUPIModalOpen(true);
    } else {
      executeBookingConfirmation();
    }
  };

  const executeBookingConfirmation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const booking = onConfirmBooking({
        tripId: trip.id,
        tripName: trip.name,
        operatorName: trip.operatorName,
        customerId: 'usr_customer_1',
        customerName: travellerName,
        customerPhone: travellerPhone,
        customerEmail: travellerEmail,
        selectedSeats,
        totalAmount: grandTotal,
        paymentMethod,
        pickupPoint,
        dropPoint,
        paymentStatus: 'paid',
      });

      setIsProcessing(false);
      setConfirmedBooking(booking);

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}
    }, 1200);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-sans">
        <div className="relative w-full max-w-2xl bg-white border-2 border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 text-slate-900">
          
          {/* Header */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Confirm & Checkout Booking</h3>
              <p className="text-xs text-slate-500">TripMandi 3-Sided Escrow Protected Checkout</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-full bg-white border border-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!confirmedBooking ? (
            <form onSubmit={handlePayNow} className="p-6 space-y-6">
              
              {/* Trip Summary Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">{trip.name}</h4>
                  <span className="bg-red-600/10 text-red-600 border border-red-600/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {trip.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div><strong>Pickup:</strong> {pickupPoint}</div>
                  <div><strong>Drop:</strong> {dropPoint}</div>
                  <div><strong>Seats Selected:</strong> <span className="font-mono text-red-600 font-bold">{selectedSeats.join(', ')}</span></div>
                  <div><strong>Operator:</strong> {trip.operatorName}</div>
                </div>
              </div>

              {/* 1-Click Gmail Login Bar */}
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-red-600 uppercase font-black tracking-wider block">1-CLICK GMAIL LOGIN</span>
                    <h5 className="text-xs font-black text-slate-900">Autofill Passenger Details with Google</h5>
                  </div>
                </div>
                <GoogleOAuthButton
                  onSuccess={handleGoogleSSOSuccess}
                  onError={(err) => alert(err)}
                  buttonText="Continue with Gmail (Fast 1-Click Autofill)"
                />
              </div>

              {/* Traveller Information Form */}
              <div className="space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">Passenger Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Passenger Name</label>
                    <input
                      type="text"
                      required
                      value={travellerName}
                      onChange={(e) => setTravellerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={travellerPhone}
                      onChange={(e) => setTravellerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gmail / Email Address</label>
                    <input
                      type="email"
                      required
                      value={travellerEmail}
                      onChange={(e) => setTravellerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateway Options */}
              <div className="space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">Select Payment Method</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'UPI' ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Dynamic UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'Card' ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'NetBanking' ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Landmark className="w-5 h-5" />
                    <span>Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Wallet')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'Wallet' ? 'border-red-600 bg-rose-50 text-red-600 shadow-sm' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Wallets</span>
                  </button>
                </div>
              </div>

              {/* Fare Breakdown & Escrow Split Ledger Preview */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Ticket Price ({selectedSeats.length} Seats)</span>
                  <span className="font-mono font-bold">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST & Mandatory Passenger Insurance (5%)</span>
                  <span className="font-mono font-bold">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between text-base font-black text-slate-900">
                  <span>Grand Total Payable</span>
                  <span className="text-red-600 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isProcessing ? 'Processing Payment...' : `Proceed to Pay ₹${grandTotal.toLocaleString('en-IN')}`}</span>
              </button>
            </form>
          ) : (
            /* Booking Confirmation View */
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-900">Booking Confirmed!</h4>
                <p className="text-xs text-slate-500 font-mono">Ticket Booking ID: #{confirmedBooking.id}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs text-left max-w-md mx-auto">
                <div><strong>Passenger:</strong> {confirmedBooking.customerName} ({confirmedBooking.customerEmail})</div>
                <div><strong>Trip:</strong> {confirmedBooking.tripName}</div>
                <div><strong>Seats:</strong> {confirmedBooking.selectedSeats.join(', ')}</div>
                <div><strong>Total Paid:</strong> ₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onViewBookingInDashboard();
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-lg"
                >
                  View Ticket in Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic UPI Payment Modal Component */}
      <DynamicUPIPaymentModal
        isOpen={isUPIModalOpen}
        bookingId={`bk_${Date.now()}`}
        amount={grandTotal}
        tripName={trip.name}
        onClose={() => setIsUPIModalOpen(false)}
        onPaymentSuccess={(txn) => {
          setIsUPIModalOpen(false);
          executeBookingConfirmation();
        }}
      />
    </>
  );
}
