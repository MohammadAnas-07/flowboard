'use client';

import { SlidersIcon } from '@/components/layout/icons';
import { MultiSelectDropdown, type MultiSelectOption } from './multi-select-dropdown';

export type FieldOption = MultiSelectOption;

interface FieldsDropdownProps {
  fields: FieldOption[];
  visible: Set<string>;
  onToggle: (key: string) => void;
}

/** Column-visibility toggle for the task list view — thin wrapper around the
 * shared MultiSelectDropdown primitive (also used by the task detail page's
 * label picker). */
export function FieldsDropdown({ fields, visible, onToggle }: FieldsDropdownProps) {
  return (
    <MultiSelectDropdown
      options={fields}
      selected={visible}
      onToggle={onToggle}
      trigger={
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-black/[.08] px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
        >
          <SlidersIcon className="h-3.5 w-3.5" />
          Fields
        </button>
      }
    />
  );
}
