'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import { CheckIcon } from '@/components/layout/icons';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectDropdownProps {
  trigger: ReactNode;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  align?: 'start' | 'end';
}

/**
 * Generic Radix single-select dropdown (checkmark on the current value) —
 * shares the same Portal/Content styling as MultiSelectDropdown, just backed
 * by RadioGroup/RadioItem instead of checkboxes. Used for the task detail
 * page's Status and Priority pickers.
 */
export function SelectDropdown({
  trigger,
  options,
  value,
  onChange,
  align = 'start',
}: SelectDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-[180px] rounded-lg border border-black/[.08] bg-white p-1 shadow-lg dark:border-white/[.145] dark:bg-zinc-900"
        >
          <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenu.RadioItem
                key={option.value}
                value={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 outline-none data-[highlighted]:bg-black/[.04] dark:text-zinc-300 dark:data-[highlighted]:bg-white/[.08]"
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  <DropdownMenu.ItemIndicator>
                    <CheckIcon className="h-3.5 w-3.5" />
                  </DropdownMenu.ItemIndicator>
                </span>
                {option.icon}
                {option.label}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
