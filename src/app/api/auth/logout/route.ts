import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Properly invalidates the authentication session by clearing HTTP-only cookies.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully. Authentication session invalidated.',
  });

  // Clear HTTP-Only cookies
  response.cookies.set('session_token', '', { path: '/', maxAge: 0 });
  response.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
  response.cookies.set('refreshToken', '', { path: '/', maxAge: 0 });

  return response;
}
