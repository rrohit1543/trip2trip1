'use client';

import React, { useState } from 'react';
import { Trip, Booking } from '../../types';
import { X, ShieldAlert, QrCode, CreditCard, Landmark, Wallet, CheckCircle2, Download, Radio, Lock, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const basePrice = selectedSeats.length * trip.pricePerPerson;
  const gstAmount = Math.round(basePrice * 0.05);
  const grandTotal = basePrice + gstAmount;

  // Split calculation preview
  const estimatedCommission = Math.round(grandTotal * 0.1);
  const estimatedAgencyNet = grandTotal - estimatedCommission;

  const handleGmailQuickLogin = () => {
    setTravellerName('Rahul Sharma (Verified via Google)');
    setTravellerEmail('rahul.sharma@gmail.com');
    setTravellerPhone('+91 98765 43210');
    alert('Logged in successfully via Gmail Account! Your details have been autofilled for booking.');
  };

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
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
        paymentStatus: 'paid',
        pickupPoint,
        dropPoint,
        promoCodeApplied: promoCode,
        gstInvoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      });

      setIsProcessing(false);
      setConfirmedBooking(booking);

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#ffffff', '#000000'],
        });
      } catch (err) {
        console.error(err);
      }
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-white border-2 border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {confirmedBooking ? 'Booking Confirmed!' : 'Automated Split Checkout'}
              </h3>
              <p className="text-xs text-slate-500">
                {confirmedBooking ? 'GST Invoice & Ticket Generated' : 'Nodal Escrow Instant Settlement Protection'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-full bg-white border border-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="p-6 overflow-y-auto space-y-6 text-center bg-white text-slate-900">
            <div className="w-16 h-16 bg-red-600/10 border-2 border-red-600 rounded-full flex items-center justify-center mx-auto text-red-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Trip Booking Successfully Confirmed!</h2>
              <p className="text-xs text-slate-500 mt-1">Booking ID: <strong className="text-red-600 font-mono">{confirmedBooking.id}</strong> &bull; Invoice: <strong className="text-slate-900 font-mono">{confirmedBooking.gstInvoiceNumber}</strong></p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="text-xs font-bold text-red-600 font-mono uppercase">{confirmedBooking.operatorName}</div>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{confirmedBooking.tripName}</h4>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Passenger Name</span>
                  <span className="text-slate-900 font-bold">{confirmedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Seats Booked</span>
                  <span className="text-red-600 font-bold font-mono">S{confirmedBooking.selectedSeats.join(', S')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Boarding Location</span>
                  <span className="text-slate-700 font-medium">{confirmedBooking.pickupPoint}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Paid</span>
                  <span className="text-red-600 font-bold">₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => alert(`Downloading Digital GST Ticket PDF for Booking #${confirmedBooking.id}...`)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-red-600" />
                <span>Download GST Ticket (PDF)</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onViewBookingInDashboard();
                }}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Track Trip Live Now</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePayNow} className="p-6 overflow-y-auto space-y-6 flex-1 bg-white text-slate-900">
            {/* Quick 1-Click Gmail Authentication Button */}
            <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white border border-rose-300 flex items-center justify-center text-red-600 shrink-0 font-bold">
                  G
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Book Faster with Gmail Login</h4>
                  <p className="text-[11px] text-slate-500">Sign in with Google to autofill contact details & get instant SMS/Email ticket confirmation.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGmailQuickLogin}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-xs flex items-center gap-2 shadow-sm shrink-0 transition"
              >
                <Mail className="w-4 h-4 text-red-600" />
                <span>Continue with Gmail</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Booking & Split Summary</div>
              <h4 className="text-base font-bold text-slate-900">{trip.name}</h4>
              <div className="text-xs text-slate-700 flex items-center justify-between pt-2 border-t border-slate-200">
                <span>Seats Selected: <strong className="text-red-600 font-mono">S{selectedSeats.join(', S')}</strong></span>
                <span>Base Fare: <strong>₹{basePrice.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="text-xs text-slate-700 flex items-center justify-between">
                <span>GST (5%):</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center justify-between pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-red-600 text-lg font-black">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Payment Split Protocol Notice */}
              <div className="bg-white border border-slate-200 p-3 rounded-xl text-[11px] text-slate-500 space-y-1 mt-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-600" /> Automated Payment Split Gateway Protocol
                </div>
                <div className="flex justify-between">
                  <span>Escrow Nodal Account:</span>
                  <span className="font-mono font-bold text-slate-900">Razorpay Route / Cashfree Split</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Commission (10%):</span>
                  <span className="font-mono text-red-600">₹{estimatedCommission.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agency Net Settlement (T+1):</span>
                  <span className="font-mono text-slate-900">₹{estimatedAgencyNet.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Passenger Contact Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={travellerName}
                    onChange={(e) => setTravellerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gmail / Email Address</label>
                  <input
                    type="email"
                    required
                    value={travellerEmail}
                    onChange={(e) => setTravellerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Select Payment Mode</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'UPI'
                      ? 'bg-red-600/10 border-red-600 text-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'Card'
                      ? 'bg-red-600/10 border-red-600 text-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'NetBanking'
                      ? 'bg-red-600/10 border-red-600 text-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Wallet')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'Wallet'
                      ? 'bg-red-600/10 border-red-600 text-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Wallets</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Nodal Payment Split...</span>
                </>
              ) : (
                <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Confirm Ticket</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
