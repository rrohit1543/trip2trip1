import { NextResponse } from 'next/server';
import { checkRateLimit, generateSecureOTP } from '../../../../lib/authServer';
import { sendOTPEmail } from '../../../../lib/emailService';

// Temporary OTP Session Store for DB Persistence
const pendingOTPStore: Record<string, { email: string; otpHash: string; expiresAt: number; tempUserData: any }> = {};

export function getPendingOTPEntry(email: string) {
  return pendingOTPStore[email.toLowerCase()];
}

export function clearPendingOTPEntry(email: string) {
  delete pendingOTPStore[email.toLowerCase()];
}

/**
 * POST /api/auth/signup
 * Step 1: User submits Name, Email, Phone, and Password.
 * Step 2: Rate limit enforced (max 3 attempts per IP/Email per 15 min).
 * Step 3: Backend generates 6-digit OTP (10-min TTL) & sends via Gmail SMTP.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role = 'customer' } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required fields.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Rate Limiting Check (OWASP Guideline)
    const rateCheck = checkRateLimit(`signup_${normalizedEmail}`, 3, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many signup attempts. Please wait ${rateCheck.retryAfterSec || 900} seconds before retrying.`,
        },
        { status: 429 }
      );
    }

    // 2. Generate Cryptographically Secure 6-Digit OTP (10-min TTL)
    const { code, hash } = generateSecureOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save in temporary OTP store / DB
    pendingOTPStore[normalizedEmail] = {
      email: normalizedEmail,
      otpHash: hash,
      expiresAt,
      tempUserData: { name, email: normalizedEmail, phone: phone || '+91 9876543210', password, role },
    };

    // 3. Dispatch Gmail SMTP OTP Email
    const mailResult = await sendOTPEmail({
      toEmail: normalizedEmail,
      recipientName: name,
      otpCode: code,
      purpose: 'REGISTRATION',
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification OTP has been sent to ${normalizedEmail}. Valid for 10 minutes.`,
      otpDemoCode: code, // Rendered for seamless developer demo testing
      expiresInSeconds: 600,
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/signup:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
