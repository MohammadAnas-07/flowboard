import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/constants';
import LogoutButton from './logout-button';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  isGuest: boolean;
}

async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieHeader = (await headers()).get('cookie') ?? '';
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const { user } = (await res.json()) as { user: AuthUser };
  return user;
}

export default async function TasksPage() {
  const user = await getCurrentUser();

  // Middleware already checks for a session cookie, but doesn't verify the
  // JWT signature (no shared secret on the frontend) — this is the real
  // check, backed by the backend's AuthGuard.
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          Flowboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {user.name ?? user.email}
            {user.isGuest && ' (guest)'}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Task board — TODO, not built yet.
        </p>
      </main>
    </div>
  );
}
