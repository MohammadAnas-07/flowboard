'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import { CheckIcon } from '@/components/layout/icons';

export interface MultiSelectOption {
  key: string;
  label: string;
}

interface MultiSelectDropdownProps {
  trigger: ReactNode;
  options: MultiSelectOption[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  align?: 'start' | 'end';
}

/**
 * Generic Radix-based multi-select checkbox dropdown. Originally written
 * just for the task list's "Fields" column toggle (see FieldsDropdown);
 * pulled out as a shared primitive so the task detail page's label picker
 * can reuse the exact same open/close, keyboard-nav, and checkbox-item
 * behavior instead of a second dropdown implementation.
 */
export function MultiSelectDropdown({
  trigger,
  options,
  selected,
  onToggle,
  align = 'end',
}: MultiSelectDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-[180px] rounded-lg border border-black/[.08] bg-white p-1 shadow-lg dark:border-white/[.145] dark:bg-zinc-900"
        >
          {options.map((option) => (
            <DropdownMenu.CheckboxItem
              key={option.key}
              checked={selected.has(option.key)}
              onCheckedChange={() => onToggle(option.key)}
              onSelect={(e) => e.preventDefault()}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 outline-none data-[highlighted]:bg-black/[.04] dark:text-zinc-300 dark:data-[highlighted]:bg-white/[.08]"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded border border-black/[.15] dark:border-white/[.2]">
                <DropdownMenu.ItemIndicator>
                  <CheckIcon className="h-3 w-3" />
                </DropdownMenu.ItemIndicator>
              </span>
              {option.label}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
