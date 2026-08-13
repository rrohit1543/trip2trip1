import { NextResponse } from 'next/server';
import { parseAndValidateIdentifier } from '../../../../../lib/identifierDetector';
import { checkOTPRateLimit, saveOTPEntry } from '../../../../../lib/otpStore';
import { generateSecureOTP } from '../../../../../lib/authServer';
import { sendOTPEmail } from '../../../../../lib/emailService';
import { sendSMSOTP } from '../../../../../lib/smsService';

/**
 * POST /api/v1/auth/send-otp
 * Step 1: Detect Email vs Mobile Number.
 * Step 2: Rate Limiting Check (Max 3 attempts per 10 mins per IP/identifier).
 * Step 3: Generate 6-digit numerical OTP & SHA-256 HMAC hash.
 * Step 4: Dispatch via Email (SMTP/SendGrid) or SMS/WhatsApp (Twilio/Fast2SMS).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Identifier parameter (email or mobile number) is required.' },
        { status: 400 }
      );
    }

    // 1. Dual Identification System Detection & Validation
    const parsed = parseAndValidateIdentifier(identifier);
    if (!parsed.isValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.type === 'email'
              ? 'Invalid email address format provided.'
              : 'Invalid mobile number format. Please provide valid international format (e.g. +91 9876543210 or 9876543210).',
        },
        { status: 400 }
      );
    }

    // 2. Anti-Abuse Rate Limiting Check (Max 3 requests per 10 minutes)
    const rateCheck = checkOTPRateLimit(parsed.normalizedIdentifier, 3, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Maximum 3 OTP requests allowed per 10 minutes. Please retry in ${rateCheck.retryAfterSec} seconds.`,
          retryAfterSec: rateCheck.retryAfterSec,
        },
        { status: 429 }
      );
    }

    // 3. Generate Cryptographically Secure 6-Digit OTP Code
    const { code } = generateSecureOTP();

    // Save SHA-256 Hashed OTP Entry with 10-minute TTL (Never store plain-text)
    const { expiresAt } = saveOTPEntry({
      identifier: parsed.normalizedIdentifier,
      type: parsed.type,
      otpCode: code,
      ttlMinutes: 10,
    });

    // 4. Multi-Channel Dispatch (Email vs SMS/WhatsApp)
    let dispatchInfo: any = null;

    if (parsed.type === 'email') {
      dispatchInfo = await sendOTPEmail({
        toEmail: parsed.normalizedIdentifier,
        recipientName: parsed.normalizedIdentifier.split('@')[0],
        otpCode: code,
        purpose: 'REGISTRATION',
      });
    } else {
      dispatchInfo = await sendSMSOTP({
        mobileNumber: parsed.normalizedIdentifier,
        otpCode: code,
        channel: 'SMS',
      });
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit OTP code has been dispatched to your ${parsed.type === 'email' ? 'Email Address' : 'Mobile Number'} (${parsed.formattedDisplay}).`,
      identifier: parsed.normalizedIdentifier,
      identifierType: parsed.type,
      expiresInSeconds: 600,
      dispatchInfo,
      otpDemoCode: code, // Rendered for developer demo convenience
    });
  } catch (err: any) {
    console.error('Error in POST /api/v1/auth/send-otp:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
