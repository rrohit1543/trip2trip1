import { NextResponse } from 'next/server';
import { verifyOTPHash, hashPasswordServer, signAccessToken, signRefreshToken } from '../../../../lib/authServer';
import { getPendingOTPEntry, clearPendingOTPEntry } from '../signup/route';

/**
 * POST /api/auth/verify-otp
 * Step 4 & 5: Validate 6-digit OTP code, hash password using bcrypt/crypto,
 * set isEmailVerified = true, and issue JWT tokens in HttpOnly cookies.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otpCode } = body;

    if (!email || !otpCode) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit OTP code are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingEntry = getPendingOTPEntry(normalizedEmail);

    if (!pendingEntry) {
      return NextResponse.json(
        { success: false, error: 'No pending OTP registration session found for this email. Please request a new OTP.' },
        { status: 404 }
      );
    }

    // Check Expiry (10-minute TTL)
    if (Date.now() > pendingEntry.expiresAt) {
      clearPendingOTPEntry(normalizedEmail);
      return NextResponse.json(
        { success: false, error: 'OTP code has expired (10-minute limit). Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Validate Cryptographic Hash
    const isValid = verifyOTPHash(otpCode, pendingEntry.otpHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid 6-digit OTP code provided. Please try again.' },
        { status: 400 }
      );
    }

    // Hash Password & Create Verified Account Document
    const { tempUserData } = pendingEntry;
    const passwordHash = hashPasswordServer(tempUserData.password);

    const newUser = {
      id: `usr_${Date.now()}`,
      name: tempUserData.name,
      email: normalizedEmail,
      phone: tempUserData.phone,
      authProvider: 'local',
      role: tempUserData.role || 'customer',
      isEmailVerified: true, // Account activated
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString(),
    };

    // Clear temporary OTP registration session
    clearPendingOTPEntry(normalizedEmail);

    // Issue JWT Access & Refresh Tokens
    const accessToken = signAccessToken({ userId: newUser.id, email: newUser.email, role: newUser.role });
    const refreshToken = signRefreshToken({ userId: newUser.id });

    const response = NextResponse.json({
      success: true,
      message: 'Email address verified & account successfully activated!',
      user: newUser,
      accessToken,
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
