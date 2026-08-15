/**
 * TripMandi - Production Anti-Abuse Rate Limiter & Cryptographic Hashed OTP Engine
 * Strictly enforces SHA-256 HMAC OTP Hashing, 5-Minute Expiry TTL, Max 3 Verification Attempts,
 * Immediate Invalidation upon use/max-attempts, 60-second Resend Cooldown, and Throttling.
 */

import crypto from 'crypto';

export interface OTPSessionData {
  identifier: string;
  type: 'email' | 'mobile';
  otpHash: string;
  expiresAt: number; // Timestamp in ms (5-minute TTL)
  attempts: number; // Counter: Max 3 attempts
  isUsed: boolean;
  lastRequestedAt: number;
  tempUserData?: Record<string, any>;
}

// In-Memory Hashed OTP Session Store (Production: Redis / MongoDB TTL collection)
const otpStore: Record<string, OTPSessionData> = {};
const rateLimitRequestLog: Record<string, number[]> = {};

/**
 * SHA-256 HMAC Cryptographic Hasher for OTPs (Never store plain-text OTPs)
 */
export function hashOTPCode(code: string): string {
  const secretSalt = process.env.OTP_SALT || 'tripmandi_otp_hmac_secret_2026';
  return crypto.createHmac('sha256', secretSalt).update(code.trim()).digest('hex');
}

/**
 * Verify input OTP code against stored SHA-256 HMAC hash
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
 * 2. Check Resend Cooldown (60 seconds)
 */
export function checkResendCooldown(identifier: string, cooldownSec = 60): {
  canResend: boolean;
  cooldownRemainingSec?: number;
} {
  const key = identifier.toLowerCase().trim();
  const session = otpStore[key];
  if (!session) return { canResend: true };

  const elapsed = (Date.now() - session.lastRequestedAt) / 1000;
  if (elapsed < cooldownSec) {
    return {
      canResend: false,
      cooldownRemainingSec: Math.ceil(cooldownSec - elapsed),
    };
  }

  return { canResend: true };
}

/**
 * 3. Save Hashed OTP Entry with 5-Minute TTL (Resets attempt counter & invalidates old OTP)
 */
export function saveOTPEntry(params: {
  identifier: string;
  type: 'email' | 'mobile';
  otpCode: string;
  ttlMinutes?: number;
  tempUserData?: Record<string, any>;
}): { otpHash: string; expiresAt: number } {
  const { identifier, type, otpCode, ttlMinutes = 5, tempUserData } = params;
  const key = identifier.toLowerCase().trim();
  const otpHash = hashOTPCode(otpCode);
  const now = Date.now();
  const expiresAt = now + ttlMinutes * 60 * 1000;

  // Invalidate any previous OTP & store clean entry with 0 attempts
  otpStore[key] = {
    identifier: key,
    type,
    otpHash,
    expiresAt,
    attempts: 0, // Reset attempt counter to 0 for new OTP
    isUsed: false,
    lastRequestedAt: now,
    tempUserData,
  };

  return { otpHash, expiresAt };
}

/**
 * 4. Verify OTP with Strict Attempt Counting (Max 3 attempts, 5-minute TTL)
 */
export function verifyOTPStrict(identifier: string, inputCode: string): {
  success: boolean;
  message: string;
  attemptsRemaining: number;
  session?: OTPSessionData;
} {
  const key = identifier.toLowerCase().trim();
  const session = otpStore[key];
  const now = Date.now();

  if (!session) {
    return {
      success: false,
      attemptsRemaining: 0,
      message: 'No active OTP verification session found. Please request a new OTP.',
    };
  }

  // Check if already used
  if (session.isUsed) {
    return {
      success: false,
      attemptsRemaining: 0,
      message: 'This OTP has already been used. Please request a new OTP.',
    };
  }

  // Check Expiry (5-Minute TTL)
  if (now > session.expiresAt) {
    session.isUsed = true;
    return {
      success: false,
      attemptsRemaining: 0,
      message: 'This OTP has expired. Please request a new OTP.',
    };
  }

  // Check Max Attempt Limit (3 Attempts)
  if (session.attempts >= 3) {
    session.isUsed = true; // Invalidate OTP
    return {
      success: false,
      attemptsRemaining: 0,
      message: 'Maximum verification attempts reached. Please request a new OTP.',
    };
  }

  // Validate OTP Hash
  const isMatch = verifyOTPHashCode(inputCode, session.otpHash);

  if (!isMatch) {
    session.attempts += 1;
    const attemptsRemaining = Math.max(0, 3 - session.attempts);

    if (session.attempts >= 3) {
      session.isUsed = true; // Invalidate immediately on 3rd fail
      return {
        success: false,
        attemptsRemaining: 0,
        message: 'Maximum verification attempts reached. Please request a new OTP.',
      };
    }

    return {
      success: false,
      attemptsRemaining,
      message: `Invalid OTP. Please try again. (${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining)`,
    };
  }

  // SUCCESS: Mark used & invalidate immediately
  session.isUsed = true;

  return {
    success: true,
    attemptsRemaining: 3 - session.attempts,
    message: 'OTP verified successfully!',
    session,
  };
}

/**
 * Helper to get current session attempt state
 */
export function getOTPSessionState(identifier: string): { attempts: number; attemptsRemaining: number } {
  const key = identifier.toLowerCase().trim();
  const session = otpStore[key];
  if (!session || session.isUsed) return { attempts: 0, attemptsRemaining: 3 };
  return {
    attempts: session.attempts,
    attemptsRemaining: Math.max(0, 3 - session.attempts),
  };
}
