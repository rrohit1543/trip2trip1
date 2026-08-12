import { NextResponse } from 'next/server';
import { checkRateLimit, hashPasswordServer, signAccessToken, signRefreshToken } from '../../../../lib/authServer';

/**
 * POST /api/auth/login
 * Standard Email & Password Authentication endpoint.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Enforce Rate Limiting (5 attempts per 15 mins)
    const rateCheck = checkRateLimit(`login_${normalizedEmail}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many failed login attempts. Try again in ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const inputHash = hashPasswordServer(password);

    // Mock User Authentication lookup
    const user = {
      id: `usr_${Date.now()}`,
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: '+91 9876543210',
      authProvider: 'local',
      role: normalizedEmail.includes('admin') ? 'admin' : 'customer',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString(),
    };

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user,
      accessToken,
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Error in POST /api/auth/login:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
