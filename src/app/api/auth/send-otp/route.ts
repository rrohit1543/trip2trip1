import { NextResponse } from 'next/server';
import { parseAndValidateIdentifier } from '@/lib/identifierDetector';
import { checkOTPRateLimit, saveOTPEntry } from '@/lib/otpStore';
import { generateSecureOTP } from '@/lib/authServer';
import { sendOTPEmail } from '@/lib/emailService';
import { sendSMSOTP } from '@/lib/smsService';

/**
 * POST /api/auth/send-otp & POST /api/v1/auth/send-otp
 * Step 1: Validate Email or Mobile Number.
 * Step 2: Rate Limiting Check (Max 3 attempts per 10 mins).
 * Step 3: Generate 6-Digit Cryptographic OTP & SHA-256 HMAC Hash (5-min TTL).
 * Step 4: Dispatch Real Email via NodeMailer / SMTP or SMS/WhatsApp.
 * SECURITY: Plaintext OTP is NEVER returned in response JSON.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.email || body.identifier;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address or mobile number.' },
        { status: 400 }
      );
    }

    // 1. Validate Identifier
    const parsed = parseAndValidateIdentifier(identifier);
    if (!parsed.isValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.type === 'email'
              ? 'Invalid email address format.'
              : 'Invalid mobile number format. Please enter a valid 10-digit or international format.',
        },
        { status: 400 }
      );
    }

    // 2. Rate Limiting Check (Max 3 requests per 10 minutes)
    const rateCheck = checkOTPRateLimit(parsed.normalizedIdentifier, 3, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many OTP requests. Maximum 3 requests allowed per 10 minutes. Please retry in ${rateCheck.retryAfterSec} seconds.`,
          retryAfterSec: rateCheck.retryAfterSec,
        },
        { status: 429 }
      );
    }

    // 3. Generate Cryptographically Secure 6-Digit OTP Code
    const { code } = generateSecureOTP();

    // Save SHA-256 Hashed OTP Entry with 5-minute TTL (Never store plain-text)
    saveOTPEntry({
      identifier: parsed.normalizedIdentifier,
      type: parsed.type,
      otpCode: code,
      ttlMinutes: 5,
    });

    // 4. Deliver real email via NodeMailer SMTP
    let dispatchResult: any = null;
    if (parsed.type === 'email') {
      dispatchResult = await sendOTPEmail({
        toEmail: parsed.normalizedIdentifier,
        otpCode: code,
        purpose: 'REGISTRATION',
      });
    } else {
      dispatchResult = await sendSMSOTP({
        mobileNumber: parsed.normalizedIdentifier,
        otpCode: code,
        channel: 'SMS',
      });
    }

    if (!dispatchResult.success) {
      return NextResponse.json(
        { success: false, error: dispatchResult.message || 'Email delivery failure. Please try again.' },
        { status: 500 }
      );
    }

    // Production Response: NEVER expose the OTP code!
    return NextResponse.json({
      success: true,
      message: `A 6-digit OTP code has been sent to your ${parsed.type === 'email' ? 'email' : 'mobile'} (${parsed.formattedDisplay}).`,
      email: parsed.type === 'email' ? parsed.normalizedIdentifier : undefined,
      identifier: parsed.normalizedIdentifier,
      expiresInSeconds: 300, // 5 minutes
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/send-otp:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
