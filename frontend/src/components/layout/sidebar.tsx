'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';
import { ChecklistIcon, ChevronLeftIcon, ChevronRightIcon, FolderIcon } from './icons';
import LogoutButton from './logout-button';
import { UserMenu } from './user-menu';

const COLLAPSE_KEY = 'flowboard:sidebar-collapsed';

const NAV_ITEMS = [
  { href: '/tasks', label: 'Tasks', icon: ChecklistIcon },
  { href: '/projects', label: 'Projects', icon: FolderIcon },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === 'true');
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  }

  // Avoid a flash of the wrong width before localStorage is read.
  if (!hydrated) {
    return <div className="w-56 shrink-0" />;
  }

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-black/[.08] bg-white transition-[width] duration-150 dark:border-white/[.145] dark:bg-zinc-950 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <UserMenu user={user} collapsed={collapsed} />

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
            Workspace
          </div>
        )}
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.08]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-black/[.08] px-2 py-2 dark:border-white/[.145]">
        <LogoutButton collapsed={collapsed} />
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-500 transition-colors hover:bg-black/[.04] dark:text-zinc-500 dark:hover:bg-white/[.08]"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeftIcon className="h-4 w-4 shrink-0" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
