'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, Smartphone, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';

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
  const [upiId, setUpiId] = useState<string>('paytm.s2fhsqm@pty');
  const [deepLinks, setDeepLinks] = useState<{ gpay: string; phonePe: string; paytm: string } | null>(null);
  const [status, setStatus] = useState<'INITIALIZING' | 'PENDING' | 'SUCCESS' | 'FAILED'>('INITIALIZING');
  
  const [timeLeftSec, setTimeLeftSec] = useState(300); // 5-minute QR expiry
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

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

  // 3. Real-Time Status Polling (Every 2.5 seconds)
  useEffect(() => {
    if (status !== 'PENDING' || !gatewayOrderId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${gatewayOrderId}`);
        const data = await res.json();

        if (data.success && data.status === 'SUCCESS') {
          setStatus('SUCCESS');
          clearInterval(pollInterval);
          setTimeout(() => {
            onPaymentSuccess(data.transaction);
          }, 1500);
        } else if (data.status === 'FAILED') {
          setStatus('FAILED');
          setErrorMsg('Payment transaction was declined or failed.');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling status error:', err);
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [status, gatewayOrderId, onPaymentSuccess]);

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
      await fetch('/api/payments/webhook', {
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
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 text-slate-900">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Paytm & UPI QR Payment</h3>
              <p className="text-xs text-slate-500 font-mono">Booking #{bookingId}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-full bg-white border border-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Amount Card */}
        <div className="p-4 bg-sky-50 border-b border-sky-200 flex items-center justify-between text-slate-900">
          <div>
            <span className="text-[10px] text-sky-700 uppercase font-black tracking-wider block">Total Payable Amount</span>
            <span className="text-2xl font-black text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">QR Expiry Timer</span>
            <span className="text-sm font-mono font-black text-red-600">{formatTimer(timeLeftSec)}</span>
          </div>
        </div>

        <div className="p-6 space-y-5 text-center">
          {status === 'INITIALIZING' && (
            <div className="py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Generating Paytm UPI QR & Payment Order...</p>
            </div>
          )}

          {status === 'PENDING' && (
            <div className="space-y-5">
              
              {/* OFFICIAL PAYTM QR CODE DISPLAY */}
              <div className="bg-slate-50 border-2 border-sky-300 rounded-3xl p-4 shadow-md space-y-3">
                <div className="relative mx-auto w-52 h-52 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center p-2">
                  <img
                    src="/paytm_qr.jpg"
                    alt="Official Paytm QR Code - paytm.s2fhsqm@pty"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                {/* Prominent UPI ID Box with 1-Click Copy */}
                <div className="bg-white border border-sky-200 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm">
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Merchant UPI ID</span>
                    <span className="text-xs font-black text-sky-900 select-all">{upiId}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
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

              <p className="text-xs text-slate-600">
                Scan this Paytm QR code or transfer to <strong className="text-slate-900 font-mono">{upiId}</strong> using GPay, PhonePe, Paytm, or BHIM.
              </p>

              {/* MOBILE VIEW: Deep-Link UPI Intent Buttons */}
              {deepLinks && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">
                    Mobile Direct UPI Intent Apps
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={deepLinks.paytm}
                      className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl text-xs font-black text-sky-900 flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Smartphone className="w-4 h-4 text-sky-600" />
                      <span>Paytm</span>
                    </a>

                    <a
                      href={deepLinks.gpay}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>GPay</span>
                    </a>

                    <a
                      href={deepLinks.phonePe}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Smartphone className="w-4 h-4 text-purple-600" />
                      <span>PhonePe</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Live Polling Status Indicator & Dev Simulator */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                  <span className="font-bold">Awaiting Payment Confirmation...</span>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateInstantPay}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
                >
                  Simulate Paid
                </button>
              </div>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-500 font-mono">Paid to {upiId}</p>
                <p className="text-xs text-slate-500 font-mono">Txn ID: {gatewayOrderId}</p>
              </div>
              <p className="text-xs text-emerald-700 font-bold">Your booking has been confirmed & ticket QR code generated.</p>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="py-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-red-500 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">Payment Failed</h4>
                <p className="text-xs text-red-600 font-bold">{errorMsg || 'Transaction declined by bank.'}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatus('INITIALIZING')}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md"
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
