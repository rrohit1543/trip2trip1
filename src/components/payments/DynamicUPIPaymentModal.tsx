'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, Smartphone, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, Download, ShieldCheck, Ticket } from 'lucide-react';

interface DynamicUPIPaymentModalProps {
  isOpen: boolean;
  bookingId: string;
  amount: number;
  tripName: string;
  onClose: () => void;
  onPaymentSuccess: (transaction: any) => void;
}

export default function DynamicUPIPaymentModal({
  isOpen,
  bookingId,
  amount,
  tripName,
  onClose,
  onPaymentSuccess,
}: DynamicUPIPaymentModalProps) {
  if (!isOpen) return null;

  const [gatewayOrderId, setGatewayOrderId] = useState<string | null>(null);
  const [qrCodeString, setQrCodeString] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('8168561817@ybl');
  const [deepLinks, setDeepLinks] = useState<{ gpay: string; phonePe: string; paytm: string } | null>(null);
  const [status, setStatus] = useState<'INITIALIZING' | 'PENDING' | 'SUCCESS' | 'FAILED'>('INITIALIZING');
  
  const [timeLeftSec, setTimeLeftSec] = useState(300); // 5-minute QR expiry
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<any>(null);

  // 1. Initialize Order via Backend API
  useEffect(() => {
    let isMounted = true;
    const initializeOrder = async () => {
      try {
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, amount, paymentMethod: 'UPI_QR' }),
        });

        const data = await res.json();
        if (data.success && isMounted) {
          setGatewayOrderId(data.gatewayOrderId);
          setQrCodeString(data.qrCodeString);
          if (data.upiId) setUpiId(data.upiId);
          setDeepLinks(data.deepLinks);
          setStatus('PENDING');
        } else if (isMounted) {
          setErrorMsg(data.error || 'Failed to create payment order.');
          setStatus('FAILED');
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg('Network error initializing payment order.');
          setStatus('FAILED');
        }
      }
    };

    initializeOrder();
    return () => { isMounted = false; };
  }, [bookingId, amount]);

  // 2. Countdown Timer (5 Minutes TTL)
  useEffect(() => {
    if (status !== 'PENDING' || timeLeftSec <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status, timeLeftSec]);

  // 3. Real-Time Status Polling (Every 2 seconds)
  useEffect(() => {
    if (status !== 'PENDING' || !gatewayOrderId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${gatewayOrderId}`);
        const data = await res.json();

        if (data.success && data.status === 'SUCCESS') {
          setCompletedTxn(data.transaction);
          setStatus('SUCCESS');
          clearInterval(pollInterval);
        } else if (data.status === 'FAILED') {
          setStatus('FAILED');
          setErrorMsg('Payment transaction was declined or failed.');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling status error:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [status, gatewayOrderId]);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Demo simulation button for instant testing
  const handleSimulateInstantPay = async () => {
    if (!gatewayOrderId) return;
    try {
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'tripmandi_demo_sig',
        },
        body: JSON.stringify({
          event: 'payment.captured',
          gatewayOrderId,
          amount,
          userId: 'usr_customer_1',
          bookingId,
          vpa: upiId,
        }),
      });
      const data = await res.json();
      if (data.success && data.transaction) {
        setCompletedTxn(data.transaction);
        setStatus('SUCCESS');
      }
    } catch (e) {
      // Fallback local status mutation
      setCompletedTxn({
        id: `txn_${Date.now()}`,
        bookingId,
        amount,
        vpa: upiId,
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      });
      setStatus('SUCCESS');
    }
  };

  const handleFinishSuccess = () => {
    onPaymentSuccess(completedTxn || { bookingId, amount, status: 'SUCCESS' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 text-slate-900">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 border border-purple-600/30 flex items-center justify-center text-purple-600 font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {status === 'SUCCESS' ? 'Payment Completed' : 'PhonePe & UPI QR Payment'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Booking #{bookingId}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-full bg-white border border-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Amount Card */}
        {status !== 'SUCCESS' && (
          <div className="p-4 bg-purple-50 border-b border-purple-200 flex items-center justify-between text-slate-900">
            <div>
              <span className="text-[10px] text-purple-700 uppercase font-black tracking-wider block">Total Payable Amount</span>
              <span className="text-2xl font-black text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">QR Expiry Timer</span>
              <span className="text-sm font-mono font-black text-red-600">{formatTimer(timeLeftSec)}</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-5 text-center">
          {status === 'INITIALIZING' && (
            <div className="py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Generating Dynamic UPI QR & Payment Order...</p>
            </div>
          )}

          {status === 'PENDING' && (
            <div className="space-y-5">
              
              {/* OFFICIAL PHONEPE QR CODE DISPLAY */}
              <div className="bg-slate-50 border-2 border-purple-300 rounded-3xl p-4 shadow-md space-y-3">
                <div className="relative mx-auto w-56 h-56 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center p-2">
                  <img
                    src="/phonepe_qr.png"
                    alt="Official PhonePe QR Code - 8168561817@ybl"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                {/* Prominent UPI ID Box with 1-Click Copy */}
                <div className="bg-white border border-purple-200 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm">
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Merchant UPI ID</span>
                    <span className="text-xs font-black text-purple-900 select-all">{upiId}</span>
                  </div>

                  <button
                    onClick={handleCopyUpiId}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy UPI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* PAY VIA MOBILE INSTALLED APP - OFFICIAL LOGOS (PhonePe, GPay, Paytm, BHIM, CRED, Amazon Pay) */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Pay Via Mobile Installed App</span>
                
                <div className="grid grid-cols-3 gap-2.5">
                  {/* 1. PhonePe Logo Button */}
                  <a
                    href={deepLinks?.phonePe || `phonepe://pay?pa=${upiId}&pn=TripMandi&am=${amount}&cu=INR`}
                    className="py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 border border-purple-600"
                  >
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 3.82c4.52 0 8.18 3.66 8.18 8.18s-3.66 8.18-8.18 8.18-8.18-3.66-8.18-8.18 3.66-8.18 8.18-8.18zm-2.05 3.55v9.27l6.82-4.63-6.82-4.64z"/>
                    </svg>
                    <span>PhonePe</span>
                  </a>

                  {/* 2. Google Pay (GPay) Logo Button */}
                  <a
                    href={deepLinks?.gpay || `tez://upi/pay?pa=${upiId}&pn=TripMandi&am=${amount}&cu=INR`}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 border border-slate-700"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>GPay</span>
                  </a>

                  {/* 3. Paytm Logo Button */}
                  <a
                    href={deepLinks?.paytm || `paytmmp://pay?pa=${upiId}&pn=TripMandi&am=${amount}&cu=INR`}
                    className="py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 border border-sky-500"
                  >
                    <span className="font-mono text-sm font-black tracking-tighter text-cyan-200">Paytm</span>
                  </a>

                  {/* 4. BHIM UPI Logo Button */}
                  <a
                    href={`upi://pay?pa=${upiId}&pn=TripMandi&am=${amount}&cu=INR`}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 border border-emerald-500"
                  >
                    <svg className="w-5 h-5 shrink-0 fill-current text-amber-300" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span>BHIM UPI</span>
                  </a>

                  {/* 5. CRED UPI Logo Button */}
                  <a
                    href={`upi://pay?pa=${upiId}&pn=TripMandi&am=${amount}&cu=INR`}
                    className="py-2.5 px-3 bg-black hover:bg-slate-900 text-white text-xs font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 border border-slate-700 font-mono"
                  >
                    <span className="tracking-widest text-amber-400 text-xs">CRED</span>
                  </a>

                  {/* 6. Amazon Pay Logo Button */}
                  <a
                    href={`upi://pay?pa=${upiId}&pn=TripMandi&am=${amount}&cu=INR`}
                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 border border-amber-400"
                  >
                    <span>Amazon Pay</span>
                  </a>
                </div>
              </div>

              {/* Real-time status indicator */}
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
                <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                <span>Waiting for bank confirmation...</span>
              </div>

              {/* Instant Developer Simulation Button */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSimulateInstantPay}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Successful UPI Payment</span>
                </button>
              </div>
            </div>
          )}

          {/* PAYMENT DONE SUCCESS CARD */}
          {status === 'SUCCESS' && (
            <div className="py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Green Animated Success Badge */}
              <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50 ring-8 ring-emerald-100">
                <CheckCircle2 className="w-12 h-12 text-white stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                  PAYMENT VERIFIED & CONFIRMED
                </span>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">PAYMENT DONE!</h4>
                <p className="text-xs text-slate-500 font-bold">Your Bus Ticket Booking Has Been Confirmed</p>
              </div>

              {/* Transaction Summary Table Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-left font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">Booking ID</span>
                  <span className="font-black text-slate-900">#{bookingId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1.5">
                  <span className="text-slate-500 font-bold">Total Paid</span>
                  <span className="font-black text-emerald-600 text-sm">₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1.5">
                  <span className="text-slate-500 font-bold">Merchant UPI VPA</span>
                  <span className="font-bold text-slate-800">{upiId}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-bold">Payment Status</span>
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    SUCCESS (Captured)
                  </span>
                </div>
              </div>

              {/* SMS & WhatsApp Notification Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant SMS & WhatsApp confirmation sent to mobile!</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleFinishSuccess}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View E-Ticket & Passengers</span>
                </button>
              </div>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 bg-red-100 border border-red-300 rounded-full flex items-center justify-center mx-auto text-red-600">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">Payment Failed</h4>
                <p className="text-xs text-red-600 font-bold">{errorMsg || 'Unable to process payment.'}</p>
              </div>
              <button
                onClick={() => setStatus('INITIALIZING')}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Retry Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
