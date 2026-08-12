'use client';

import React, { useEffect, useState } from 'react';
import { LogIn } from 'lucide-react';

interface GoogleOAuthButtonProps {
  onSuccess: (user: any, accessToken: string) => void;
  onError: (errorMsg: string) => void;
  buttonText?: string;
}

export default function GoogleOAuthButton({
  onSuccess,
  onError,
  buttonText = 'Continue with Google',
}: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google GIS script dynamically if not already loaded
    if (typeof window !== 'undefined' && !(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // 1. If Google GIS API is loaded on client window
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1234567890-tripmandi.apps.googleusercontent.com',
          callback: async (response: any) => {
            if (response.credential) {
              await submitGoogleToken(response.credential);
            } else {
              onError('Google authentication failed.');
              setLoading(false);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } else {
        // Fallback SSO simulation for development / demo
        await submitGoogleToken(`demo_gtoken_${Date.now()}`);
      }
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      onError(err.message || 'Google authentication error.');
      setLoading(false);
    }
  };

  const submitGoogleToken = async (credentialToken: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialToken }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data.user, data.accessToken);
      } else {
        onError(data.error || 'Google login verification failed.');
      }
    } catch (err: any) {
      onError('Network error during Google authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-extrabold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-3 active:scale-98 cursor-pointer disabled:opacity-50"
    >
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loading ? 'Authenticating with Google...' : buttonText}</span>
    </button>
  );
}
