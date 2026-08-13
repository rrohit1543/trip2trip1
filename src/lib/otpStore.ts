/**
 * TripMandi - Anti-Abuse Rate Limiter & Hashed OTP Storage Engine
 * Enforces SHA-256 OTP Hashing, Rate-Limiting (max 3/10m), and Account Lockout (5 failed attempts).
 */

import crypto from 'crypto';

export interface OTPSessionData {
  identifier: string;
  type: 'email' | 'mobile';
  otpHash: string;
  expiresAt: number; // Timestamp in ms (10-minute TTL)
  attempts: number; // Counter for anti-bruteforce lockout
  isUsed: boolean;
  lockoutUntil?: number; // Timestamp if locked out
  tempUserData?: Record<string, any>;
}

// In-Memory Hashed OTP Session Store (Production: Redis / MongoDB TTL collection)
const otpStore: Record<string, OTPSessionData> = {};
const rateLimitRequestLog: Record<string, number[]> = {};

/**
 * SHA-256 Cryptographic Hasher for OTPs (Never store plain-text OTPs)
 */
export function hashOTPCode(code: string): string {
  const secretSalt = process.env.OTP_SALT || 'tripmandi_otp_hmac_secret_2026';
  return crypto.createHmac('sha256', secretSalt).update(code.trim()).digest('hex');
}

/**
 * Verify input OTP code against stored SHA-256 hash
 */
export function verifyOTPHashCode(inputCode: string, storedHash: string): boolean {
  return hashOTPCode(inputCode) === storedHash;
}

/**
 * 1. Rate Limiter: Max 3 OTP requests per 10 minutes per IP/identifier
 */
export function checkOTPRateLimit(identifier: string, maxRequests = 3, windowMs = 10 * 60 * 1000): {
  allowed: boolean;
  retryAfterSec?: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  const key = identifier.toLowerCase().trim();

  if (!rateLimitRequestLog[key]) {
    rateLimitRequestLog[key] = [now];
    return { allowed: true, remainingAttempts: maxRequests - 1 };
  }

  // Filter timestamps within the 10-minute window
  const validTimestamps = rateLimitRequestLog[key].filter((ts) => now - ts < windowMs);
  rateLimitRequestLog[key] = validTimestamps;

  if (validTimestamps.length >= maxRequests) {
    const oldest = validTimestamps[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSec, remainingAttempts: 0 };
  }

  rateLimitRequestLog[key].push(now);
  return { allowed: true, remainingAttempts: maxRequests - rateLimitRequestLog[key].length };
}

/**
 * 2. Save Hashed OTP Entry with 10-minute TTL
 */
export function saveOTPEntry(params: {
  identifier: string;
  type: 'email' | 'mobile';
  otpCode: string;
  ttlMinutes?: number;
  tempUserData?: Record<string, any>;
}): { otpHash: string; expiresAt: number } {
  const { identifier, type, otpCode, ttlMinutes = 10, tempUserData } = params;
  const key = identifier.toLowerCase().trim();
  const otpHash = hashOTPCode(otpCode);
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  const existing = otpStore[key];

  otpStore[key] = {
    identifier: key,
    type,
    otpHash,
    expiresAt,
    attempts: existing ? existing.attempts : 0, // preserve attempt count if re-requesting
    isUsed: false,
    tempUserData,
  };

  return { otpHash, expiresAt };
}

/**
 * 3. Lockout Protection: Check & verify OTP with failed attempt tracking (Lockout after 5 fails)
 */
export function verifyOTPWithLockout(identifier: string, inputCode: string): {
  success: boolean;
  isLockedOut: boolean;
  lockoutRemainingSec?: number;
  message: string;
  session?: OTPSessionData;
} {
  const key = identifier.toLowerCase().trim();
  const session = otpStore[key];
  const now = Date.now();

  if (!session) {
    return { success: false, isLockedOut: false, message: 'No active OTP verification session found for this contact.' };
  }

  // Check if account is locked out
  if (session.lockoutUntil && now < session.lockoutUntil) {
    const lockoutRemainingSec = Math.ceil((session.lockoutUntil - now) / 1000);
    return {
      success: false,
      isLockedOut: true,
      lockoutRemainingSec,
      message: `Account temporarily locked out due to multiple failed attempts. Please wait ${lockoutRemainingSec} seconds.`,
    };
  }

  // Check Expiry (10-min TTL)
  if (now > session.expiresAt || session.isUsed) {
    return { success: false, isLockedOut: false, message: 'OTP code has expired or already been used. Please request a new OTP.' };
  }

  // Validate OTP Hash
  const isMatch = verifyOTPHashCode(inputCode, session.otpHash);

  if (!isMatch) {
    session.attempts += 1;

    // Trigger Lockout after 5 failed attempts
    if (session.attempts >= 5) {
      session.lockoutUntil = now + 15 * 60 * 1000; // 15 minute lockout
      const lockoutRemainingSec = 15 * 60;
      return {
        success: false,
        isLockedOut: true,
        lockoutRemainingSec,
        message: 'Maximum 5 verification attempts exceeded. Account locked out for 15 minutes.',
      };
    }

    const attemptsLeft = 5 - session.attempts;
    return {
      success: false,
      isLockedOut: false,
      message: `Invalid 6-digit OTP code. ${attemptsLeft} verification attempts remaining before lockout.`,
    };
  }

  // Mark session used & reset attempt counter
  session.isUsed = true;
  session.attempts = 0;
  session.lockoutUntil = undefined;

  return {
    success: true,
    isLockedOut: false,
    message: 'OTP verified successfully!',
    session,
  };
}
