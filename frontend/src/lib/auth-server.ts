import { headers } from 'next/headers';
import { API_URL } from './constants';
import type { User } from './types';

// Server-side only — uses the absolute backend URL with a manually forwarded
// cookie header, since server component fetches don't go through the
// browser (the /api/* rewrite in next.config.ts only applies to requests
// the browser itself makes). Client components/pages should use lib/api.ts
// instead, which goes through the relative-path rewrite.
export async function getCurrentUser(): Promise<User | null> {
  const cookieHeader = (await headers()).get('cookie') ?? '';
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const { user } = (await res.json()) as { user: User };
  return user;
}
