import { PRIORITY_LABELS, STATUS_LABELS, type ActivityField, type Priority, type Status, type TaskActivity } from '@/lib/types';

function formatValue(field: ActivityField, value: string | null): string {
  if (value === null) return 'none';
  switch (field) {
    case 'status':
      return STATUS_LABELS[value as Status] ?? value;
    case 'priority':
      return PRIORITY_LABELS[value as Priority] ?? value;
    case 'startDate':
    case 'dueDate':
      return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    default:
      return value;
  }
}

const FIELD_LABELS: Record<ActivityField, string> = {
  status: 'status',
  priority: 'priority',
  startDate: 'start date',
  dueDate: 'due date',
  assignee: 'assignee',
};

function formatEntry(entry: TaskActivity): string {
  const field = FIELD_LABELS[entry.field];
  const from = formatValue(entry.field, entry.oldValue);
  const to = formatValue(entry.field, entry.newValue);
  return `changed ${field} from ${from} to ${to}`;
}

function formatTimestamp(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function ActivityLog({ entries }: { entries: TaskActivity[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-zinc-400 dark:text-zinc-600">No updates yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.id} className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-700 dark:text-zinc-300">{formatEntry(entry)}</span>
          <span className="ml-1.5 text-zinc-400 dark:text-zinc-600">· {formatTimestamp(entry.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}
