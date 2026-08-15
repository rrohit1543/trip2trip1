/**
 * TripMandi - Dynamic UPI & QR Payment Gateway Provider Engine
 * Supports Razorpay, PhonePe, Paytm, and Cashfree API standards with:
 * 1. Order Creation
 * 2. Dynamic UPI QR String Generation (Target VPA: 8168561817@ybl)
 * 3. Deep-link UPI Intent URLs (GPay, PhonePe, Paytm, BHIM)
 * 4. HMAC Webhook Signature Validation
 * 5. Idempotent Transaction Persistence
 */

import crypto from 'crypto';
import { ITransactionEntity, PaymentStatusType, PaymentMethodType } from './models';

// Gateway Credentials & Configuration
const MERCHANT_VPA = process.env.MERCHANT_VPA || '8168561817@ybl';
const MERCHANT_NAME = process.env.MERCHANT_NAME || 'TripMandi Travel Solutions';
const GATEWAY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.PHONEPE_SALT_KEY || 'tripmandi_webhook_secret_key_2026';

// Persistent Transaction Store
const transactionsStore: Record<string, ITransactionEntity> = {};

/**
 * 1. Generate Deep-Link UPI Intent URL for Mobile Devices
 */
export function generateUPIIntentUrl(params: {
  vpa: string;
  merchantName: string;
  transactionRef: string;
  orderId: string;
  amount: number;
  note: string;
}): {
  genericIntentUrl: string;
  gpayUrl: string;
  phonePeUrl: string;
  paytmUrl: string;
} {
  const { vpa, merchantName, transactionRef, orderId, amount, note } = params;
  const encodedName = encodeURIComponent(merchantName);
  const encodedNote = encodeURIComponent(note);
  
  const baseUpiParams = `pa=${vpa}&pn=${encodedName}&tr=${transactionRef}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
  
  const genericIntentUrl = `upi://pay?${baseUpiParams}`;
  const gpayUrl = `tez://upi/pay?${baseUpiParams}`;
  const phonePeUrl = `phonepe://pay?${baseUpiParams}`;
  const paytmUrl = `paytmmp://pay?${baseUpiParams}`;

  return {
    genericIntentUrl,
    gpayUrl,
    phonePeUrl,
    paytmUrl,
  };
}

/**
 * 2. Generate Dynamic UPI QR Code String
 */
export function generateDynamicUPIQR(params: {
  vpa: string;
  merchantName: string;
  transactionRef: string;
  amount: number;
  note: string;
}): string {
  const { vpa, merchantName, transactionRef, amount, note } = params;
  return `upi://pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&tr=${transactionRef}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
}

/**
 * 3. Create Gateway Payment Order (Razorpay / PhonePe / Paytm / Cashfree format)
 */
export async function createGatewayOrder(params: {
  userId: string;
  bookingId: string;
  amount: number; // Rupees
  currency?: string;
  paymentMethod?: PaymentMethodType;
}): Promise<{
  transaction: ITransactionEntity;
  gatewayOrderId: string;
  qrCodeString: string;
  upiIntentUrl: string;
  upiId: string;
  deepLinks: { gpay: string; phonePe: string; paytm: string };
  razorpayOptions?: Record<string, any>;
}> {
  const { userId, bookingId, amount, currency = 'INR', paymentMethod = 'UPI_QR' } = params;
  
  const orderTimestamp = Date.now();
  const gatewayOrderId = `order_tm_${orderTimestamp}_${Math.floor(1000 + Math.random() * 9000)}`;
  const transactionRef = `TXN_${bookingId}_${orderTimestamp}`;
  const note = `TripMandi Booking #${bookingId}`;

  const qrCodeString = generateDynamicUPIQR({
    vpa: MERCHANT_VPA,
    merchantName: MERCHANT_NAME,
    transactionRef,
    amount,
    note,
  });

  const deepLinks = generateUPIIntentUrl({
    vpa: MERCHANT_VPA,
    merchantName: MERCHANT_NAME,
    transactionRef,
    orderId: gatewayOrderId,
    amount,
    note,
  });

  const newTransaction: ITransactionEntity = {
    id: `txn_${orderTimestamp}`,
    userId,
    bookingId,
    gatewayOrderId,
    amount,
    currency,
    paymentMethod,
    vpa: MERCHANT_VPA,
    qrCodeString,
    upiIntentUrl: deepLinks.genericIntentUrl,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  transactionsStore[gatewayOrderId] = newTransaction;

  return {
    transaction: newTransaction,
    gatewayOrderId,
    qrCodeString,
    upiIntentUrl: deepLinks.genericIntentUrl,
    upiId: MERCHANT_VPA,
    deepLinks: {
      gpay: deepLinks.gpayUrl,
      phonePe: deepLinks.phonePeUrl,
      paytm: deepLinks.paytmUrl,
    },
    razorpayOptions: {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_tripmandi2026',
      amount: amount * 100, // paise
      currency,
      name: 'TripMandi Travel Solutions',
      description: note,
      order_id: gatewayOrderId,
    },
  };
}

/**
 * 4. Fetch Transaction Status for Real-Time Polling
 */
export function getTransactionStatus(gatewayOrderId: string): ITransactionEntity | null {
  return transactionsStore[gatewayOrderId] || null;
}

/**
 * 5. HMAC Webhook Signature Validator (Razorpay / PhonePe)
 */
export function verifyWebhookSignature(rawBody: string, signature: string, secret = GATEWAY_SECRET): boolean {
  if (!signature) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (err) {
    console.error('Webhook signature verification error:', err);
    return false;
  }
}

/**
 * 6. Process Webhook Event with Idempotency Protection
 */
export function processPaymentWebhook(payload: {
  event: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  paymentMethod?: string;
  vpa?: string;
  rawPayload: Record<string, any>;
}): { success: boolean; transaction?: ITransactionEntity; isDuplicate: boolean } {
  const { event, gatewayOrderId, gatewayPaymentId, paymentMethod, vpa, rawPayload } = payload;
  
  const txn = transactionsStore[gatewayOrderId];
  if (!txn) {
    // Create new transaction entry if not found locally
    const createdTxn: ITransactionEntity = {
      id: `txn_wh_${Date.now()}`,
      userId: rawPayload.userId || 'usr_customer_1',
      bookingId: rawPayload.bookingId || 'bk_demo',
      gatewayOrderId,
      gatewayPaymentId: gatewayPaymentId || `pay_${Date.now()}`,
      amount: rawPayload.amount || 0,
      currency: 'INR',
      paymentMethod: (paymentMethod as any) || 'UPI_QR',
      vpa: vpa || MERCHANT_VPA,
      status: event === 'payment.captured' || event === 'PAYMENT_SUCCESS' ? 'SUCCESS' : 'FAILED',
      rawResponse: rawPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactionsStore[gatewayOrderId] = createdTxn;
    return { success: true, transaction: createdTxn, isDuplicate: false };
  }

  // Idempotency Check: If already processed SUCCESS, return without mutating
  if (txn.status === 'SUCCESS' && (event === 'payment.captured' || event === 'PAYMENT_SUCCESS')) {
    return { success: true, transaction: txn, isDuplicate: true };
  }

  const updatedStatus: PaymentStatusType =
    event === 'payment.captured' || event === 'PAYMENT_SUCCESS' ? 'SUCCESS' : 'FAILED';

  txn.status = updatedStatus;
  txn.gatewayPaymentId = gatewayPaymentId || txn.gatewayPaymentId || `pay_${Date.now()}`;
  if (vpa) txn.vpa = vpa;
  txn.rawResponse = rawPayload;
  txn.updatedAt = new Date().toISOString();

  transactionsStore[gatewayOrderId] = txn;
  return { success: true, transaction: txn, isDuplicate: false };
}
