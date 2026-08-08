'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { ColorModeOptions, ThemeModeOptions } from './theme-options';
import { ChevronDownIcon, ChevronRightIcon } from './icons';

const MENU_ITEM_CLASS =
  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 outline-none data-[highlighted]:bg-black/[.04] dark:text-zinc-300 dark:data-[highlighted]:bg-white/[.08]';

const CONTENT_CLASS =
  'z-50 min-w-[190px] rounded-lg border border-black/[.08] bg-white p-1 shadow-lg dark:border-white/[.145] dark:bg-zinc-900';

export function UserMenu({ user, collapsed }: { user: User; collapsed: boolean }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 border-b border-black/[.08] px-3 py-3 text-left transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.08]"
        >
          <Avatar user={user} size="sm" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-sm font-medium text-black dark:text-zinc-50">
                {user.name ?? user.email}
              </span>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-zinc-400" />
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" side="top" sideOffset={6} className={CONTENT_CLASS}>
          <div className="flex items-center gap-2 border-b border-black/[.06] px-2 py-2 dark:border-white/[.08]">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-black dark:text-zinc-50">
                {user.name ?? user.email}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">{user.email}</p>
            </div>
          </div>

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={`${MENU_ITEM_CLASS} mt-1 justify-between`}>
              Change Theme
              <ChevronRightIcon className="h-3.5 w-3.5 text-zinc-400" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent sideOffset={4} className={CONTENT_CLASS}>
                <ThemeModeOptions
                  renderOption={({ key, onSelect, content }) => (
                    <DropdownMenu.Item key={key} onSelect={onSelect} className={MENU_ITEM_CLASS}>
                      {content}
                    </DropdownMenu.Item>
                  )}
                />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={`${MENU_ITEM_CLASS} justify-between`}>
              Color Mode
              <ChevronRightIcon className="h-3.5 w-3.5 text-zinc-400" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent sideOffset={4} className={CONTENT_CLASS}>
                <ColorModeOptions
                  renderOption={({ key, onSelect, content }) => (
                    <DropdownMenu.Item key={key} onSelect={onSelect} className={MENU_ITEM_CLASS}>
                      {content}
                    </DropdownMenu.Item>
                  )}
                />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator className="my-1 h-px bg-black/[.06] dark:bg-white/[.08]" />

          <DropdownMenu.Item asChild className={MENU_ITEM_CLASS}>
            <Link href="/settings">Settings</Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
