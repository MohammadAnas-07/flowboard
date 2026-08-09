'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  notifyStoredPreferenceChange,
  useHasHydrated,
  useStoredPreference,
} from '@/lib/stored-preference';
import type { User } from '@/lib/types';
import { ChecklistIcon, ChevronLeftIcon, ChevronRightIcon, FolderIcon, MenuIcon, XIcon } from './icons';
import LogoutButton from './logout-button';
import { UserMenu } from './user-menu';

const COLLAPSE_KEY = 'flowboard:sidebar-collapsed';

function parseCollapsed(raw: string | null): boolean {
  return raw === 'true';
}

const NAV_ITEMS = [
  { href: '/tasks', label: 'Tasks', icon: ChecklistIcon },
  { href: '/projects', label: 'Projects', icon: FolderIcon },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const collapsed = useStoredPreference(COLLAPSE_KEY, parseCollapsed, false);
  const hydrated = useHasHydrated();
  // Below md (768px) the sidebar isn't a persistent rail at all — it's an
  // off-canvas drawer opened via a hamburger button, closed by default.
  // `collapsed` (the icon-only rail) is a desktop-only concept; on mobile
  // the drawer is always shown full-width when open, regardless of the
  // desktop collapse preference.
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock background scroll while the mobile drawer is open — it renders on
  // top of the page as an overlay, so the page shouldn't scroll behind it.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    // localStorage is the source of truth now, so write first and let the
    // subscription push the new value back into render.
    localStorage.setItem(COLLAPSE_KEY, String(!collapsed));
    notifyStoredPreferenceChange();
  }

  // Avoid a flash of the wrong width before localStorage is read. Nothing
  // to reserve on mobile — the drawer starts closed and off-canvas either way.
  if (!hydrated) {
    return <div className="hidden shrink-0 md:block md:w-56" />;
  }

  const iconOnly = collapsed && !mobileOpen;

  return (
    <>
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="fixed left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-black/[.08] bg-white text-zinc-600 shadow-sm md:hidden dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-300"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      )}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-black/[.08] bg-white transition-transform duration-200 dark:border-white/[.145] dark:bg-zinc-950 md:static md:z-auto md:w-56 md:translate-x-0 md:transition-[width] md:duration-150 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${iconOnly ? 'md:w-16' : ''}`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-black/[.04] md:hidden dark:hover:bg-white/[.08]"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <UserMenu user={user} collapsed={iconOnly} />

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {!iconOnly && (
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
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent/10 text-accent'
                      : 'text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.08]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!iconOnly && item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-black/[.08] px-2 py-2 dark:border-white/[.145]">
          <LogoutButton collapsed={iconOnly} />
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="mt-1 hidden w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-500 transition-colors hover:bg-black/[.04] md:flex dark:text-zinc-500 dark:hover:bg-white/[.08]"
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
    </>
  );
}
