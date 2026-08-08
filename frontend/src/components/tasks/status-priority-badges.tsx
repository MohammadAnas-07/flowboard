import { Badge } from '@/components/ui/badge';
import { PRIORITY_LABELS, STATUS_LABELS, type Priority, type Status } from '@/lib/types';

const PRIORITY_DOT: Record<Priority, string> = {
  NO_PRIORITY: 'bg-zinc-300 dark:bg-zinc-600',
  URGENT: 'bg-red-500',
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

export function DueDateBadge({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const overdue = date.getTime() < Date.now();
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
