'use client';

import { useSyncExternalStore } from 'react';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_LABELS, STATUS_LABELS, type Priority, type Status } from '@/lib/types';

// Urgent uses the accent color (the "priority-high accent" the theme system
// spec calls out) — the rest stay fixed semantic colors, since having every
// priority level shift with the user's accent choice would make them
// harder to tell apart at a glance, not easier.
const PRIORITY_DOT: Record<Priority, string> = {
  NO_PRIORITY: 'bg-zinc-300 dark:bg-zinc-600',
  URGENT: 'bg-accent',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge>
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[priority]}`} />
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return <Badge>{STATUS_LABELS[status]}</Badge>;
}

// "Now" isn't a pure render input — server and client read it at different
// moments and would disagree on first paint. useSyncExternalStore keeps the
// read outside render: the server snapshot is null so nothing renders as
// overdue, and hydration fills in the real value. The snapshot is midnight,
// so repeated calls return the same number and don't re-render in a loop.
const subscribeToNothing = () => () => {};

function useStartOfToday(): number | null {
  return useSyncExternalStore(
    subscribeToNothing,
    () => new Date().setHours(0, 0, 0, 0),
    () => null,
  );
}

export function DueDateBadge({ dueDate }: { dueDate: string | null }) {
  const startOfToday = useStartOfToday();
  if (!dueDate) return null;
  const date = new Date(dueDate);
  // Day-granular: a task due later today isn't overdue yet. Comparing against
  // the exact current instant would make the badge flip mid-session and
  // couldn't be read outside render without re-rendering on every tick.
  const overdue = startOfToday !== null && date.getTime() < startOfToday;
  return (
    <Badge className={overdue ? 'border-red-200 text-red-600 dark:border-red-900 dark:text-red-400' : ''}>
      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
    </Badge>
  );
}

export function LabelPill({ name }: { name: string }) {
  return (
    <Badge className="bg-zinc-100 dark:bg-zinc-900">{name}</Badge>
  );
}
