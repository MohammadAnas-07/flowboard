'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { API_URL } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuestLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/guest`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Guest login failed');
      }
      router.push('/tasks');
      router.refresh();
    } catch {
      setError('Could not sign in as guest. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Flowboard
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to view and manage your tasks.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Google login is not implemented in this assessment build"
            className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-black/[.08] bg-zinc-100 px-5 text-sm font-medium text-zinc-400 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-600"
          >
            <GoogleIcon />
            Login with Google
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? 'Signing in…' : 'Continue as Guest'}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
          By continuing, you agree to Flowboard&apos;s{' '}
          <span className="underline underline-offset-2">Terms of Service</span>{' '}
          and{' '}
          <span className="underline underline-offset-2">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
