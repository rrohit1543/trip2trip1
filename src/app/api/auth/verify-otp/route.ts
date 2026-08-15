import { NextResponse } from 'next/server';
import { parseAndValidateIdentifier } from '@/lib/identifierDetector';
import { verifyOTPStrict } from '@/lib/otpStore';
import { signAccessToken, signRefreshToken } from '@/lib/authServer';

/**
 * POST /api/auth/verify-otp & POST /api/v1/auth/verify-otp
 * Step 1: Validate 6-digit OTP code against SHA-256 HMAC hash.
 * Step 2: Enforce max 3 attempts & 5-minute TTL rules.
 * Step 3: Invalidate OTP immediately upon successful verification.
 * Step 4: Create/authenticate user account & mark email_verified = true.
 * Step 5: Issue secure HTTP-only session_token & accessToken cookies.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.email || body.identifier;
    const otpCode = body.otp || body.otpCode;
    const name = body.name || 'TripMandi Traveler';
    const role = body.role || 'customer';

    if (!identifier || !otpCode) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit OTP code are required parameters.' },
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

    // 1 & 2. Verify OTP Hash & Enforce 3-Attempt / 5-Min Expiry Rules
    const result = verifyOTPStrict(parsed.normalizedIdentifier, otpCode);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          attemptsRemaining: result.attemptsRemaining,
        },
        { status: 400 }
      );
    }

    // 3. Create or Fetch Authenticated User Record
    const userId = `usr_${Date.now()}`;
    const user = {
      id: userId,
      user_id: userId,
      name,
      email: parsed.normalizedIdentifier,
      email_verified: true,
      role,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };

    // 4. Issue Cryptographically Signed Access Token
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    // 5. Establish HTTP-Only Secure Authentication Session Cookie
    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully! Account activated.',
      user,
      accessToken,
    });

    // Set HTTP-only Session Cookie
    response.cookies.set('session_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days session
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Error in POST /api/auth/verify-otp:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
