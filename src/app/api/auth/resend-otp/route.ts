import { NextResponse } from 'next/server';
import { parseAndValidateIdentifier } from '@/lib/identifierDetector';
import { checkOTPRateLimit, checkResendCooldown, saveOTPEntry } from '@/lib/otpStore';
import { generateSecureOTP } from '@/lib/authServer';
import { sendOTPEmail } from '@/lib/emailService';
import { sendSMSOTP } from '@/lib/smsService';

/**
 * POST /api/auth/resend-otp
 * Step 1: Check 60-second Resend Cooldown.
 * Step 2: Rate Limiting Check.
 * Step 3: Generate completely NEW 6-Digit OTP, invalidate old OTP, reset attempt counter to 0.
 * Step 4: Dispatch new OTP to email.
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

    const parsed = parseAndValidateIdentifier(identifier);
    if (!parsed.isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid contact identifier format.' },
        { status: 400 }
      );
    }

    // 1. Check 60-second Resend Cooldown
    const cooldownCheck = checkResendCooldown(parsed.normalizedIdentifier, 60);
    if (!cooldownCheck.canResend) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${cooldownCheck.cooldownRemainingSec} seconds before requesting a new OTP.`,
          cooldownRemainingSec: cooldownCheck.cooldownRemainingSec,
        },
        { status: 429 }
      );
    }

    // 2. Check Rate Limit (Max 3 OTP requests per 10 mins)
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

    // 3. Generate NEW Cryptographic 6-Digit OTP
    const { code } = generateSecureOTP();

    // Invalidate old OTP & save new entry with 0 attempts & 5-min TTL
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

    return NextResponse.json({
      success: true,
      message: `A new OTP has been sent to your ${parsed.type === 'email' ? 'email' : 'mobile'} (${parsed.formattedDisplay}).`,
      email: parsed.type === 'email' ? parsed.normalizedIdentifier : undefined,
      identifier: parsed.normalizedIdentifier,
      expiresInSeconds: 300,
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/resend-otp:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
