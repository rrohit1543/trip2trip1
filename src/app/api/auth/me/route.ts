import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/authServer';

/**
 * GET /api/auth/me
 * Validates backend HTTP-only session cookie / JWT token and returns authenticated user metadata.
 */
export async function GET(request: Request) {
  try {
    const cookies = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';
    
    // Extract token from cookie or Auth header
    let token = '';
    const match = cookies.match(/session_token=([^;]+)/) || cookies.match(/accessToken=([^;]+)/);
    if (match) {
      token = match[1];
    } else if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Unauthorized. No active session token found.' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Session token expired or invalid.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: payload.userId,
        user_id: payload.userId,
        email: payload.email,
        email_verified: true,
        role: payload.role,
        last_login: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Authentication validation error.' },
      { status: 401 }
    );
  }
}
