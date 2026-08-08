import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { getCurrentUser } from '@/lib/auth-server';
import type { ReactNode } from 'react';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  // proxy.ts already checks for a session cookie, but doesn't verify the JWT
  // signature (no shared secret on the frontend) — this is the real check,
  // backed by the backend's AuthGuard.
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      <Sidebar user={user} />
      {/* pt-14 clears the fixed hamburger button below md — the sidebar is
          an off-canvas drawer there, not part of the flex row, so nothing
          else reserves that space. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden pt-14 md:pt-0">{children}</div>
    </div>
  );
}
