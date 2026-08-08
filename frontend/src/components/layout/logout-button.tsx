'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOutIcon } from './icons';

export default function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title="Log out"
      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-600 transition-colors hover:bg-black/[.04] disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-white/[.08]"
    >
      <LogOutIcon className="h-4 w-4 shrink-0" />
      {!collapsed && (loading ? 'Signing out…' : 'Log out')}
    </button>
  );
}
