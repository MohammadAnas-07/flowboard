'use client';

import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';

interface DateRangePickerProps {
  startDate: string | null;
  dueDate: string | null;
  onChange: (startDate: string | null, dueDate: string | null) => void;
}

function formatDate(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Month-view range popover for the Details panel's Dates field. */
export function DateRangePicker({ startDate, dueDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const range: DateRange = {
    from: startDate ? new Date(startDate) : undefined,
    to: dueDate ? new Date(dueDate) : undefined,
  };

  function handleSelect(next: DateRange | undefined) {
    onChange(next?.from ? next.from.toISOString() : null, next?.to ? next.to.toISOString() : null);
  }

  const label =
    range.from && range.to
      ? `${formatDate(range.from)} – ${formatDate(range.to)}`
      : range.from
        ? formatDate(range.from)
        : 'Set dates';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="rounded-md border border-black/[.08] px-2 py-1 text-left text-sm text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
        >
          {label}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 rounded-lg border border-black/[.08] bg-white p-2 shadow-lg dark:border-white/[.145] dark:bg-zinc-900"
        >
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={1}
            className="flowboard-daypicker"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
