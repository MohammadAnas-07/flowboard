'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon, SlidersIcon } from '@/components/layout/icons';

export interface FieldOption {
  key: string;
  label: string;
}

interface FieldsDropdownProps {
  fields: FieldOption[];
  visible: Set<string>;
  onToggle: (key: string) => void;
}

/**
 * Generic column-visibility toggle. Currently used by the Tasks list view;
 * written to take an arbitrary field list so it's reusable anywhere else a
 * table needs the same "Fields" affordance.
 */
export function FieldsDropdown({ fields, visible, onToggle }: FieldsDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-black/[.08] px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
        >
          <SlidersIcon className="h-3.5 w-3.5" />
          Fields
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[180px] rounded-lg border border-black/[.08] bg-white p-1 shadow-lg dark:border-white/[.145] dark:bg-zinc-900"
        >
          {fields.map((field) => (
            <DropdownMenu.CheckboxItem
              key={field.key}
              checked={visible.has(field.key)}
              onCheckedChange={() => onToggle(field.key)}
              onSelect={(e) => e.preventDefault()}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 outline-none data-[highlighted]:bg-black/[.04] dark:text-zinc-300 dark:data-[highlighted]:bg-white/[.08]"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded border border-black/[.15] dark:border-white/[.2]">
                <DropdownMenu.ItemIndicator>
                  <CheckIcon className="h-3 w-3" />
                </DropdownMenu.ItemIndicator>
              </span>
              {field.label}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
