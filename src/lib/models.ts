/**
 * TripMandi - Database Schemas & Data Entities
 * Full TypeScript interfaces and Schema definitions for MongoDB/Mongoose or PostgreSQL equivalent
 */

export type AuthProviderType = 'google' | 'local';
export type OTPPurposeType = 'REGISTRATION' | 'PASSWORD_RESET';
export type PaymentMethodType = 'UPI_INTENT' | 'UPI_QR' | 'CARD' | 'NETBANKING';
export type PaymentStatusType = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

/**
 * 1. USER SCHEMA ENTITY
 */
export interface IUserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone: string;
  googleId?: string;
  authProvider: AuthProviderType;
  role: 'customer' | 'operator' | 'admin' | 'support_agent';
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 2. OTP VERIFICATION SCHEMA ENTITY
 */
export interface IOTPVerificationEntity {
  id: string;
  email: string;
  otpHash: string;
  purpose: OTPPurposeType;
  expiresAt: number; // Timestamp in milliseconds
  attempts: number;
  createdAt: string;
}

/**
 * 3. TRANSACTION SCHEMA ENTITY
 */
export interface ITransactionEntity {
  id: string;
  userId: string;
  bookingId: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  amount: number; // In INR (rupees or paise depending on gateway, stored in Rupees)
  currency: string; // 'INR'
  paymentMethod: PaymentMethodType;
  vpa?: string; // e.g. customer@okaxis or customer@ybl
  qrCodeString?: string;
  upiIntentUrl?: string;
  status: PaymentStatusType;
  rawResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mongoose Schema Definition JSON Reference (for MongoDB ORM setup)
 */
export const MongooseSchemas = {
  UserSchema: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: false },
    phone: { type: String, required: true },
    googleId: { type: String, required: false, index: true },
    authProvider: { type: String, enum: ['google', 'local'], default: 'local' },
    role: { type: String, enum: ['customer', 'operator', 'admin', 'support_agent'], default: 'customer' },
    isEmailVerified: { type: Boolean, default: false },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  OTPVerificationSchema: {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ['REGISTRATION', 'PASSWORD_RESET'], required: true },
    expiresAt: { type: Number, required: true, index: { expires: '10m' } }, // TTL index
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  TransactionSchema: {
    userId: { type: String, required: true, index: true },
    bookingId: { type: String, required: true, index: true },
    gatewayOrderId: { type: String, required: true, unique: true, index: true },
    gatewayPaymentId: { type: String, required: false, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, enum: ['UPI_INTENT', 'UPI_QR', 'CARD', 'NETBANKING'], default: 'UPI_QR' },
    vpa: { type: String },
    qrCodeString: { type: String },
    upiIntentUrl: { type: String },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], default: 'PENDING', index: true },
    rawResponse: { type: Object },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
};
