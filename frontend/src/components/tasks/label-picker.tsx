'use client';

import { useEffect, useState } from 'react';
import { PlusIcon } from '@/components/layout/icons';
import { MultiSelectDropdown } from '@/components/shared/multi-select-dropdown';
import { getLabels } from '@/lib/api';
import type { Label } from '@/lib/types';
import { LabelPill } from './status-priority-badges';

interface LabelPickerProps {
  selectedLabels: Label[];
  onChange: (labelIds: string[]) => void;
}

/** Multi-select label picker — reuses MultiSelectDropdown (the same
 * primitive behind the task list's Fields dropdown) rather than a second
 * dropdown implementation. Used both in the task detail page's Labels row
 * and its Details sidebar. */
export function LabelPicker({ selectedLabels, onChange }: LabelPickerProps) {
  const [allLabels, setAllLabels] = useState<Label[]>([]);

  useEffect(() => {
    getLabels().then(setAllLabels).catch(() => {});
  }, []);

  const selectedIds = new Set(selectedLabels.map((l) => l.id));

  function toggle(labelId: string) {
    const next = selectedIds.has(labelId)
      ? selectedLabels.filter((l) => l.id !== labelId).map((l) => l.id)
      : [...selectedLabels.map((l) => l.id), labelId];
    onChange(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {selectedLabels.map((label) => (
        <LabelPill key={label.id} name={label.name} />
      ))}
      <MultiSelectDropdown
        options={allLabels.map((l) => ({ key: l.id, label: l.name }))}
        selected={selectedIds}
        onToggle={toggle}
        align="start"
        trigger={
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-dashed border-black/[.15] px-2 py-0.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-black/[.04] dark:border-white/[.2] dark:text-zinc-400 dark:hover:bg-white/[.08]"
          >
            <PlusIcon className="h-3 w-3" />
            Label
          </button>
        }
      />
    </div>
  );
}
